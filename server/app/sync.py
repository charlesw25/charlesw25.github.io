"""Pull every enabled source into the local database.

    python -m app.sync          # one pass
    python -m app.sync --loop   # one pass every SYNC_INTERVAL_HOURS
    python -m app.sync --force  # re-parse even if the payload hasn't changed
"""

import argparse
import hashlib
import logging
import time
from datetime import datetime, timezone

from . import db
from .config import Settings, load_settings
from .sources import Source, SourceUnavailable, enabled_sources

log = logging.getLogger("sync")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _save_raw(settings: Settings, source: Source, raw: bytes, stamp: str, digest: str) -> None:
    """Keep recent raw payloads so a parser fix can be re-run without refetching."""
    folder = settings.raw_dir / source.name
    folder.mkdir(parents=True, exist_ok=True)
    (folder / f"{stamp.replace(':', '')}-{digest[:12]}{source.raw_suffix}").write_bytes(raw)
    for old in sorted(folder.iterdir())[:-settings.raw_keep_per_source]:
        old.unlink()


def sync_source(conn, settings: Settings, source: Source, force: bool = False) -> str:
    started = _now()
    run = {"source": source.name, "started_at": started}
    try:
        raw = source.fetch_raw()
        digest = hashlib.sha256(raw).hexdigest()
        if not force and digest == db.last_ok_hash(conn, source.name):
            db.record_run(conn, **run, finished_at=_now(), status="unchanged", raw_sha256=digest)
            return "unchanged"
        _save_raw(settings, source, raw, started, digest)
        reviews = source.parse(raw)
        if source.full_snapshot:
            db.replace_source(conn, source.name, reviews)
        else:
            db.upsert_source(conn, reviews)
        db.record_run(conn, **run, finished_at=_now(), status="ok",
                      item_count=len(reviews), raw_sha256=digest)
        log.info("%s: %d items", source.name, len(reviews))
        return "ok"
    except SourceUnavailable as e:
        db.record_run(conn, **run, finished_at=_now(), status="skipped", error=str(e))
        log.info("%s: skipped (%s)", source.name, e)
        return "skipped"
    except Exception as e:
        # One broken source must not wipe its existing rows or stop the others.
        db.record_run(conn, **run, finished_at=_now(), status="error", error=repr(e))
        log.exception("%s: failed", source.name)
        return "error"


def run_once(settings: Settings, force: bool = False) -> dict[str, str]:
    conn = db.connect(settings.db_path)
    try:
        return {s.name: sync_source(conn, settings, s, force) for s in enabled_sources(settings)}
    finally:
        conn.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--loop", action="store_true", help="keep syncing on an interval")
    parser.add_argument("--force", action="store_true", help="re-parse unchanged payloads")
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")

    settings = load_settings()
    run_once(settings, force=args.force)
    while args.loop:
        time.sleep(settings.sync_interval_hours * 3600)
        run_once(settings)


if __name__ == "__main__":
    main()
