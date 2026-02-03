# Archived Code

This folder contains archived code that is preserved for future reference but is no longer actively
used.

## scraper.py

**Archived on:** February 2026

**Purpose:** Web scraper for Georgia legislation website (legis.ga.gov)

**Why archived:** Replaced with LegiScan API integration for more reliable and comprehensive data
access.

**Future use:** The scraping logic may be useful as a reference or fallback if API access is
unavailable.

## Reactivation

To reactivate the scraper:

1. Move `scraper.py` back to `backend/scraper.py`
2. Install dependencies: `pip install playwright beautifulsoup4 aiohttp`
3. Install Playwright browsers: `playwright install`
4. Run: `python -m backend.scraper`
