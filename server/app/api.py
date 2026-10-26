"""Read-only API the personal page on GitHub Pages calls.

Everything here reads the local SQLite file the sync job writes; no request
ever reaches StoryGraph, Letterboxd or any other upstream service.
"""

import sqlite3
from contextlib import closing

from fastapi import FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from . import db
from .config import load_settings
from .models import ReviewType

MAX_PAGE_SIZE = 50
CACHE_SECONDS = 300

settings = load_settings()

# No interactive docs or schema in production: nothing to browse, less surface.
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_methods=["GET"],
    allow_headers=[],
)


@app.middleware("http")
async def cache_headers(request: Request, call_next):
    response: Response = await call_next(request)
    if request.method == "GET" and response.status_code == 200 and request.url.path != "/health":
        # Data only changes when the sync runs, so browsers and a CDN can reuse it.
        response.headers["Cache-Control"] = f"public, max-age={CACHE_SECONDS}"
    return response


def _connect() -> sqlite3.Connection:
    if not settings.db_path.exists():
        raise HTTPException(status_code=503, detail="no data synced yet")
    return db.connect_readonly(settings.db_path)


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/reviews")
def list_reviews(
    type: ReviewType | None = None,
    limit: int = Query(20, ge=1, le=MAX_PAGE_SIZE),
    offset: int = Query(0, ge=0, le=10_000),
):
    where, params = ("WHERE type = ?", [type]) if type else ("", [])
    with closing(_connect()) as conn:
        total = conn.execute(f"SELECT COUNT(*) FROM reviews {where}", params).fetchone()[0]
        rows = conn.execute(
            f"SELECT source || ':' || external_id AS id, type, title, creator, year,"
            f" rating, review, date, cover_url, url, source"
            f" FROM reviews {where}"
            f" ORDER BY date IS NULL, date DESC, title"
            f" LIMIT ? OFFSET ?",
            [*params, limit, offset],
        ).fetchall()
    return {"items": [dict(r) for r in rows], "total": total, "limit": limit, "offset": offset}


@app.get("/meta")
def meta():
    with closing(_connect()) as conn:
        counts = dict(conn.execute("SELECT type, COUNT(*) FROM reviews GROUP BY type").fetchall())
        last = conn.execute(
            "SELECT MAX(finished_at) FROM sync_runs WHERE status IN ('ok', 'unchanged')"
        ).fetchone()[0]
    return {"counts": counts, "last_synced": last}
