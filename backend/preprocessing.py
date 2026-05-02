import os
import ast
import logging
import pickle

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from demo_data import DEMO_MOVIES

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '..', 'data')
CACHE_DIR = os.path.join(BASE_DIR, 'cache')


def _safe_parse(x):
    try:
        return ast.literal_eval(x)
    except Exception:
        return []


def _extract_names(obj, limit=3):
    if isinstance(obj, list):
        return [item['name'] for item in obj[:limit] if isinstance(item, dict) and 'name' in item]
    return []


def _get_director(crew):
    if isinstance(crew, list):
        for person in crew:
            if isinstance(person, dict) and person.get('job') == 'Director':
                return person.get('name', '')
    return ''


def _build_feature_string(row):
    parts = []
    genres = row.get('genres', [])
    if isinstance(genres, list):
        genre_names = [g if isinstance(g, str) else g.get('name', '') for g in genres]
        parts.extend([g.replace(' ', '') for g in genre_names] * 2)

    cast = row.get('cast', [])
    if isinstance(cast, list):
        cast_names = [c if isinstance(c, str) else c.get('name', '') for c in cast[:3]]
        parts.extend([c.replace(' ', '') for c in cast_names])

    director = row.get('director', '')
    if director:
        parts.extend([director.replace(' ', '')] * 3)

    keywords = row.get('keywords', [])
    if isinstance(keywords, list):
        kw_names = [k if isinstance(k, str) else k.get('name', '') for k in keywords]
        parts.extend([k.replace(' ', '') for k in kw_names])

    return ' '.join(parts).lower()


def _load_kaggle_dataset():
    movies_path = os.path.join(DATA_DIR, 'movies_metadata.csv')
    credits_path = os.path.join(DATA_DIR, 'credits.csv')
    keywords_path = os.path.join(DATA_DIR, 'keywords.csv')

    if not os.path.exists(movies_path):
        return None

    logger.info("Loading Kaggle Movies Dataset...")
    movies = pd.read_csv(movies_path, low_memory=False)
    movies = movies[movies['id'].apply(lambda x: str(x).isdigit())]
    movies['id'] = movies['id'].astype(int)

    keep_cols = ['id', 'title', 'genres', 'overview', 'vote_average',
                 'vote_count', 'release_date', 'poster_path', 'imdb_id']
    movies = movies[[c for c in keep_cols if c in movies.columns]].dropna(subset=['title'])
    movies = movies[movies['vote_count'].fillna(0).astype(float) > 10]
    movies['genres'] = movies['genres'].apply(_safe_parse)

    if os.path.exists(credits_path):
        credits = pd.read_csv(credits_path)
        credits['id'] = credits['id'].astype(int)
        credits['cast'] = credits['cast'].apply(_safe_parse)
        credits['crew'] = credits['crew'].apply(_safe_parse)
        credits['director'] = credits['crew'].apply(_get_director)
        movies = movies.merge(credits[['id', 'cast', 'director']], on='id', how='left')
    else:
        movies['cast'] = [[] for _ in range(len(movies))]
        movies['director'] = ''

    if os.path.exists(keywords_path):
        kw = pd.read_csv(keywords_path)
        kw['id'] = kw['id'].astype(int)
        kw['keywords'] = kw['keywords'].apply(_safe_parse)
        movies = movies.merge(kw[['id', 'keywords']], on='id', how='left')
    else:
        movies['keywords'] = [[] for _ in range(len(movies))]

    movies['year'] = pd.to_datetime(movies.get('release_date', ''), errors='coerce').dt.year
    movies = movies.reset_index(drop=True)
    return movies


def _build_demo_dataframe():
    logger.info("Using demo dataset (150 curated movies).")
    records = []
    for m in DEMO_MOVIES:
        records.append({
            'id': m['id'],
            'title': m['title'],
            'year': m.get('year'),
            'genres': m.get('genres', []),
            'cast': m.get('cast', []),
            'director': m.get('director', ''),
            'keywords': m.get('keywords', []),
            'overview': m.get('overview', ''),
            'vote_average': m.get('vote_average', 0.0),
            'vote_count': 1000,
            'tmdb_id': m.get('tmdb_id'),
            'poster_path': None,
        })
    return pd.DataFrame(records)


def preprocess():
    os.makedirs(CACHE_DIR, exist_ok=True)
    cache_path = os.path.join(CACHE_DIR, 'processed_data.pkl')

    if os.path.exists(cache_path):
        logger.info("Loading cached data...")
        with open(cache_path, 'rb') as f:
            return pickle.load(f)

    movies = _load_kaggle_dataset()
    using_demo = movies is None
    if using_demo:
        movies = _build_demo_dataframe()

    # Limit to top 8000 by vote_count for performance on large datasets
    if len(movies) > 8000:
        movies = movies.nlargest(8000, 'vote_count').reset_index(drop=True)

    movies['features'] = movies.apply(_build_feature_string, axis=1)

    logger.info(f"Computing TF-IDF on {len(movies)} movies...")
    tfidf = TfidfVectorizer(stop_words='english', max_features=8000)
    tfidf_matrix = tfidf.fit_transform(movies['features'].fillna(''))

    logger.info("Computing cosine similarity matrix...")
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    # Build a fast title → index lookup (lowercased)
    movie_index = pd.Series(movies.index, index=movies['title'].str.lower()).drop_duplicates()

    data = {
        'movies': movies,
        'tfidf_matrix': tfidf_matrix,
        'cosine_sim': cosine_sim,
        'movie_index': movie_index,
        'tfidf': tfidf,
        'using_demo': using_demo,
    }

    logger.info("Caching processed data...")
    with open(cache_path, 'wb') as f:
        pickle.dump(data, f)

    return data


def invalidate_cache():
    cache_path = os.path.join(CACHE_DIR, 'processed_data.pkl')
    if os.path.exists(cache_path):
        os.remove(cache_path)
        logger.info("Cache cleared.")
