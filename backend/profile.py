import json
from collections import Counter

from flask import Blueprint, jsonify, request, session

from auth import login_required, current_user
from models import UserMovie, db

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')


@profile_bp.route('/movies')
@login_required
def get_movies():
    user = current_user()
    status_filter = request.args.get('status')
    query = user.movies
    if status_filter in ('watched', 'watchlist'):
        query = query.filter_by(status=status_filter)
    movies = query.order_by(UserMovie.added_at.desc()).all()
    return jsonify([m.to_dict() for m in movies])


@profile_bp.route('/movies', methods=['POST'])
@login_required
def add_movie():
    user = current_user()
    data = request.get_json(force=True, silent=True) or {}

    tmdb_id = data.get('tmdb_id')
    if not tmdb_id:
        return jsonify({'error': 'tmdb_id is required'}), 400

    tmdb_id = int(tmdb_id)
    title   = (data.get('title') or '').strip()
    if not title:
        return jsonify({'error': 'title is required'}), 400

    status = data.get('status', 'watchlist')
    if status not in ('watched', 'watchlist'):
        return jsonify({'error': "status must be 'watched' or 'watchlist'"}), 400

    rating = data.get('rating')
    if rating is not None:
        rating = float(rating)
        if not (1.0 <= rating <= 5.0):
            return jsonify({'error': 'rating must be between 1 and 5'}), 400

    genres = data.get('genres', [])
    if isinstance(genres, str):
        try:
            genres = json.loads(genres)
        except (ValueError, TypeError):
            genres = []

    existing = UserMovie.query.filter_by(user_id=user.id, tmdb_id=tmdb_id).first()
    if existing:
        existing.title        = title
        existing.year         = str(data.get('year') or '') or None
        existing.poster       = data.get('poster')
        existing.vote_average = data.get('vote_average')
        existing.genres       = genres
        existing.status       = status
        if rating is not None:
            existing.rating = rating
        db.session.commit()
        return jsonify(existing.to_dict())

    movie = UserMovie(
        user_id=user.id,
        tmdb_id=tmdb_id,
        title=title,
        year=str(data.get('year') or '') or None,
        poster=data.get('poster'),
        vote_average=data.get('vote_average'),
        rating=rating,
        status=status,
    )
    movie.genres = genres
    db.session.add(movie)
    db.session.commit()
    return jsonify(movie.to_dict()), 201


@profile_bp.route('/movies/<int:tmdb_id>', methods=['PUT'])
@login_required
def update_movie(tmdb_id):
    user = current_user()
    movie = UserMovie.query.filter_by(user_id=user.id, tmdb_id=tmdb_id).first()
    if not movie:
        return jsonify({'error': 'Movie not found in your profile'}), 404

    data = request.get_json(force=True, silent=True) or {}

    if 'status' in data:
        status = data['status']
        if status not in ('watched', 'watchlist'):
            return jsonify({'error': "status must be 'watched' or 'watchlist'"}), 400
        movie.status = status

    if 'rating' in data:
        rating = data['rating']
        if rating is None:
            movie.rating = None
        else:
            rating = float(rating)
            if not (1.0 <= rating <= 5.0):
                return jsonify({'error': 'rating must be between 1 and 5'}), 400
            movie.rating = rating

    db.session.commit()
    return jsonify(movie.to_dict())


@profile_bp.route('/movies/<int:tmdb_id>', methods=['DELETE'])
@login_required
def delete_movie(tmdb_id):
    user = current_user()
    movie = UserMovie.query.filter_by(user_id=user.id, tmdb_id=tmdb_id).first()
    if not movie:
        return jsonify({'error': 'Movie not found in your profile'}), 404
    db.session.delete(movie)
    db.session.commit()
    return jsonify({'ok': True})


@profile_bp.route('/stats')
@login_required
def stats():
    user = current_user()
    all_movies = user.movies.all()

    watched   = [m for m in all_movies if m.status == 'watched']
    watchlist = [m for m in all_movies if m.status == 'watchlist']

    rated   = [m.rating for m in all_movies if m.rating is not None]
    avg_rating = round(sum(rated) / len(rated), 1) if rated else None

    genre_counter: Counter = Counter()
    for m in all_movies:
        for g in m.genres:
            genre_counter[g] += 1

    top_genres = [g for g, _ in genre_counter.most_common(5)]

    return jsonify({
        'watched_count':   len(watched),
        'watchlist_count': len(watchlist),
        'avg_rating':      avg_rating,
        'top_genres':      top_genres,
    })
