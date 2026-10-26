import json

from app import db
from app.config import Settings
from app.models import Review
from app.sources.base import Source
from app.sync import run_once, sync_source


def make_settings(tmp_path) -> Settings:
    return Settings(data_dir=tmp_path, allowed_origins=[], letterboxd_username=None,
                    sync_interval_hours=6, raw_keep_per_source=2)


class FakeFeed(Source):
    name = "fake"
    raw_suffix = ".txt"

    def __init__(self, titles, full_snapshot=False, fail=False):
        self.titles, self.full_snapshot, self.fail = titles, full_snapshot, fail

    def fetch_raw(self):
        if self.fail:
            raise ConnectionError("upstream down")
        return ",".join(self.titles).encode()

    def parse(self, raw):
        return [Review(source=self.name, external_id=t, type="movie", title=t)
                for t in raw.decode().split(",")]


def titles(conn):
    return sorted(r["title"] for r in conn.execute("SELECT title FROM reviews"))


def test_partial_feed_keeps_entries_that_scrolled_out(tmp_path):
    settings = make_settings(tmp_path)
    conn = db.connect(settings.db_path)
    sync_source(conn, settings, FakeFeed(["a", "b"]))
    sync_source(conn, settings, FakeFeed(["b", "c"]))
    assert titles(conn) == ["a", "b", "c"]


def test_full_snapshot_drops_deleted_entries(tmp_path):
    settings = make_settings(tmp_path)
    conn = db.connect(settings.db_path)
    sync_source(conn, settings, FakeFeed(["a", "b"], full_snapshot=True))
    sync_source(conn, settings, FakeFeed(["b"], full_snapshot=True))
    assert titles(conn) == ["b"]


def test_failure_keeps_existing_rows(tmp_path):
    settings = make_settings(tmp_path)
    conn = db.connect(settings.db_path)
    sync_source(conn, settings, FakeFeed(["a"], full_snapshot=True))
    assert sync_source(conn, settings, FakeFeed([], full_snapshot=True, fail=True)) == "error"
    assert titles(conn) == ["a"]


def test_unchanged_payload_is_not_reparsed_and_raw_is_pruned(tmp_path):
    settings = make_settings(tmp_path)
    conn = db.connect(settings.db_path)
    assert sync_source(conn, settings, FakeFeed(["a"])) == "ok"
    assert sync_source(conn, settings, FakeFeed(["a"])) == "unchanged"
    assert sync_source(conn, settings, FakeFeed(["a"]), force=True) == "ok"
    for t in (["b"], ["c"], ["d"]):
        sync_source(conn, settings, FakeFeed(t))
    assert len(list((settings.raw_dir / "fake").iterdir())) == settings.raw_keep_per_source


def test_run_once_with_import_files(tmp_path):
    settings = make_settings(tmp_path)
    settings.imports_dir.mkdir(parents=True)
    (settings.imports_dir / "manual.json").write_text(
        json.dumps([{"id": "hades", "type": "game", "title": "Hades"}]))

    assert run_once(settings) == {"storygraph": "skipped", "manual": "ok"}
    conn = db.connect(settings.db_path)
    assert titles(conn) == ["Hades"]
