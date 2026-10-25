"""Point the app at a throwaway database and static site before it is imported."""

import os
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

TMP_DIR = Path(tempfile.mkdtemp())
STATIC_DIR = TMP_DIR / "static"
(STATIC_DIR / "nda").mkdir(parents=True)
(STATIC_DIR / "index.html").write_text("<h1>Login</h1>")
(STATIC_DIR / "nda" / "index.html").write_text("<h1>NDA</h1>")

os.environ["DB_PATH"] = str(TMP_DIR / "test.db")
os.environ["STATIC_DIR"] = str(STATIC_DIR)

from app.main import app  # noqa: E402


@pytest.fixture
def client():
    """Client with the app's lifespan run, so the database is freshly created."""
    with TestClient(app) as client:
        yield client
