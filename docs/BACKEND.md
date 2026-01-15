# Backend - Georgia Legislation Web Scraper

Python web scraper for collecting detailed information about Georgia state legislation.

## Overview

This directory contains all backend code for the Georgia Legislation Web Scraper - a robust,
automated tool for extracting legislative data from the Georgia General Assembly website.

## Technology Stack

- **Python 3.11+**: Core language
- **Playwright**: Browser automation for JavaScript-rendered pages
- **BeautifulSoup4**: HTML parsing and data extraction
- **Requests**: HTTP client for web requests

## File Structure

```text
backend/
├── scraper.py       # Main scraping application
└── README.md        # This file
```

## What Gets Scraped

The scraper collects comprehensive information about each bill:

- **Identifiers**: House Bill (HB) or Senate Bill (SB) numbers
- **Metadata**: Bill titles, captions, and descriptions
- **Committees**: Assigned committee information
- **Sponsors**: Primary sponsors and co-sponsors
- **Summaries**: First reader summaries from detail pages
- **Status**: Complete legislative status history with dates
- **URLs**: Links to original bill pages for verification

## Features

- ✅ **JavaScript Support**: Playwright renders Angular.js content properly
- ✅ **Pagination**: Automatically iterates through all legislation pages
- ✅ **Error Handling**: Retry logic with exponential backoff
- ✅ **Detail Extraction**: Fetches additional info from individual bill pages
- ✅ **Connection Validation**: Pre-flight test to ensure website connectivity
- ✅ **Formatted Output**: Clean JSON with proper indentation
- ✅ **Flexible Execution**: Optional page limit for testing
- ✅ **Code Quality**: Enforced 100-character line limit via ruff

## How It Works

### Main Components

```python
scraper.py
├── test_connection()          # Verify website accessibility
├── get_all_pages()            # Iterate through paginated bills
├── extract_bill_data()        # Parse bill overview info
├── get_legislation_details()  # Fetch detail page info
├── scrape_and_save()          # Orchestrate everything
└── if __name__ == "__main__"  # CLI entry point
```

### Scraping Flow

1. **Connection Test**: Verify the Georgia General Assembly website is reachable
2. **Page Iteration**: Start at the first page of legislation
3. **Bill Extraction**: Parse each bill from the page
4. **Detail Fetching**: For each bill, fetch its detail page
5. **Data Consolidation**: Combine overview and detail data
6. **JSON Export**: Save results to `ga_legislation.json`
7. **Error Handling**: Retry failed requests with backoff

### Key Functions

#### test_connection()

Validates that the website is accessible before scraping starts.

```python
def test_connection():
    """Test if we can connect to the website"""
    try:
        response = requests.head(BASE_URL, timeout=10)
        return response.status_code == 200
    except requests.RequestException:
        return False
```

#### get_all_pages(max_pages)

Iterates through paginated bill listings, optionally limited to a number of pages.

```python
def get_all_pages(max_pages=None):
    """Iterate through all legislation pages"""
    page_num = 1
    all_bills = []
    while max_pages is None or page_num <= max_pages:
        # Fetch and parse page...
        page_num += 1
    return all_bills
```

#### extract_bill_data(bill_element)

Extracts bill information from the page HTML.

```python
def extract_bill_data(bill_element):
    """Extract bill information from an HTML element"""
    return {
        "doc_number": "HB 123",
        "caption": "Bill title",
        "sponsors": "Rep. Name",
        "committees": "Committee Name",
        "detail_url": "https://..."
    }
```

#### get_legislation_details(page, url)

Fetches and parses additional data from a bill's detail page.

```python
def get_legislation_details(page, url):
    """Get detailed information from bill's detail page"""
    return {
        "first_reader_summary": "Summary text",
        "status_history": [
            {"date": "2024-01-15", "status": "Status text"}
        ]
    }
```

#### scrape_and_save()

Orchestrates the entire scraping workflow and saves results.

```python
def scrape_and_save():
    """Main scraping workflow"""
    if not test_connection():
        print("Cannot connect to website")
        return
    
    bills = get_all_pages()
    for bill in bills:
        bill.update(get_legislation_details(bill["detail_url"]))
    
    save_to_json(bills)
```

## Installation

### Prerequisites

- Python 3.11 or higher
- pip package manager

### Setup

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# This will download Playwright's Chromium browser (~500MB)
playwright install chromium
```

## Usage

### Run Locally

```bash
# From project root
python backend/scraper.py

