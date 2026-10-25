"""SQLite database that is recreated from scratch on every startup."""

import os
import sqlite3
from pathlib import Path

SCHEMA = """
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
"""


def db_path() -> Path:
    """Location of the database file, configurable with DB_PATH."""
    return Path(os.environ.get("DB_PATH", "prelegal.db"))


def connect() -> sqlite3.Connection:
    return sqlite3.connect(db_path())


def init_db() -> None:
    """Delete any existing database and create a fresh schema."""
    path = db_path()
    path.unlink(missing_ok=True)
    with connect() as conn:
        conn.executescript(SCHEMA)
