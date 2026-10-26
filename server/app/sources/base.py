from abc import ABC, abstractmethod
from html.parser import HTMLParser

from ..models import Review


class SourceUnavailable(Exception):
    """Nothing to sync right now (e.g. no import file yet). Not an error."""


class Source(ABC):
    name: str
    raw_suffix: str
    # True: each fetch is the complete data set, so rows missing from it get deleted.
    # False: each fetch is a recent window (like RSS), so rows are only added/updated.
    full_snapshot: bool

    @abstractmethod
    def fetch_raw(self) -> bytes: ...

    @abstractmethod
    def parse(self, raw: bytes) -> list[Review]: ...


class _TextExtractor(HTMLParser):
    BLOCK_TAGS = {"p", "div", "br", "li", "blockquote", "h1", "h2", "h3", "h4"}

    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag in self.BLOCK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in self.BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data):
        self.parts.append(data)


def html_to_text(html: str) -> str:
    """Flatten HTML to plain text so the API never serves markup to the browser."""
    extractor = _TextExtractor()
    extractor.feed(html)
    extractor.close()
    lines = [" ".join(line.split()) for line in "".join(extractor.parts).split("\n")]
    paragraphs: list[str] = []
    for line in lines:
        if line:
            paragraphs.append(line)
    return "\n\n".join(paragraphs)
