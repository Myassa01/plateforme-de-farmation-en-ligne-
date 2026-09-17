import uuid
from pathlib import Path

from fastapi import UploadFile

from app.core.config import settings
from app.exceptions.base import ConflictError

ALLOWED_VIDEO_TYPES = {
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/ogg": ".ogv",
}


class LocalStorageService:
    """Stores uploaded files on local disk. Swap for an S3/Azure-backed
    implementation later without touching callers - they only depend on
    save_video() and the public URL it returns."""

    def __init__(self) -> None:
        self.storage_dir = Path(settings.storage_dir)
        self.videos_dir = self.storage_dir / "videos"
        self.videos_dir.mkdir(parents=True, exist_ok=True)

    def save_video(self, file: UploadFile) -> str:
        content_type = file.content_type or ""
        if content_type not in ALLOWED_VIDEO_TYPES:
            raise ConflictError(
                "Unsupported video format. Allowed formats: mp4, webm, ogg."
            )

        max_bytes = settings.max_upload_size_mb * 1024 * 1024
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
        if size > max_bytes:
            raise ConflictError(f"Video exceeds the {settings.max_upload_size_mb}MB limit.")

        extension = ALLOWED_VIDEO_TYPES[content_type]
        filename = f"{uuid.uuid4()}{extension}"
        destination = self.videos_dir / filename

        with destination.open("wb") as out_file:
            while chunk := file.file.read(1024 * 1024):
                out_file.write(chunk)

        return f"/media/videos/{filename}"


storage_service = LocalStorageService()
