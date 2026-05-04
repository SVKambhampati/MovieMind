import logging
import os
import time
import threading
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

load_dotenv()

from models import db
from auth import auth_bp
from profile import profile_bp
import tmdb
import omdb

# ML stack is optional — not available on Vercel (not needed: TMDB handles recs)
try:
    from preprocessing import preprocess
    from recommender import HybridRecommender
    HAS_ML = True
except ImportError:
    HAS_ML = False
    logger_pre = logging.getLogger(__name__)
    logger_pre.info('ML stack not available — running in TMDB-only mode')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s: %(message)s',
)
logger = logging.getLogger(__name__)

app = Flask(
    __name__,
    static_folder=os.path.join(os.path.dirname(__file__), '..', 'frontend'),
    static_url_path='',
    instance_relative_config=True,
)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'moviemind-dev-secret-change-in-prod')

# Vercel's filesystem is read-only except /tmp; use /tmp for SQLite there
_db_dir = '/tmp' if os.environ.get('VERCEL_ENV') else app.instance_path
os.makedirs(_db_dir, exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{_db_dir}/moviemind.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_HTTPONLY'] = True

db.init_app(app)

app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)

CORS(app, supports_credentials=True)

with app.app_context():
    db.create_all()

# ---------------------------------------------------------------------------
# Global state
# ---------------------------------------------------------------------------
_data: dict | None = None
_recommender = None
_rec_cache: dict[str, list] = {}


def get_data():
    global _data
    if not HAS_ML:
        return None
    if _data is None:
        t0 = time.time()
        _data = preprocess()
        logger.info(f'Data ready in {time.time()-t0:.1f}s')
    return _data


def get_recommender():
    global _recommender
    if not HAS_ML:
        return None
    if _recommender is None:
        _recommender = HybridRecommender(get_data())
    return _recommender


if HAS_ML and not os.environ.get('VERCEL_ENV'):
    threading.Thread(target=get_recommender, daemon=True).start()

# ---------------------------------------------------------------------------
# Static
# ---------------------------------------------------------------------------

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')


# ---------------------------------------------------------------------------
# Recommendation search (TMDB-powered)
# ---------------------------------------------------------------------------

@app.route('/api/search')
def search():
    query = request.args.get('query', '').strip()
    if not query or len(query) < 2:
        return jsonify([])
    try:
        results, _ = tmdb.search(query, page=1)
        return jsonify(results[:8])
    except Exception as e:
        logger.warning(f'TMDB search failed: {e}')
        return jsonify([])


# ---------------------------------------------------------------------------
# Recommendations
# ---------------------------------------------------------------------------

