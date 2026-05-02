"""OMDb API client — fetches IMDb rating, Rotten Tomatoes, and Metacritic scores."""
import os
import logging
import requests

logger = logging.getLogger(__name__)

OMDB_KEY = os.environ.get('OMDB_API_KEY', '9f550d26')
_cache: dict[str, dict] = {}


def get_scores(imdb_id: str) -> dict:
    """Return external critic/audience scores for a movie by IMDb ID.

    Returns a dict with any subset of:
      imdb_rating  (str, e.g. "8.1")
      rt_score     (str, e.g. "91%")
      metacritic   (str, e.g. "78")
    Missing scores are omitted rather than returned as None.
    """
    if not imdb_id or not OMDB_KEY:
        return {}
    if imdb_id in _cache:
        return _cache[imdb_id]
    try:
        resp = requests.get(
            'http://www.omdbapi.com/',
            params={'i': imdb_id, 'apikey': OMDB_KEY},
            timeout=6,
        )
        data = resp.json()
        if data.get('Response') == 'False':
            return {}

        scores: dict = {}
        raw_imdb = data.get('imdbRating', '')
        if raw_imdb and raw_imdb != 'N/A':
            scores['imdb_rating'] = raw_imdb

        for entry in data.get('Ratings', []):
            src, val = entry.get('Source', ''), entry.get('Value', '')
            if val == 'N/A':
                continue
            if src == 'Rotten Tomatoes':
                scores['rt_score'] = val
            elif src == 'Metacritic':
                scores['metacritic'] = val.replace('/100', '')

        if len(_cache) < 5000:
            _cache[imdb_id] = scores
        return scores
    except Exception as e:
        logger.warning(f'OMDb request failed for {imdb_id}: {e}')
        return {}
