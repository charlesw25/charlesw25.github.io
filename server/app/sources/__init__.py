from ..config import Settings
from .base import Source, SourceUnavailable
from .letterboxd import LetterboxdSource
from .manual import ManualSource
from .storygraph import StoryGraphCsvSource


def enabled_sources(settings: Settings) -> list[Source]:
    sources: list[Source] = [
        StoryGraphCsvSource(settings.imports_dir / "storygraph.csv"),
        ManualSource(settings.imports_dir / "manual.json"),
    ]
    if settings.letterboxd_username:
        sources.append(LetterboxdSource(settings.letterboxd_username))
    return sources


__all__ = ["Source", "SourceUnavailable", "enabled_sources"]
