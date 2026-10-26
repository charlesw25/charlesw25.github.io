import sqlite3
from pathlib import Path
from typing import Iterable

from .models import Review

SCHEMA = """
CREATE TABLE IF NOT EXISTS reviews (
    source      TEXT NOT NULL,
    external_id TEXT NOT NULL,
    type        TEXT NOT NULL CHECK (type IN ('book', 'movie', 'game')),
    title       TEXT NOT NULL,
    creator     TEXT,
    year        INTEGER,
    rating      REAL,
    review      TEXT,
    date        TEXT,
    cover_url   TEXT,
    url         TEXT,
    PRIMARY KEY (source, external_id)
);
CREATE INDEX IF NOT EXISTS reviews_type_date ON reviews (type, date DESC);

CREATE TABLE IF NOT EXISTS sync_runs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    source      TEXT NOT NULL,
    started_at  TEXT NOT NULL,
    finished_at TEXT NOT NULL,
    status      TEXT NOT NULL CHECK (status IN ('ok', 'unchanged', 'skipped', 'error')),
    item_count  INTEGER,
    raw_sha256  TEXT,
    error       TEXT
);
"""

COLUMNS = ("source", "external_id", "type", "title", "creator", "year",
           "rating", "review", "date", "cover_url", "url")


def connect(path: Path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    return conn


def connect_readonly(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    return conn


def _insert(conn: sqlite3.Connection, reviews: Iterable[Review]) -> None:
    placeholders = ", ".join(f":{c}" for c in COLUMNS)
    conn.executemany(
        f"INSERT OR REPLACE INTO reviews ({', '.join(COLUMNS)}) VALUES ({placeholders})",
        [r.to_row() for r in reviews],
    )


def replace_source(conn: sqlite3.Connection, source: str, reviews: list[Review]) -> None:
    """Swap in a full snapshot of a source, so deletions upstream are reflected."""
    with conn:
        conn.execute("DELETE FROM reviews WHERE source = ?", (source,))
        _insert(conn, reviews)


def upsert_source(conn: sqlite3.Connection, reviews: list[Review]) -> None:
    """Merge a partial feed (e.g. an RSS window) without dropping older entries."""
    with conn:
        _insert(conn, reviews)


def record_run(conn: sqlite3.Connection, **run) -> None:
    with conn:
        conn.execute(
            "INSERT INTO sync_runs (source, started_at, finished_at, status, item_count, raw_sha256, error)"
            " VALUES (:source, :started_at, :finished_at, :status, :item_count, :raw_sha256, :error)",
            {"item_count": None, "raw_sha256": None, "error": None, **run},
        )


def last_ok_hash(conn: sqlite3.Connection, source: str) -> str | None:
    row = conn.execute(
        "SELECT raw_sha256 FROM sync_runs WHERE source = ? AND status IN ('ok', 'unchanged')"
        " ORDER BY id DESC LIMIT 1",
        (source,),
    ).fetchone()
    return row["raw_sha256"] if row else None
