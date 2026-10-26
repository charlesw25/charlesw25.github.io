import json
from pathlib import Path

from ..models import REVIEW_TYPES, Review
from .base import Source, SourceUnavailable

FIELDS = ("title", "creator", "year", "rating", "review", "date", "cover_url", "url")


class ManualSource(Source):
    """Hand-written entries from a JSON file, for anything without a feed (e.g. games).

    The file is a list of objects with an "id", a "type" (book/movie/game), a "title"
    and any of the optional fields in FIELDS.
    """

    name = "manual"
    raw_suffix = ".json"
    full_snapshot = True

    def __init__(self, json_path: Path):
        self.json_path = json_path

    def fetch_raw(self) -> bytes:
        if not self.json_path.exists():
            raise SourceUnavailable(f"no file at {self.json_path}")
        return self.json_path.read_bytes()

    def parse(self, raw: bytes) -> list[Review]:
        reviews = []
        for i, entry in enumerate(json.loads(raw)):
            if entry.get("type") not in REVIEW_TYPES:
                raise ValueError(f"entry {i}: type must be one of {REVIEW_TYPES}")
            if not entry.get("id") or not entry.get("title"):
                raise ValueError(f"entry {i}: id and title are required")
            reviews.append(Review(
                source=self.name,
                external_id=str(entry["id"]),
                type=entry["type"],
                **{field: entry.get(field) for field in FIELDS},
            ))
        return reviews
