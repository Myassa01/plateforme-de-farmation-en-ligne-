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

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

MAX_IMAGE_SIZE_MB = 5


class LocalStorageService:
    """Stores uploaded files on local disk. Swap for an S3/Azure-backed
    implementation later without touching callers - they only depend on
    save_video()/save_image() and the public URL they return."""

    def __init__(self) -> None:
        self.storage_dir = Path(settings.storage_dir)
        self.videos_dir = self.storage_dir / "videos"
        self.videos_dir.mkdir(parents=True, exist_ok=True)
        self.images_dir = self.storage_dir / "images"
        self.images_dir.mkdir(parents=True, exist_ok=True)

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

    def save_image(self, file: UploadFile) -> str:
        content_type = file.content_type or ""
        if content_type not in ALLOWED_IMAGE_TYPES:
            raise ConflictError(
                "Unsupported image format. Allowed formats: jpg, png, webp."
            )

        max_bytes = MAX_IMAGE_SIZE_MB * 1024 * 1024
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
        if size > max_bytes:
            raise ConflictError(f"Image exceeds the {MAX_IMAGE_SIZE_MB}MB limit.")

        extension = ALLOWED_IMAGE_TYPES[content_type]
        filename = f"{uuid.uuid4()}{extension}"
        destination = self.images_dir / filename

        with destination.open("wb") as out_file:
            while chunk := file.file.read(1024 * 1024):
                out_file.write(chunk)

        return f"/media/images/{filename}"


storage_service = LocalStorageService()
