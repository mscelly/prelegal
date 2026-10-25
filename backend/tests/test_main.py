from fastapi.testclient import TestClient

from app.db import connect
from app.main import app


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_users_table_created(client):
    with connect() as conn:
        columns = [row[1] for row in conn.execute("PRAGMA table_info(users)")]
    assert columns == ["id", "email", "password_hash", "created_at"]


def test_database_recreated_on_startup(client):
    with connect() as conn:
        conn.execute("INSERT INTO users (email, password_hash) VALUES ('a@b.c', 'x')")

    with TestClient(app):
        with connect() as conn:
            assert conn.execute("SELECT COUNT(*) FROM users").fetchone() == (0,)


def test_serves_login_page(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "Login" in response.text


def test_serves_nda_page(client):
    response = client.get("/nda/")
    assert response.status_code == 200
    assert "NDA" in response.text


def test_unknown_api_route_is_404(client):
    assert client.get("/api/missing").status_code == 404
