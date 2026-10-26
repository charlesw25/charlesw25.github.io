import csv
import hashlib
import io
import re
from datetime import datetime
from pathlib import Path

from ..models import Review
from .base import Source, SourceUnavailable, html_to_text

ISBN = re.compile(r"^(\d{9}[\dX]|\d{13})$")


class StoryGraphCsvSource(Source):
    """Books from StoryGraph's own library export (Manage Account > Export StoryGraph Library).

    The export is the complete library, so this source is a full snapshot:
    drop a newer CSV in the imports folder and the next sync replaces the old one.
    """

    name = "storygraph"
    raw_suffix = ".csv"
    full_snapshot = True

    def __init__(self, csv_path: Path):
        self.csv_path = csv_path

    def fetch_raw(self) -> bytes:
        if not self.csv_path.exists():
            raise SourceUnavailable(f"no export at {self.csv_path}")
        return self.csv_path.read_bytes()

    def parse(self, raw: bytes) -> list[Review]:
        rows = csv.DictReader(io.StringIO(raw.decode("utf-8-sig")))
        reviews = []
        for row in rows:
            if (row.get("Read Status") or "").strip().lower() != "read":
                continue
            title = (row.get("Title") or "").strip()
            if not title:
                continue
            authors = (row.get("Authors") or "").strip() or None
            uid = (row.get("ISBN/UID") or "").strip()
            isbn = uid.replace("-", "") if ISBN.match(uid.replace("-", "")) else None
            rating = (row.get("Star Rating") or "").strip()
            review_html = (row.get("Review") or "").strip()

            reviews.append(Review(
                source=self.name,
                external_id=uid or _stable_id(title, authors),
                type="book",
                title=title,
                creator=authors,
                rating=float(rating) if rating else None,
                review=html_to_text(review_html) or None,
                date=_iso_date(row.get("Last Date Read")),
                # default=false makes Open Library 404 instead of serving a blank image,
                # so the page can fall back to a placeholder.
                cover_url=f"https://covers.openlibrary.org/b/isbn/{isbn}-M.jpg?default=false" if isbn else None,
            ))
        return reviews


def _stable_id(title: str, authors: str | None) -> str:
    return hashlib.sha1(f"{title}|{authors}".encode()).hexdigest()


def _iso_date(value: str | None) -> str | None:
    value = (value or "").strip()
    for fmt in ("%Y/%m/%d", "%Y-%m-%d", "%m/%d/%Y"):
        try:
            return datetime.strptime(value, fmt).date().isoformat()
        except ValueError:
            continue
    return None
