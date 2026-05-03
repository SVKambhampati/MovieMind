import sys
import os

# Resolve absolute path to backend/ so imports work regardless of working dir
_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_backend = os.path.join(_root, 'backend')

if _backend not in sys.path:
    sys.path.insert(0, _backend)

from app import app  # noqa: F401  — Flask app from backend/app.py
