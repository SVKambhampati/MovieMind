"""
Hybrid recommendation engine: content-based (TF-IDF cosine similarity)
+ collaborative filtering (SVD via surprise or scipy fallback).
"""
import logging
import os
import pickle
from collections import defaultdict
from typing import Any

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

CB_WEIGHT = float(os.environ.get('CB_WEIGHT', 0.4))
CF_WEIGHT = float(os.environ.get('CF_WEIGHT', 0.6))
TOP_N = 20


# ---------------------------------------------------------------------------
# Content-based recommender
# ---------------------------------------------------------------------------

class ContentBasedRecommender:
    def __init__(self, data: dict):
        self.movies: pd.DataFrame = data['movies']
        self.cosine_sim: np.ndarray = data['cosine_sim']
        self.movie_index: pd.Series = data['movie_index']

    def get_similar(self, movie_ids: list[int], n: int = TOP_N) -> list[dict]:
        """Return top-N similar movies not already in the input list."""
        scores: dict[int, float] = defaultdict(float)

        for mid in movie_ids:
            mask = self.movies['id'] == mid
            if not mask.any():
                continue
            idx = self.movies[mask].index[0]
            sim_row = self.cosine_sim[idx]
            for j, score in enumerate(sim_row):
                row_id = int(self.movies.loc[j, 'id'])
                if row_id not in movie_ids:
                    scores[row_id] = max(scores[row_id], float(score))

        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        results = []
        for mid, score in ranked[:n]:
            row = self.movies[self.movies['id'] == mid]
            if row.empty:
                continue
            results.append({'movie_id': mid, 'score': score,
                            'reason': 'content'})
        return results

    def get_reasons(self, rec_id: int, liked_ids: list[int]) -> str:
        """Return 'Because you liked X' explanation."""
        best_liked_id = None
        best_score = -1.0

        rec_mask = self.movies['id'] == rec_id
        if not rec_mask.any():
            return ''
        rec_idx = self.movies[rec_mask].index[0]

        for mid in liked_ids:
            liked_mask = self.movies['id'] == mid
            if not liked_mask.any():
                continue
            liked_idx = self.movies[liked_mask].index[0]
            score = float(self.cosine_sim[rec_idx, liked_idx])
            if score > best_score:
                best_score = score
                best_liked_id = mid

        if best_liked_id is None:
            return ''
        title = self.movies[self.movies['id'] == best_liked_id]['title'].values[0]
        return f'Because you liked {title}'


# ---------------------------------------------------------------------------
# Collaborative filtering (SVD)
# ---------------------------------------------------------------------------

class CollaborativeRecommender:
    """
    Trains SVD on the user-item matrix from ratings.csv (Kaggle dataset)
    or uses a vote_average-derived pseudo-rating matrix in demo mode.
    """

    def __init__(self, data: dict):
        self.movies: pd.DataFrame = data['movies']
        self.using_demo: bool = data.get('using_demo', True)
        self._model = None
        self._user_item = None
        self._movie_ids = list(self.movies['id'])
        self._id_to_idx = {mid: i for i, mid in enumerate(self._movie_ids)}
        self._trained = False

    def train(self, ratings_path: str | None = None):
        if self.using_demo or ratings_path is None or not os.path.exists(str(ratings_path)):
            self._train_pseudo()
        else:
            self._train_surprise(ratings_path)
        self._trained = True

    def _train_pseudo(self):
        """Derive pseudo-ratings from vote_average + genre co-occurrence."""
        logger.info("Training pseudo-CF from vote_average + genre matrix...")
        n = len(self.movies)
        # Build genre one-hot and weight by rating
        genres_set = set()
        for g_list in self.movies['genres']:
            if isinstance(g_list, list):
                for g in g_list:
                    name = g if isinstance(g, str) else g.get('name', '')
                    genres_set.add(name)
        genres = sorted(genres_set)
        genre_idx = {g: i for i, g in enumerate(genres)}

        G = np.zeros((n, len(genres)), dtype=np.float32)
        for i, row in self.movies.iterrows():
            g_list = row.get('genres', [])
            if isinstance(g_list, list):
                for g in g_list:
                    name = g if isinstance(g, str) else g.get('name', '')
                    if name in genre_idx:
                        G[i, genre_idx[name]] = 1.0

        ratings_vec = self.movies['vote_average'].fillna(0).values.astype(np.float32) / 10.0
        # Simulate 200 synthetic users with genre preferences
        np.random.seed(42)
        n_users = 200
        user_genre_prefs = np.random.dirichlet(np.ones(len(genres)), size=n_users)
        user_item = (user_genre_prefs @ G.T) * ratings_vec[np.newaxis, :]
        user_item = user_item / (user_item.max(axis=1, keepdims=True) + 1e-8)
        self._user_item = user_item
        # Compute item-item CF scores via user similarity
        self._item_scores = (G @ G.T) * np.outer(ratings_vec, ratings_vec)

    def _train_surprise(self, ratings_path: str):
        try:
            from surprise import Dataset, Reader, SVD
            from surprise.model_selection import train_test_split
        except ImportError:
            logger.warning("scikit-surprise not installed, falling back to pseudo-CF.")
            self._train_pseudo()
            return

        logger.info("Training SVD collaborative filter on ratings.csv...")
        reader = Reader(rating_scale=(0.5, 5.0))
        ratings_df = pd.read_csv(ratings_path).head(500000)
        dataset = Dataset.load_from_df(ratings_df[['userId', 'movieId', 'rating']], reader)
        trainset, _ = train_test_split(dataset, test_size=0.1, random_state=42)
        algo = SVD(n_factors=50, n_epochs=20, random_state=42)
        algo.fit(trainset)
        self._model = algo
        self._item_scores = None

    def get_cf_scores(self, liked_ids: list[int]) -> dict[int, float]:
        """Return CF scores for all movies given what the user liked."""
        if not self._trained:
            self.train()

        if self._model is not None:
            return self._get_surprise_scores(liked_ids)
        return self._get_pseudo_scores(liked_ids)

    def _get_pseudo_scores(self, liked_ids: list[int]) -> dict[int, float]:
        scores = defaultdict(float)
        for mid in liked_ids:
            idx = self._id_to_idx.get(mid)
            if idx is None:
                continue
            row = self._item_scores[idx]
            for j, score in enumerate(row):
                other_id = self._movie_ids[j]
                if other_id not in liked_ids:
                    scores[other_id] = max(scores[other_id], float(score))
        # Normalize
        if scores:
            max_s = max(scores.values())
            if max_s > 0:
                scores = {k: v / max_s for k, v in scores.items()}
        return dict(scores)

    def _get_surprise_scores(self, liked_ids: list[int]) -> dict[int, float]:
        scores = {}
        dummy_user = 999999
        for _, row in self.movies.iterrows():
            mid = int(row['id'])
            if mid in liked_ids:
                continue
            try:
                pred = self._model.predict(dummy_user, mid)
                scores[mid] = pred.est / 5.0
            except Exception:
                scores[mid] = 0.0
        return scores


