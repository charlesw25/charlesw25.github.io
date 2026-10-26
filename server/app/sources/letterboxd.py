import re
import urllib.request
import xml.etree.ElementTree as ET

from ..models import Review
from .base import Source, html_to_text

NS = {"letterboxd": "https://letterboxd.com", "tmdb": "https://themoviedb.org"}
USER_AGENT = "personal-site-sync/1.0 (+https://charlesw25.github.io)"
IMG_SRC = re.compile(r'<img[^>]+src="([^"]+)"')
SPOILER_NOTE = "This review may contain spoilers."


class LetterboxdSource(Source):
    """Diary entries and reviews from a profile's public RSS feed.

    The feed only carries the most recent entries, so this source upserts and
    older rows stay in the database after they scroll out of the feed.
    """

    name = "letterboxd"
    raw_suffix = ".xml"
    full_snapshot = False

    def __init__(self, username: str):
        self.username = username

    def fetch_raw(self) -> bytes:
        req = urllib.request.Request(
            f"https://letterboxd.com/{self.username}/rss/",
            headers={"User-Agent": USER_AGENT},
        )
        with urllib.request.urlopen(req, timeout=20) as resp:
            return resp.read()

    def parse(self, raw: bytes) -> list[Review]:
        root = ET.fromstring(raw)
        reviews = []
        for item in root.iter("item"):
            title = item.findtext("letterboxd:filmTitle", namespaces=NS)
            if not title:  # lists and other non-film items
                continue
            guid = item.findtext("guid") or item.findtext("link")
            if not guid:
                continue
            description = item.findtext("description") or ""
            poster = IMG_SRC.search(description)
            year = item.findtext("letterboxd:filmYear", namespaces=NS)
            rating = item.findtext("letterboxd:memberRating", namespaces=NS)

            review_text = None
            # Entries without a written review still get a "Watched on ..." blurb,
            # so only keep the description body when the guid marks a review.
            if "review" in guid:
                text = html_to_text(description)
                review_text = text.replace(SPOILER_NOTE, "").strip() or None

            reviews.append(Review(
                source=self.name,
                external_id=guid,
                type="movie",
                title=title,
                year=int(year) if year and year.isdigit() else None,
                rating=float(rating) if rating else None,
                review=review_text,
                date=item.findtext("letterboxd:watchedDate", namespaces=NS),
                cover_url=poster.group(1) if poster else None,
                url=item.findtext("link"),
            ))
        return reviews
