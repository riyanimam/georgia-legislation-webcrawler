"""
FastAPI backend for Georgia Legislation Webcrawler.

Provides API endpoints for AI-generated bill summaries using Ollama.
"""

import json
import os
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .ollama_service import get_ollama_service

# Load environment variables from .env file
load_dotenv()

# Cache file for storing generated summaries
SUMMARY_CACHE_FILE = Path("summary_cache.json")


class SummaryRequest(BaseModel):
    """Request body for summary generation."""

    doc_number: str
    caption: str
    first_reader_summary: str | None = None
    sponsors: list[str] | None = None
    committees: list[str] | None = None
    force_regenerate: bool = False


class SummaryResponse(BaseModel):
    """Response body for summary generation."""

    doc_number: str
    ai_summary: str | None = None
    summary_status: str  # 'complete', 'failed', 'cached'
    summary_model: str | None = None
    summary_generated_at: str | None = None
    error: str | None = None
    cached: bool = False


class HealthResponse(BaseModel):
    """Response body for health check."""

    status: str
    ollama_available: bool
    model: str


def load_summary_cache() -> dict[str, Any]:
    """Load the summary cache from disk."""
    if SUMMARY_CACHE_FILE.exists():
        try:
            with open(SUMMARY_CACHE_FILE, encoding="utf-8") as f:
                return json.load(f)  # type: ignore[no-any-return]
        except (OSError, json.JSONDecodeError):
            return {}
    return {}


def save_summary_cache(cache: dict[str, Any]) -> None:
    """Save the summary cache to disk."""
    try:
        with open(SUMMARY_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2, ensure_ascii=False)
    except OSError as e:
        print(f"Warning: Could not save summary cache: {e}")


# Global cache
summary_cache: dict[str, Any] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown."""
    global summary_cache
    # Startup: Load cache
    summary_cache = load_summary_cache()
    print(f"Loaded {len(summary_cache)} cached summaries")
    yield
    # Shutdown: Save cache
    save_summary_cache(summary_cache)
    print("Saved summary cache")


app = FastAPI(
    title="Georgia Legislation API",
    description="API for AI-generated summaries of Georgia legislation",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        os.getenv("FRONTEND_URL", ""),  # Production frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Check API health and Ollama availability."""
    service = get_ollama_service()
    ollama_healthy = await service.check_health()

    return HealthResponse(
        status="healthy",
        ollama_available=ollama_healthy,
        model=service.model,
    )


@app.post("/api/summarize", response_model=SummaryResponse)
async def generate_summary(request: SummaryRequest):
    """
    Generate an AI summary for a bill.

    Returns a cached summary if available, unless force_regenerate is True.
    """
    global summary_cache

    # Check cache first (unless force regenerate)
    cache_key = request.doc_number
    if not request.force_regenerate and cache_key in summary_cache:
        cached = summary_cache[cache_key]
        return SummaryResponse(
            doc_number=request.doc_number,
            ai_summary=cached.get("ai_summary"),
            summary_status="complete",
            summary_model=cached.get("summary_model"),
            summary_generated_at=cached.get("summary_generated_at"),
            cached=True,
        )

    # Generate new summary
    service = get_ollama_service()

    # Convert sponsors/committees to list if needed
    sponsors = request.sponsors
    if isinstance(sponsors, str):
        sponsors = [sponsors]

    committees = request.committees
    if isinstance(committees, str):
        committees = [committees]

    result = await service.generate_summary(
        bill_number=request.doc_number,
        caption=request.caption,
        first_reader_summary=request.first_reader_summary,
        sponsors=sponsors,
        committees=committees,
    )

    if result.success:
        # Cache the result
        generated_at = datetime.utcnow().isoformat() + "Z"
        summary_cache[cache_key] = {
            "ai_summary": result.summary,
            "summary_model": result.model,
            "summary_generated_at": generated_at,
        }
        # Persist to disk
        save_summary_cache(summary_cache)

        return SummaryResponse(
            doc_number=request.doc_number,
            ai_summary=result.summary,
            summary_status="complete",
            summary_model=result.model,
            summary_generated_at=generated_at,
            cached=False,
        )
    else:
        return SummaryResponse(
            doc_number=request.doc_number,
            summary_status="failed",
            error=result.error,
        )


@app.get("/api/summary/{doc_number}", response_model=SummaryResponse)
async def get_cached_summary(doc_number: str):
    """Get a cached summary for a bill, if available."""
    if doc_number in summary_cache:
        cached = summary_cache[doc_number]
        return SummaryResponse(
            doc_number=doc_number,
            ai_summary=cached.get("ai_summary"),
            summary_status="complete",
            summary_model=cached.get("summary_model"),
            summary_generated_at=cached.get("summary_generated_at"),
            cached=True,
        )

    return SummaryResponse(
        doc_number=doc_number,
        summary_status="not_found",
        error="No cached summary available for this bill",
    )


@app.delete("/api/summary/{doc_number}")
async def delete_cached_summary(doc_number: str):
    """Delete a cached summary."""
    if doc_number in summary_cache:
        del summary_cache[doc_number]
        save_summary_cache(summary_cache)
        return {"status": "deleted", "doc_number": doc_number}

    raise HTTPException(status_code=404, detail="Summary not found")


# For running directly with: python -m backend.api
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("API_PORT", "8000"))
    uvicorn.run("backend.api:app", host="0.0.0.0", port=port, reload=True)
