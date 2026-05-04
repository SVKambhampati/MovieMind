"""
TMDB API client with TTL caching.
Uses Bearer token (v4 auth) for all requests.
"""
import os
import time
import logging
from typing import Any

import requests

logger = logging.getLogger(__name__)

TMDB_TOKEN = os.environ.get('TMDB_API_TOKEN', '')
BASE_URL = 'https://api.themoviedb.org/3'
IMG_W500  = 'https://image.tmdb.org/t/p/w500'
IMG_W780  = 'https://image.tmdb.org/t/p/w780'
IMG_W1280 = 'https://image.tmdb.org/t/p/w1280'
IMG_ORIG  = 'https://image.tmdb.org/t/p/original'

# Simple TTL cache: {key: (timestamp, data)}
_cache: dict[str, tuple[float, Any]] = {}
CACHE_TTL = 600  # 10 minutes for list endpoints


def _headers() -> dict:
    return {
        'Authorization': f'Bearer {TMDB_TOKEN}',
        'accept': 'application/json',
    }


def _get(path: str, params: dict | None = None, ttl: int = CACHE_TTL) -> dict:
    cache_key = path + str(sorted((params or {}).items()))
    now = time.time()
    if cache_key in _cache:
        ts, data = _cache[cache_key]
        if now - ts < ttl:
            return data
    try:
        resp = requests.get(
            f'{BASE_URL}{path}',
            headers=_headers(),
            params=params or {},
            timeout=8,
        )
        resp.raise_for_status()
        data = resp.json()
        _cache[cache_key] = (now, data)
        return data
    except requests.RequestException as e:
        logger.error(f'TMDB request failed: {e}')
        raise


def _fmt(m: dict, genre_map: dict | None = None) -> dict:
    genre_ids = m.get('genre_ids', [])
    genres_list = m.get('genres', [])  # from detail endpoint
    if genres_list:
        genre_names = [g['name'] for g in genres_list]
    elif genre_map:
        genre_names = [genre_map.get(gid, '') for gid in genre_ids if gid in genre_map]
    else:
        genre_names = []

    year = (m.get('release_date') or '')[:4] or None

    return {
        'id': m.get('id'),
        'tmdb_id': m.get('id'),
        'title': m.get('title', ''),
        'year': int(year) if year and year.isdigit() else None,
        'overview': m.get('overview', ''),
        'vote_average': round(float(m.get('vote_average') or 0), 1),
        'vote_count': m.get('vote_count', 0),
        'genres': genre_names,
        'genre_ids': genre_ids,
        'original_language': m.get('original_language', 'en'),
        'poster': f"{IMG_W500}{m['poster_path']}" if m.get('poster_path') else None,
        'backdrop': f"{IMG_W780}{m['backdrop_path']}" if m.get('backdrop_path') else None,
        'popularity': m.get('popularity', 0),
    }


# ---------------------------------------------------------------------------
# Poster-only cache (lighter than full detail, 24h TTL)
# ---------------------------------------------------------------------------
_poster_cache: dict[int, str | None] = {}


def get_poster_url(tmdb_id: int) -> str | None:
    if tmdb_id in _poster_cache:
        return _poster_cache[tmdb_id]
    try:
        data = _get(f'/movie/{tmdb_id}', {'language': 'en-US'}, ttl=86400)
        pp = data.get('poster_path')
        url = f'{IMG_W500}{pp}' if pp else None
    except Exception:
        url = None
    _poster_cache[tmdb_id] = url
    return url


# ---------------------------------------------------------------------------
# Genre cache
# ---------------------------------------------------------------------------
_genre_map: dict[int, str] = {}


def get_genre_map() -> dict[int, str]:
    global _genre_map
    if _genre_map:
        return _genre_map
    data = _get('/genre/movie/list', {'language': 'en-US'})
    _genre_map = {g['id']: g['name'] for g in data.get('genres', [])}
    return _genre_map


def get_genres() -> list[dict]:
    data = _get('/genre/movie/list', {'language': 'en-US'})
    return data.get('genres', [])


# ---------------------------------------------------------------------------
# List endpoints
# ---------------------------------------------------------------------------

def popular(page: int = 1):
    gm = get_genre_map()
    data = _get('/movie/popular', {'page': page, 'language': 'en-US'})
    return [_fmt(m, gm) for m in data.get('results', [])], data.get('total_pages', 1)


def now_playing(page: int = 1):
    gm = get_genre_map()
    data = _get('/movie/now_playing', {'page': page, 'language': 'en-US'})
    return [_fmt(m, gm) for m in data.get('results', [])], data.get('total_pages', 1)


def top_rated(page: int = 1):
    gm = get_genre_map()
    data = _get('/movie/top_rated', {'page': page, 'language': 'en-US'})
    return [_fmt(m, gm) for m in data.get('results', [])], data.get('total_pages', 1)


def trending(time_window: str = 'week'):
    gm = get_genre_map()
    data = _get(f'/trending/movie/{time_window}', {'language': 'en-US'})
    return [_fmt(m, gm) for m in data.get('results', [])]


