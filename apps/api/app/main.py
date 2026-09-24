from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.routers import admin, auth, public, uploads
from app.services.storage import local_root

app = FastAPI(title="White Crane API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,  # auth cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public.router)
app.include_router(auth.router)
app.include_router(admin.router)

if settings.use_local_storage:
    app.include_router(uploads.router)
    app.mount("/files", StaticFiles(directory=local_root()), name="files")


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok"}