@app.route('/api/recommend', methods=['POST'])
def recommend():
    body = request.get_json(force=True, silent=True) or {}
    liked = body.get('liked', [])
    page = int(body.get('page', 1))
    per_page = int(body.get('per_page', 12))

    if not liked:
        return _cold_start_response(page, per_page)

    # Build set of liked TMDB ids to exclude from results
    liked_tmdb_ids = {int(m.get('tmdb_id') or m.get('id')) for m in liked if m.get('tmdb_id') or m.get('id')}

    cache_key = 'tmdb:' + ','.join(str(i) for i in sorted(liked_tmdb_ids))
    if cache_key in _rec_cache:
        all_recs = _rec_cache[cache_key]
    else:
        seen_ids: set[int] = set(liked_tmdb_ids)
        # scored_recs: list of (score, movie_dict)
        scored: list[tuple[float, dict]] = []

        for m in liked:
            tid = m.get('tmdb_id') or m.get('id')
            if not tid:
                continue
            tid = int(tid)
            title = m.get('title', 'this')
            lang = m.get('original_language') or 'en'
            genre_ids = m.get('genre_ids') or []

            # Fetch movie details to get original_language, genre_ids, and
            # belongs_to_collection (franchise sequels/prequels)
            collection_id = None
            try:
                detail_raw = tmdb._get(f'/movie/{tid}', {'language': 'en-US'}, ttl=86400)
                if not m.get('original_language'):
                    lang = detail_raw.get('original_language', 'en')
                if not genre_ids:
                    genre_ids = [g['id'] for g in detail_raw.get('genres', [])]
                coll = detail_raw.get('belongs_to_collection')
                if coll:
                    collection_id = coll['id']
            except Exception:
                pass

            def _add(recs, base_score):
                for r in recs:
                    rid = r.get('id') or r.get('tmdb_id')
                    if not rid or rid in seen_ids:
                        continue
                    seen_ids.add(rid)
                    va = float(r.get('vote_average') or 0)
                    vc = float(r.get('vote_count') or 0)
                    # Normalise vote confidence — cap higher for non-English
                    # markets which have fewer TMDB votes
                    vote_cap = 1000 if lang != 'en' else 5000
                    quality = va * min(vc, vote_cap) / vote_cap
                    # Penalise language mismatches so filler doesn't surface
                    lang_match = 1.0 if r.get('original_language') == lang else 0.25
                    score = base_score * quality * lang_match
                    r['reason'] = f'Because you liked {title}'
                    scored.append((score, r))

            # Franchise movies (sequels/prequels) always surface first
            if collection_id:
                try:
                    coll_movies = tmdb.get_collection(collection_id)
                    _add(coll_movies, 5.0)
                except Exception as e:
                    logger.warning(f'collection fetch failed for {collection_id}: {e}')

            if lang == 'en':
                # For English movies, TMDB /recommendations is movie-specific
                # and culturally correct. /discover with lang=en just returns
                # the global popularity chart (LOTR, Avengers, etc.) which is
                # useless as a personalised signal.
                try:
                    tmdb_recs, _ = tmdb.movie_recommendations(tid)
                    _add(tmdb_recs, 1.0)
                    if len(tmdb_recs) < 10:
                        _add(tmdb.movie_similar(tid), 0.8)
                except Exception as e:
                    logger.warning(f'TMDB recs failed for {tid}: {e}')
            else:
                # For non-English movies, /recommendations returns English
                # filler. Language discovery is the only reliable signal.
                try:
                    lang_recs = tmdb.discover_by_language_genre(lang, genre_ids)
                    lang_recs2 = tmdb.discover_by_language_genre(lang, genre_ids, page=2)
                    _add(lang_recs + lang_recs2, 1.2)
                except Exception as e:
                    logger.warning(f'discover lang/genre failed for {tid}: {e}')

        # Sort by blended score descending
        scored.sort(key=lambda x: x[0], reverse=True)
        all_recs = [r for _, r in scored]

        if len(_rec_cache) < 500:
            _rec_cache[cache_key] = all_recs

    # If TMDB returned nothing (no token, network error), fall back to local hybrid
    if not all_recs:
        liked_ids, liked_ratings = _resolve_liked(liked)
        if liked_ids:
            rec = get_recommender()
            all_recs = rec.recommend(liked_ids, liked_ratings or None, n=50)
            for r in all_recs:
                r.setdefault('poster', None)
                if not r.get('poster') and r.get('tmdb_id'):
                    r['poster'] = tmdb.get_poster_url(int(r['tmdb_id']))
        else:
            return _cold_start_response(page, per_page)

    total = len(all_recs)
    start = (page - 1) * per_page
    page_recs = all_recs[start:start + per_page]

    return jsonify({
        'recommendations': page_recs,
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': max(1, (total + per_page - 1) // per_page),
    })


def _cold_start_response(page: int, per_page: int) -> object:
    try:
        movies = tmdb.trending('week')
    except Exception:
        rec = get_recommender()
        movies = rec.get_trending(per_page)
    total = len(movies)
    start = (page - 1) * per_page
    page_recs = movies[start:start + per_page]
    for r in page_recs:
        r['reason'] = r.get('reason', 'Trending this week')
    return jsonify({
        'recommendations': page_recs,
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': max(1, (total + per_page - 1) // per_page),
    })


