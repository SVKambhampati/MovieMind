import sys
import os

# Add backend to path so all relative imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import app  # noqa: F401
