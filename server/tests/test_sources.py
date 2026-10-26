import json
from pathlib import Path

import pytest

from app.sources.base import SourceUnavailable
from app.sources.letterboxd import LetterboxdSource
from app.sources.manual import ManualSource
from app.sources.storygraph import StoryGraphCsvSource

FIXTURES = Path(__file__).parent / "fixtures"


def test_letterboxd_parses_reviews_and_diary_entries():
    items = LetterboxdSource("example").parse((FIXTURES / "letterboxd.xml").read_bytes())

    assert [i.title for i in items] == ["Perfect Days", "Heat"]  # list item skipped
    review, diary = items
    assert review.rating == 4.5
    assert review.year == 2023
    assert review.date == "2024-10-12"
    assert review.cover_url == "https://a.ltrbxd.com/poster-111.jpg"
    assert review.review == "Quiet and lovely.\n\nSecond paragraph & more."
    assert diary.review is None
    assert diary.rating == 4.0


def test_storygraph_keeps_only_read_books():
    items = StoryGraphCsvSource(Path("unused")).parse((FIXTURES / "storygraph.csv").read_bytes())

    assert [i.title for i in items] == ["Piranesi", "Untitled Zine"]
    piranesi, zine = items
    assert piranesi.creator == "Susanna Clarke"
    assert piranesi.rating == 4.75
    assert piranesi.date == "2024-02-10"
    assert piranesi.review == "Strange and beautiful.\n\nWould reread."
    assert piranesi.cover_url == "https://covers.openlibrary.org/b/isbn/9781635575637-M.jpg?default=false"
    assert zine.cover_url is None  # UID, not an ISBN
    assert zine.rating is None and zine.date is None


def test_storygraph_missing_export_is_skipped(tmp_path):
    with pytest.raises(SourceUnavailable):
        StoryGraphCsvSource(tmp_path / "storygraph.csv").fetch_raw()


def test_manual_source_validates_entries():
    good = [{"id": "hades", "type": "game", "title": "Hades", "rating": 5, "creator": "Supergiant"}]
    [item] = ManualSource(Path("unused")).parse(json.dumps(good).encode())
    assert item.type == "game" and item.creator == "Supergiant"

    with pytest.raises(ValueError):
        ManualSource(Path("unused")).parse(json.dumps([{"id": "x", "type": "album", "title": "X"}]).encode())