def _resolve_liked(liked: list) -> tuple[list[int], dict[int, float]]:
    """Map TMDB ids from the client back to internal dataset IDs."""
    data = get_data()
    if data is None:
        return [], {}
    movies_df = data['movies']
    liked_ids, liked_ratings = [], {}

    for m in liked:
        tmdb_id = m.get('tmdb_id') or m.get('id')
        rating = float(m['rating']) if 'rating' in m else None

        # Try matching by tmdb_id column first
        if tmdb_id:
            row = movies_df[movies_df['tmdb_id'] == tmdb_id]
            if not row.empty:
                internal_id = int(row.iloc[0]['id'])
                liked_ids.append(internal_id)
                if rating:
                    liked_ratings[internal_id] = rating
                continue

        # Fallback: title match
        title = m.get('title', '').lower()
        row = movies_df[movies_df['title'].str.lower() == title]
        if not row.empty:
            internal_id = int(row.iloc[0]['id'])
            liked_ids.append(internal_id)
            if rating:
                liked_ratings[internal_id] = rating

    return liked_ids, liked_ratings


@app.route('/api/trending')
def rec_trending():
    n = int(request.args.get('n', 10))
    rec = get_recommender()
    if rec is None:
        movies = tmdb.trending('week')[:n]
        return jsonify(movies)
    movies = rec.get_trending(n)

    def _enrich(m):
        m.setdefault('poster', None)
        if not m.get('poster') and m.get('tmdb_id'):
            m['poster'] = tmdb.get_poster_url(int(m['tmdb_id']))

    with ThreadPoolExecutor(max_workers=6) as ex:
        list(ex.map(_enrich, movies))
    return jsonify(movies)


@app.route('/api/top-rated')
def rec_top_rated():
    n = int(request.args.get('n', 10))
    rec = get_recommender()
    if rec is None:
        movies, _ = tmdb.top_rated()
        return jsonify(movies[:n])
    movies = rec.get_top_rated(n)

    def _enrich(m):
        m.setdefault('poster', None)
        if not m.get('poster') and m.get('tmdb_id'):
            m['poster'] = tmdb.get_poster_url(int(m['tmdb_id']))

    with ThreadPoolExecutor(max_workers=6) as ex:
        list(ex.map(_enrich, movies))
    return jsonify(movies)


# ---------------------------------------------------------------------------
# Browse / Discover  (TMDB-powered)
# ---------------------------------------------------------------------------

@app.route('/api/browse/genres')
def browse_genres():
    try:
        return jsonify(tmdb.get_genres())
    except Exception as e:
        logger.error(f'genres: {e}')
        return jsonify([]), 502


@app.route('/api/browse/popular')
def browse_popular():
    page = int(request.args.get('page', 1))
    try:
        movies, total_pages = tmdb.popular(page)
        return jsonify({'results': movies, 'page': page, 'total_pages': total_pages})
    except Exception as e:
        logger.error(f'popular: {e}')
        return jsonify({'results': [], 'page': 1, 'total_pages': 1}), 502


@app.route('/api/browse/now-playing')
def browse_now_playing():
    page = int(request.args.get('page', 1))
    try:
        movies, total_pages = tmdb.now_playing(page)
        return jsonify({'results': movies, 'page': page, 'total_pages': total_pages})
    except Exception as e:
        logger.error(f'now_playing: {e}')
        return jsonify({'results': [], 'page': 1, 'total_pages': 1}), 502


@app.route('/api/browse/top-rated')
def browse_top_rated():
    page = int(request.args.get('page', 1))
    try:
        movies, total_pages = tmdb.top_rated(page)
        return jsonify({'results': movies, 'page': page, 'total_pages': total_pages})
    except Exception as e:
        logger.error(f'top_rated: {e}')
        return jsonify({'results': [], 'page': 1, 'total_pages': 1}), 502


@app.route('/api/browse/trending')
def browse_trending():
    window = request.args.get('window', 'week')
    try:
        movies = tmdb.trending(window)
        return jsonify({'results': movies})
    except Exception as e:
        logger.error(f'trending: {e}')
        return jsonify({'results': []}), 502