# Or with page limit (for testing)
MAX_PAGES=3 python backend/scraper.py
```

### Environment Variables

- `MAX_PAGES`: Limit to N pages for testing (default: all pages)

### Output

The scraper generates `ga_legislation.json` in the project root with format:

```json
[
  {
    "doc_number": "HB 1",
    "caption": "Bill title",
    "sponsors": "Sponsor names",
    "committees": "Committee assignments",
    "first_reader_summary": "Summary",
    "status_history": [
      {"date": "2024-01-15", "status": "Introduced"}
    ],
    "detail_url": "https://..."
  }
]
```

## Automation via CI/CD

The scraper is automated via GitHub Actions:

- **Workflow**: `.github/workflows/ci.yml`
- **Trigger**: Manual dispatch or scheduled (configurable)
- **Artifacts**: JSON file stored as GitHub artifact
- **Retention**: 90 days

### GitHub Actions Dispatch

Manually trigger from Actions tab with optional `max_pages` parameter.

## Error Handling

The scraper includes robust error handling:

- **Retry Logic**: Automatically retries failed requests with exponential backoff
- **Connection Validation**: Pre-flight test before scraping starts
- **Graceful Degradation**: Continues even if individual bill details fail
- **Timeout Protection**: Requests timeout after 30 seconds
- **Page Navigation**: Detects end of pagination automatically

### Common Issues

| Issue              | Cause                   | Solution                          |
| ------------------ | ----------------------- | --------------------------------- |
| Connection timeout | Website unreachable     | Check internet connection         |
| Empty results      | Selector mismatch       | Update CSS selectors in code      |
| Playwright errors  | Browser download failed | Run `playwright install chromium` |
| Memory errors      | Too many pages          | Use `MAX_PAGES` to limit          |

## Development

### Code Quality

All Python code follows these standards:

- **Linting**: Checked by ruff
- **Formatting**: Enforced by ruff (100-char line limit)
- **Pre-commit**: Hooks validate on commit

### Testing

Currently manual testing. Future improvements could include:

```bash
# Run with small page limit for quick validation
MAX_PAGES=1 python backend/scraper.py

# Validate output JSON
python -m json.tool ga_legislation.json > /dev/null && echo "Valid JSON"
```

### Extending the Scraper

To add new fields:

1. **Locate Data**: Find where it appears in the HTML
2. **Add Selector**: Create a CSS or XPath selector
3. **Parse It**: Add extraction code to relevant function
4. **Validate**: Test with a single page (`MAX_PAGES=1`)
5. **Document**: Update README and docstrings

## Performance

- **Speed**: ~5-10 seconds per page (includes Playwright rendering)
- **Memory**: ~50MB base + ~1MB per 100 bills
- **Network**: ~2-5MB per complete scrape
- **Storage**: ~100-200KB per 100 bills in JSON

## Security Considerations

- No authentication required (public website)
- No rate limiting implemented (be respectful)
- No sensitive data collected
- All data is public legislative information

## Troubleshooting

### Playwright Installation Issues

```bash
# Reinstall Playwright browsers
playwright install chromium

# On Linux, may need system dependencies
apt-get install libxss1 libnss3  # Ubuntu/Debian
```

### Network Issues

```bash
# Test website connectivity
python -c "import requests; print(requests.get('https://www.legis.ga.gov').status_code)"

# Test Playwright
python -m playwright install --with-deps chromium
```

### Memory Issues

```bash
# Process in batches with page limit
MAX_PAGES=10 python backend/scraper.py
```

## Integration with Frontend

The backend generates `ga_legislation.json` that the frontend (`frontend/`) consumes:

1. Backend scraper runs and creates JSON
2. Frontend loads it (auto-loads or via file picker)
3. Users explore and filter results interactively

See [FRONTEND.md](FRONTEND.md) for frontend information.

## Future Enhancements

- [ ] Database integration for persistent storage
- [ ] Incremental scraping (delta updates)
- [ ] Change detection and notifications
- [ ] Vote data extraction
- [ ] Amendment tracking
- [ ] Historical comparisons
- [ ] API endpoint for frontend data
- [ ] Caching layer for repeated requests

## License

Same as parent project - see [../LICENSE](../LICENSE)

## Contributing

See [../README.md](../README.md) for contribution guidelines.
