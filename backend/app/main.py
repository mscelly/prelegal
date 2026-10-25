"""FastAPI app serving the API under /api and the static frontend at /."""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.db import connect, init_db

STATIC_DIR = Path(os.environ.get("STATIC_DIR", "static"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Prelegal", lifespan=lifespan)


@app.get("/api/health")
def health() -> dict[str, str]:
    """Report that the API is up and the database answers."""
    with connect() as conn:
        conn.execute("SELECT 1")
    return {"status": "ok"}


if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
