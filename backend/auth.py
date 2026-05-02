import random

from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash

from models import User, db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

AVATAR_COLORS = ['#D63B2A', '#2A7DD6', '#2AD67A', '#D6A02A', '#8B2AD6']


def current_user():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)


def login_required(f):
    from functools import wraps

    @wraps(f)
    def decorated(*args, **kwargs):
        if not current_user():
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)

    return decorated


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(force=True, silent=True) or {}
    username = (data.get('username') or '').strip()
    email    = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not username or not email or not password:
        return jsonify({'error': 'username, email and password are required'}), 400

    if len(username) < 2 or len(username) > 50:
        return jsonify({'error': 'Username must be between 2 and 50 characters'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this email already exists'}), 409

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'This username is already taken'}), 409

    user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password),
        avatar_color=random.choice(AVATAR_COLORS),
    )
    db.session.add(user)
    db.session.commit()

    session['user_id'] = user.id
    return jsonify(user.to_dict()), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(force=True, silent=True) or {}
    email    = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'error': 'email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    session['user_id'] = user.id
    return jsonify(user.to_dict())


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'ok': True})


@auth_bp.route('/me')
def me():
    user = current_user()
    if not user:
        return jsonify({'error': 'Not logged in'}), 401
    return jsonify(user.to_dict())
