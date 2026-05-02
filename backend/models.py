import json
from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id           = db.Column(db.Integer, primary_key=True)
    username     = db.Column(db.String(80), unique=True, nullable=False)
    email        = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    avatar_color = db.Column(db.String(7), nullable=False, default='#D63B2A')
    created_at   = db.Column(db.DateTime, nullable=False,
                             default=lambda: datetime.now(timezone.utc))

    movies = db.relationship('UserMovie', back_populates='user',
                             cascade='all, delete-orphan', lazy='dynamic')

    def to_dict(self):
        return {
            'id':           self.id,
            'username':     self.username,
            'email':        self.email,
            'avatar_color': self.avatar_color,
            'created_at':   self.created_at.isoformat(),
        }


class UserMovie(db.Model):
    __tablename__ = 'user_movies'

    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    tmdb_id      = db.Column(db.Integer, nullable=False)
    title        = db.Column(db.String(255), nullable=False)
    year         = db.Column(db.String(4), nullable=True)
    poster       = db.Column(db.Text, nullable=True)
    vote_average = db.Column(db.Float, nullable=True)
    _genres      = db.Column('genres', db.Text, nullable=True)
    rating       = db.Column(db.Float, nullable=True)
    status       = db.Column(db.String(20), nullable=False, default='watchlist')
    added_at     = db.Column(db.DateTime, nullable=False,
                             default=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', back_populates='movies')

    __table_args__ = (
        db.UniqueConstraint('user_id', 'tmdb_id', name='uq_user_tmdb'),
    )

    @property
    def genres(self):
        if self._genres:
            try:
                return json.loads(self._genres)
            except (ValueError, TypeError):
                return []
        return []

    @genres.setter
    def genres(self, value):
        if value is None:
            self._genres = None
        elif isinstance(value, list):
            self._genres = json.dumps(value)
        else:
            self._genres = value

    def to_dict(self):
        return {
            'id':           self.id,
            'tmdb_id':      self.tmdb_id,
            'title':        self.title,
            'year':         self.year,
            'poster':       self.poster,
            'vote_average': self.vote_average,
            'genres':       self.genres,
            'rating':       self.rating,
            'status':       self.status,
            'added_at':     self.added_at.isoformat(),
        }
