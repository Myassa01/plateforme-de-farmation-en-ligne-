from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.exceptions.base import AppError
from app.routers import (
    admin_users,
    auth,
    categories,
    certificates,
    courses,
    curriculum,
    enrollments,
    notifications,
    player,
    quiz_attempts,
    quiz_builder,
    reviews,
    stats,
    users,
    wishlist,
)

app = FastAPI(title="LearnHub API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

storage_dir = Path(settings.storage_dir)
storage_dir.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(storage_dir)), name="media")


@app.exception_handler(AppError)
def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(admin_users.router)
app.include_router(categories.router)
app.include_router(certificates.router)
app.include_router(courses.router)
app.include_router(enrollments.router)
app.include_router(wishlist.router)
app.include_router(notifications.router)
app.include_router(curriculum.router)
app.include_router(player.router)
app.include_router(quiz_builder.router)
app.include_router(quiz_attempts.router)
app.include_router(reviews.router)
app.include_router(stats.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