# ---------------------------------------------------------------------------
# Hybrid engine
# ---------------------------------------------------------------------------

class HybridRecommender:
    def __init__(self, data: dict):
        self.movies: pd.DataFrame = data['movies']
        self.cb = ContentBasedRecommender(data)
        self.cf = CollaborativeRecommender(data)

        ratings_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'ratings.csv'
        )
        self.cf.train(ratings_path)
        logger.info("HybridRecommender ready.")

    def recommend(
        self,
        liked_ids: list[int],
        liked_ratings: dict[int, float] | None = None,
        n: int = 15,
    ) -> list[dict]:
        if not liked_ids:
            return self._cold_start(n)

        cb_results = self.cb.get_similar(liked_ids, n=TOP_N * 2)
        cb_map = {r['movie_id']: r['score'] for r in cb_results}

        cf_map = self.cf.get_cf_scores(liked_ids)

        # Merge candidate sets
        all_ids = set(cb_map) | set(cf_map)
        all_ids -= set(liked_ids)

        blended = {}
        for mid in all_ids:
            cb_s = cb_map.get(mid, 0.0)
            cf_s = cf_map.get(mid, 0.0)
            # Apply user rating weights if available
            rating_boost = 1.0
            if liked_ratings:
                avg_liked_rating = np.mean(list(liked_ratings.values()))
                rating_boost = avg_liked_rating / 3.0  # scale around 1.0
            blended[mid] = (CB_WEIGHT * cb_s + CF_WEIGHT * cf_s) * rating_boost

        ranked = sorted(blended.items(), key=lambda x: x[1], reverse=True)[:n]

        results = []
        for mid, score in ranked:
            row = self.movies[self.movies['id'] == mid]
            if row.empty:
                continue
            movie_data = self._row_to_dict(row.iloc[0])
            movie_data['hybrid_score'] = round(score, 4)

            # Build explanation
            cf_s = cf_map.get(mid, 0.0)
            cb_s = cb_map.get(mid, 0.0)
            if cf_s > cb_s:
                movie_data['reason'] = 'Users similar to you enjoyed this'
            else:
                movie_data['reason'] = self.cb.get_reasons(mid, liked_ids) or 'Recommended for you'

            results.append(movie_data)

        return results

    def _cold_start(self, n: int) -> list[dict]:
        top = self.movies.nlargest(n, 'vote_average')
        results = []
        for _, row in top.iterrows():
            movie_data = self._row_to_dict(row)
            movie_data['hybrid_score'] = round(float(row.get('vote_average', 0)) / 10.0, 4)
            movie_data['reason'] = 'Top rated'
            results.append(movie_data)
        return results

    def _row_to_dict(self, row: pd.Series) -> dict:
        genres = row.get('genres', [])
        if isinstance(genres, list):
            genre_names = [g if isinstance(g, str) else g.get('name', '') for g in genres]
        else:
            genre_names = []

        return {
            'id': int(row.get('id', 0)),
            'title': str(row.get('title', '')),
            'year': int(row['year']) if pd.notna(row.get('year')) else None,
            'genres': genre_names,
            'vote_average': round(float(row.get('vote_average', 0) or 0), 1),
            'overview': str(row.get('overview', '') or ''),
            'poster_path': row.get('poster_path') or None,
            'tmdb_id': int(row['tmdb_id']) if pd.notna(row.get('tmdb_id')) else None,
        }

    def get_trending(self, n: int = 10) -> list[dict]:
        top = self.movies.nlargest(n, 'vote_count')
        results = []
        for _, row in top.iterrows():
            d = self._row_to_dict(row)
            d['reason'] = 'Trending'
            results.append(d)
        return results

    def get_top_rated(self, n: int = 10) -> list[dict]:
        top = self.movies.nlargest(n, 'vote_average')
        results = []
        for _, row in top.iterrows():
            d = self._row_to_dict(row)
            d['reason'] = 'Top rated'
            results.append(d)
        return results