def by_genre(genre_id: int, page: int = 1, sort_by: str = 'popularity.desc'):
    gm = get_genre_map()
    data = _get('/discover/movie', {
        'with_genres': genre_id,
        'sort_by': sort_by,
        'page': page,
        'language': 'en-US',
        'vote_count.gte': 50,
    })
    return [_fmt(m, gm) for m in data.get('results', [])], data.get('total_pages', 1)


def search(query: str, page: int = 1):
    gm = get_genre_map()
    data = _get('/search/movie', {
        'query': query,
        'page': page,
        'language': 'en-US',
        'include_adult': False,
    }, ttl=120)
    return [_fmt(m, gm) for m in data.get('results', [])], data.get('total_pages', 1)


# ---------------------------------------------------------------------------
# Detail endpoint
# ---------------------------------------------------------------------------

def get_collection(collection_id: int) -> list[dict]:
    """Return all movies in a TMDB franchise/collection."""
    gm = get_genre_map()
    data = _get(f'/collection/{collection_id}', {'language': 'en-US'}, ttl=86400)
    return [_fmt(m, gm) for m in data.get('parts', [])]


def movie_recommendations(tmdb_id: int, page: int = 1):
    """TMDB's own recommendation engine for a single movie."""
    gm = get_genre_map()
    data = _get(f'/movie/{tmdb_id}/recommendations', {'page': page, 'language': 'en-US'}, ttl=3600)
    return [_fmt(m, gm) for m in data.get('results', [])], data.get('total_pages', 1)


def movie_similar(tmdb_id: int):
    """TMDB similar movies (genre/keyword based fallback)."""
    gm = get_genre_map()
    data = _get(f'/movie/{tmdb_id}/similar', {'language': 'en-US'}, ttl=3600)
    return [_fmt(m, gm) for m in data.get('results', [])]


def discover_by_language_genre(language: str, genre_ids: list[int], page: int = 1) -> list[dict]:
    """Find popular movies in a specific language, optionally filtered by genre."""
    gm = get_genre_map()
    params: dict = {
        'with_original_language': language,
        'sort_by': 'popularity.desc',
        'vote_count.gte': 50,
        'page': page,
        'language': 'en-US',
    }
    # Use | (OR) so a movie only needs to match one genre, not all of them
    if genre_ids:
        params['with_genres'] = '|'.join(str(g) for g in genre_ids[:3])
    data = _get('/discover/movie', params, ttl=3600)
    return [_fmt(m, gm) for m in data.get('results', [])]


def movie_detail(tmdb_id: int) -> dict:
    data = _get(
        f'/movie/{tmdb_id}',
        {
            'language': 'en-US',
            'append_to_response': 'credits,videos,images,watch/providers',
            'include_image_language': 'en,null',
        },
        ttl=1800,
    )
    m = _fmt(data)
    m['genres'] = [g['name'] for g in data.get('genres', [])]
    m['runtime'] = data.get('runtime')
    m['tagline'] = data.get('tagline', '')

    credits = data.get('credits', {})
    cast_raw = credits.get('cast', [])
    crew_raw = credits.get('crew', [])

    m['cast'] = [c['name'] for c in cast_raw[:6]]
    m['director'] = next((p['name'] for p in crew_raw if p.get('job') == 'Director'), None)

    m['cast_detail'] = [
        {
            'name': c['name'],
            'character': c.get('character', ''),
            'photo': f"https://image.tmdb.org/t/p/w185{c['profile_path']}" if c.get('profile_path') else None,
        }
        for c in cast_raw[:12]
    ]

    writers = [p['name'] for p in crew_raw if p.get('job') in ('Screenplay', 'Writer', 'Story', 'Novel')]
    m['writers'] = list(dict.fromkeys(writers))[:2]  # dedupe, max 2

    directors = [p['name'] for p in crew_raw if p.get('job') == 'Director']
    m['directors'] = directors

    videos = data.get('videos', {}).get('results', [])
    trailers = [v for v in videos if v.get('type') == 'Trailer' and v.get('site') == 'YouTube']
    m['trailer_key'] = trailers[0]['key'] if trailers else None
    m['imdb_id'] = data.get('imdb_id')

    backdrops = data.get('images', {}).get('backdrops', [])
    m['stills'] = [
        {'thumb': f"{IMG_W780}{img['file_path']}", 'full': f"{IMG_W1280}{img['file_path']}"}
        for img in backdrops[:14]
        if img.get('file_path')
    ]

    # Streaming / watch providers — US region
    def _fmt_provider(p: dict) -> dict:
        return {
            'name': p.get('provider_name', ''),
            'logo': f"{IMG_W500}{p['logo_path']}" if p.get('logo_path') else None,
        }

    providers_raw = data.get('watch/providers', {}).get('results', {})
    us = providers_raw.get('US', {})
    m['watch_providers'] = {
        'stream': [_fmt_provider(p) for p in us.get('flatrate', [])],
        'rent':   [_fmt_provider(p) for p in us.get('rent',     [])[:5]],
        'buy':    [_fmt_provider(p) for p in us.get('buy',      [])[:5]],
        'link':   us.get('link', ''),
    }

    # Collection / franchise
    coll = data.get('belongs_to_collection')
    if coll:
        m['collection'] = {
            'id':     coll['id'],
            'name':   coll.get('name', ''),
            'poster': f"{IMG_W500}{coll['poster_path']}" if coll.get('poster_path') else None,
        }

    return m
