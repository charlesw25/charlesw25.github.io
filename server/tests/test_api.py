import importlib

import pytest
from fastapi.testclient import TestClient

from app import db
from app.models import Review

ORIGIN = "https://charlesw25.github.io"


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("DATA_DIR", str(tmp_path))
    monkeypatch.setenv("ALLOWED_ORIGINS", ORIGIN)
    import app.api
    api = importlib.reload(app.api)  # settings are read at import time

    conn = db.connect(tmp_path / "personal.db")
    db.replace_source(conn, "manual", [
        Review(source="manual", external_id="1", type="book", title="Old", date="2020-01-01"),
        Review(source="manual", external_id="2", type="book", title="New", date="2024-01-01"),
        Review(source="manual", external_id="3", type="book", title="Undated"),
        Review(source="manual", external_id="4", type="game", title="Hades", rating=5),
    ])
    db.record_run(conn, source="manual", started_at="2024-05-01T00:00:00+00:00",
                  finished_at="2024-05-01T00:00:01+00:00", status="ok")
    conn.close()
    return TestClient(api.app)


def test_reviews_are_filtered_paginated_and_newest_first(client):
    body = client.get("/reviews", params={"type": "book", "limit": 2}).json()
    assert body["total"] == 3
    assert [i["title"] for i in body["items"]] == ["New", "Old"]
    assert body["items"][0]["id"] == "manual:2"

    body = client.get("/reviews", params={"type": "book", "limit": 2, "offset": 2}).json()
    assert [i["title"] for i in body["items"]] == ["Undated"]


@pytest.mark.parametrize("params", [
    {"limit": 51}, {"limit": 0}, {"offset": -1}, {"offset": 10_001}, {"type": "album"},
])
def test_rejects_out_of_bounds_queries(client, params):
    assert client.get("/reviews", params=params).status_code == 422


def test_meta(client):
    assert client.get("/meta").json() == {
        "counts": {"book": 3, "game": 1},
        "last_synced": "2024-05-01T00:00:01+00:00",
    }


def test_cache_and_cors_headers(client):
    resp = client.get("/reviews", headers={"Origin": ORIGIN})
    assert resp.headers["cache-control"] == "public, max-age=300"
    assert resp.headers["access-control-allow-origin"] == ORIGIN

    other = client.get("/reviews", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in other.headers


def test_only_get_is_exposed(client):
    assert client.post("/reviews").status_code == 405
    assert client.get("/docs").status_code == 404
    assert client.get("/openapi.json").status_code == 404


def test_api_never_writes_to_the_database(client, tmp_path):
    import app.api
    with app.api._connect() as conn, pytest.raises(Exception, match="readonly"):
        conn.execute("DELETE FROM reviews")


def test_no_database_yet(tmp_path, monkeypatch):
    monkeypatch.setenv("DATA_DIR", str(tmp_path / "empty"))
    import app.api
    api = importlib.reload(app.api)
    assert TestClient(api.app).get("/reviews").status_code == 503
