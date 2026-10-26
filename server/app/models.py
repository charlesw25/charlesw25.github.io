from dataclasses import asdict, dataclass
from typing import Literal

ReviewType = Literal["book", "movie", "game"]
REVIEW_TYPES: tuple[ReviewType, ...] = ("book", "movie", "game")


@dataclass(frozen=True)
class Review:
    """One entry in the personal section, normalized across every source."""

    source: str
    external_id: str
    type: ReviewType
    title: str
    creator: str | None = None  # author, director, studio...
    year: int | None = None
    rating: float | None = None  # 0-5 scale
    review: str | None = None  # plain text, paragraphs separated by blank lines
    date: str | None = None  # ISO date the item was finished/watched/played
    cover_url: str | None = None
    url: str | None = None

    def to_row(self) -> dict:
        return asdict(self)
