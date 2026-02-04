"""
Ollama API integration for generating AI summaries of legislation.

This module provides an interface to the Ollama API for generating
plain-English summaries of Georgia legislation bills.
"""

import os
from dataclasses import dataclass
from typing import Any

import aiohttp

# Default configuration
DEFAULT_MODEL = "llama3.1"
DEFAULT_OLLAMA_HOST = "https://api.ollama.com"  # Cloud API endpoint
DEFAULT_TEMPERATURE = 0.3  # Lower temperature for more consistent outputs
DEFAULT_MAX_TOKENS = 300  # Sufficient for 2-3 sentence summaries


@dataclass
class SummaryResult:
    """Result of a summary generation request."""

    success: bool
    summary: str | None = None
    model: str = ""
    error: str | None = None
    tokens_used: int = 0


class OllamaService:
    """Service for interacting with Ollama API to generate bill summaries."""

    def __init__(
        self,
        api_key: str | None = None,
        host: str | None = None,
        model: str | None = None,
        temperature: float = DEFAULT_TEMPERATURE,
        max_tokens: int = DEFAULT_MAX_TOKENS,
    ):
        """
        Initialize the Ollama service.

        Args:
            api_key: Ollama API key. Defaults to OLLAMA_API_KEY env var.
            host: Ollama API host URL. Defaults to OLLAMA_HOST env var or cloud API.
            model: Model to use for generation. Defaults to OLLAMA_MODEL env var or gemma3.
            temperature: Sampling temperature (0.0-1.0). Lower = more consistent.
            max_tokens: Maximum tokens to generate.
        """
        self.api_key: str = api_key or os.getenv("OLLAMA_API_KEY") or ""
        self.host: str = (host or os.getenv("OLLAMA_HOST") or DEFAULT_OLLAMA_HOST).rstrip("/")
        self.model: str = model or os.getenv("OLLAMA_MODEL") or DEFAULT_MODEL
        self.temperature = temperature
        self.max_tokens = max_tokens

    def _get_headers(self) -> dict[str, str]:
        """Get HTTP headers for API requests."""
        headers = {
            "Content-Type": "application/json",
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def _build_prompt(
        self,
        bill_number: str,
        caption: str,
        first_reader_summary: str | None = None,
        sponsors: list[str] | None = None,
        committees: list[str] | None = None,
    ) -> str:
        """
        Build the prompt for generating a bill summary.

        Args:
            bill_number: The bill identifier (e.g., "HB 1").
            caption: The bill's short title/caption.
            first_reader_summary: The official first reader summary text.
            sponsors: List of bill sponsors.
            committees: List of assigned committees.

        Returns:
            Formatted prompt string for the LLM.
        """
        prompt_parts = [
            "You are a helpful assistant that explains legislation in plain, everyday English.",
            "Your goal is to help ordinary citizens understand what a bill does without legal jargon.",
            "",
            "Summarize the following Georgia legislation bill in 2-3 sentences.",
            "Focus on: what the bill would change, who it affects, and why it matters.",
            "Use simple language that anyone can understand.",
            "",
            f"Bill Number: {bill_number}",
            f"Title: {caption}",
        ]

        if sponsors:
            prompt_parts.append(f"Sponsors: {', '.join(sponsors)}")

        if committees:
            prompt_parts.append(f"Committees: {', '.join(committees)}")

        if first_reader_summary:
            prompt_parts.append("")
            prompt_parts.append("Official Summary:")
            prompt_parts.append(first_reader_summary[:2000])  # Limit to avoid context overflow

        prompt_parts.append("")
        prompt_parts.append("Plain English Summary:")

        return "\n".join(prompt_parts)

    async def generate_summary(
        self,
        bill_number: str,
        caption: str,
        first_reader_summary: str | None = None,
        sponsors: list[str] | None = None,
        committees: list[str] | None = None,
    ) -> SummaryResult:
        """
        Generate a plain-English summary of a bill.

        Args:
            bill_number: The bill identifier (e.g., "HB 1").
            caption: The bill's short title/caption.
            first_reader_summary: The official first reader summary text.
            sponsors: List of bill sponsors.
            committees: List of assigned committees.

        Returns:
            SummaryResult with the generated summary or error details.
        """
        prompt = self._build_prompt(
            bill_number=bill_number,
            caption=caption,
            first_reader_summary=first_reader_summary,
            sponsors=sponsors,
            committees=committees,
        )

        payload: dict[str, Any] = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": self.temperature,
                "num_predict": self.max_tokens,
            },
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.host}/api/generate",
                    json=payload,
                    headers=self._get_headers(),
                    timeout=aiohttp.ClientTimeout(total=60),
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        return SummaryResult(
                            success=False,
                            model=self.model,
                            error=f"API error {response.status}: {error_text}",
                        )

                    data = await response.json()

                    # Extract the generated text
                    summary = data.get("response", "").strip()
                    tokens_used = data.get("eval_count", 0)

                    if not summary:
                        return SummaryResult(
                            success=False,
                            model=self.model,
                            error="Empty response from model",
                        )

                    return SummaryResult(
                        success=True,
                        summary=summary,
                        model=self.model,
                        tokens_used=tokens_used,
                    )

        except aiohttp.ClientError as e:
            return SummaryResult(
                success=False,
                model=self.model,
                error=f"Network error: {str(e)}",
            )
        except Exception as e:
            return SummaryResult(
                success=False,
                model=self.model,
                error=f"Unexpected error: {str(e)}",
            )

    async def check_health(self) -> bool:
        """
        Check if the Ollama API is accessible.

        Returns:
            True if API is healthy, False otherwise.
        """
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.host}/api/tags",
                    headers=self._get_headers(),
                    timeout=aiohttp.ClientTimeout(total=10),
                ) as response:
                    return bool(response.status == 200)
        except Exception:
            return False


# Singleton instance for reuse
_service_instance: OllamaService | None = None


def get_ollama_service() -> OllamaService:
    """Get or create the Ollama service singleton."""
    global _service_instance
    if _service_instance is None:
        _service_instance = OllamaService()
    return _service_instance