@app.route('/api/browse/genre/<int:genre_id>')
def browse_genre(genre_id: int):
    page = int(request.args.get('page', 1))
    sort_by = request.args.get('sort', 'popularity.desc')
    try:
        movies, total_pages = tmdb.by_genre(genre_id, page, sort_by)
        return jsonify({'results': movies, 'page': page, 'total_pages': total_pages})
    except Exception as e:
        logger.error(f'genre {genre_id}: {e}')
        return jsonify({'results': [], 'page': 1, 'total_pages': 1}), 502


@app.route('/api/browse/search')
def browse_search():
    query = request.args.get('query', '').strip()
    page = int(request.args.get('page', 1))
    if not query:
        return jsonify({'results': [], 'page': 1, 'total_pages': 1})
    try:
        movies, total_pages = tmdb.search(query, page)
        return jsonify({'results': movies, 'page': page, 'total_pages': total_pages})
    except Exception as e:
        logger.error(f'search: {e}')
        return jsonify({'results': [], 'page': 1, 'total_pages': 1}), 502


@app.route('/api/browse/movie/<int:tmdb_id>')
def browse_movie(tmdb_id: int):
    try:
        detail = tmdb.movie_detail(tmdb_id)
        if detail.get('imdb_id'):
            detail.update(omdb.get_scores(detail['imdb_id']))
        return jsonify(detail)
    except Exception as e:
        logger.error(f'movie detail {tmdb_id}: {e}')
        return jsonify({'error': 'Not found'}), 404


@app.route('/api/browse/movie/<int:tmdb_id>/similar')
def browse_movie_similar(tmdb_id: int):
    try:
        movies = tmdb.movie_similar(tmdb_id)
        return jsonify({'results': movies[:12]})
    except Exception as e:
        logger.error(f'similar {tmdb_id}: {e}')
        return jsonify({'results': []})


@app.route('/api/browse/collection/<int:collection_id>')
def browse_collection_movies(collection_id: int):
    try:
        movies = tmdb.get_collection(collection_id)
        # Sort chronologically
        movies.sort(key=lambda m: m.get('year') or 0)
        return jsonify({'results': movies})
    except Exception as e:
        logger.error(f'collection {collection_id}: {e}')
        return jsonify({'results': []})


@app.route('/api/browse/discover')
def browse_discover():
    """Advanced discover with decade / language / genre / sort filters."""
    page     = int(request.args.get('page', 1))
    decade   = request.args.get('decade', '').strip()
    language = request.args.get('language', '').strip()
    genre_id = request.args.get('genre_id', '').strip()
    sort_by  = request.args.get('sort', 'popularity.desc')

    _valid_sorts = {
        'popularity.desc', 'popularity.asc',
        'vote_average.desc', 'vote_average.asc',
        'release_date.desc', 'release_date.asc',
        'revenue.desc',
    }
    if sort_by not in _valid_sorts:
        sort_by = 'popularity.desc'

    params: dict = {
        'sort_by': sort_by,
        'page': page,
        'language': 'en-US',
        'vote_count.gte': 80,
    }

    if decade and decade.isdigit():
        y = int(decade)
        params['primary_release_date.gte'] = f'{y}-01-01'
        params['primary_release_date.lte'] = f'{min(y + 9, 2025)}-12-31'

    if language:
        params['with_original_language'] = language

    if genre_id and genre_id.isdigit():
        params['with_genres'] = genre_id

    try:
        gm = tmdb.get_genre_map()
        data = tmdb._get('/discover/movie', params, ttl=600)
        movies = [tmdb._fmt(m, gm) for m in data.get('results', [])]
        return jsonify({
            'results':     movies,
            'page':        page,
            'total_pages': data.get('total_pages', 1),
        })
    except Exception as e:
        logger.error(f'discover: {e}')
        return jsonify({'results': [], 'page': 1, 'total_pages': 1}), 502


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.route('/api/health')
def health():
    return jsonify({
        'status': 'ok',
        'data_loaded': _data is not None,
        'recommender_ready': _recommender is not None,
        'movie_count': len(_data['movies']) if _data else 0,
        'mode': 'demo' if (_data and _data.get('using_demo')) else 'full',
        'tmdb': bool(os.environ.get('TMDB_API_TOKEN')),
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
