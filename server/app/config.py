import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    data_dir: Path
    allowed_origins: list[str]
    letterboxd_username: str | None
    sync_interval_hours: float
    raw_keep_per_source: int

    @property
    def db_path(self) -> Path:
        return self.data_dir / "personal.db"

    @property
    def raw_dir(self) -> Path:
        return self.data_dir / "raw"

    @property
    def imports_dir(self) -> Path:
        return self.data_dir / "imports"


def load_settings() -> Settings:
    origins = os.environ.get("ALLOWED_ORIGINS", "https://charlesw25.github.io")
    return Settings(
        data_dir=Path(os.environ.get("DATA_DIR", "./data")),
        allowed_origins=[o.strip() for o in origins.split(",") if o.strip()],
        letterboxd_username=os.environ.get("LETTERBOXD_USERNAME") or None,
        sync_interval_hours=float(os.environ.get("SYNC_INTERVAL_HOURS", "6")),
        raw_keep_per_source=int(os.environ.get("RAW_KEEP_PER_SOURCE", "20")),
    )
