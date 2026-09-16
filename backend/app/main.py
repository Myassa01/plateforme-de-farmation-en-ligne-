from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.exceptions.base import AppError
from app.routers import admin_users, auth, categories, courses, users

app = FastAPI(title="LearnHub API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppError)
def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(admin_users.router)
app.include_router(categories.router)
app.include_router(courses.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
