# Backend - Georgia Legislation Data Pipeline

Python data pipeline for collecting Georgia state legislation data via LegiScan API with
AI-powered plain English summaries.

## Overview

This directory contains the backend code for the Georgia Legislation Tracker - an automated
pipeline that fetches legislative data from LegiScan and generates AI summaries using Ollama.

## Technology Stack

- **Python 3.11+**: Core language
- **aiohttp**: Async HTTP client for API requests
- **LegiScan API**: Official legislative data source
- **Ollama API**: AI model for generating plain English summaries

## File Structure

```text
backend/
├── __init__.py           # Package initialization
├── pipeline.py           # Main data pipeline (fetch + summarize)
├── legiscan_service.py   # LegiScan API integration
├── ollama_service.py     # Ollama AI summary generation
└── api.py                # FastAPI server (optional local use)
```

## Data Pipeline

The pipeline runs in GitHub Actions and performs these steps:

1. **Fetch Legislation**: Query LegiScan API for all Georgia bills
2. **Generate Summaries**: Use Ollama AI to create plain English summaries
3. **Save Output**: Generate JSON artifact with all bill data
4. **Deploy**: Upload to GitHub Pages

### Pipeline Flow

```
LegiScan API → Fetch Bills → AI Summarization → JSON Output → GitHub Pages
```

## Environment Variables

| Variable           | Required | Description                          |
| ------------------ | -------- | ------------------------------------ |
| `LEGISCAN_API_KEY` | Yes      | API key from legiscan.com            |
| `OLLAMA_API_KEY`   | Yes      | API key for Ollama cloud service     |
| `OLLAMA_MODEL`     | No       | Model to use (default: `llama3.1`)   |
| `OLLAMA_BASE_URL`  | No       | Ollama API URL (default: cloud URL)  |

## Services

### LegiScan Service (`legiscan_service.py`)

Handles all interactions with the LegiScan API:

- `get_session_list()`: Get available legislative sessions
- `get_master_list()`: Get list of all bills in a session
- `get_bill()`: Get detailed bill information
- `search_bills()`: Search for bills by keyword
- `fetch_all_georgia_bills()`: Main method to fetch all Georgia legislation

### Ollama Service (`ollama_service.py`)

Handles AI summary generation:

- `generate_summary()`: Generate plain English summary for a bill
- `check_health()`: Verify API connectivity

**Model**: Uses `llama3.1` by default - recommended for legal/legislative text due to its strong
reasoning capabilities and context handling.

### Pipeline (`pipeline.py`)

Orchestrates the entire data flow:

```python
async def run_pipeline():
    # 1. Fetch all bills from LegiScan
    bills = await legiscan.fetch_all_georgia_bills()
    
    # 2. Generate AI summaries for each bill
    for bill in bills:
        summary = await ollama.generate_summary(bill)
        bill['ai_summary'] = summary
    
    # 3. Save output
    save_to_json(bills)
```

## Running Locally

### Prerequisites

- Python 3.11+
- LegiScan API key (get one at [legiscan.com](https://legiscan.com))
- Ollama API key

### Setup

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export LEGISCAN_API_KEY="your-key"
export OLLAMA_API_KEY="your-key"
```

### Run Pipeline

```bash
python -m backend.pipeline
```

### Output

The pipeline generates `ga_legislation.json` with structure:

```json
{
  "generated_at": "2025-02-03T06:00:00Z",
  "source": "legiscan",
  "total_bills": 150,
  "bills": [
    {
      "doc_number": "HB 1",
      "caption": "Bill title",
      "sponsors": "Rep. Name",
      "committees": "Committee Name",
      "first_reader_summary": "Original summary text...",
      "ai_summary": "Plain English: This bill would...",
      "summary_model": "llama3.1",
      "status_history": [
        {"date": "2025-01-15", "status": "Introduced"}
      ],
      "detail_url": "https://..."
    }
  ]
}
```

## Automation via GitHub Actions

The pipeline runs automatically via GitHub Actions:

- **Workflow**: `.github/workflows/data-pipeline.yml`
- **Schedule**: Daily at 6 AM UTC
- **Manual Trigger**: Workflow dispatch available
- **Artifacts**: JSON data expires after 1 day (overwritten daily)

### Secrets Required

Configure these in GitHub repository settings:

- `LEGISCAN_API_KEY`: Your LegiScan API key
- `OLLAMA_API_KEY`: Your Ollama API key

## Error Handling

The pipeline includes robust error handling:

- **API Retry Logic**: Automatic retries with exponential backoff
- **Rate Limiting**: Respects API rate limits
- **Graceful Degradation**: Continues if individual bill summaries fail
- **Timeout Protection**: Configurable request timeouts

## AI Summary Prompt

The Ollama service uses a carefully crafted prompt for legal text:

```
You are a helpful assistant that explains legislative bills in plain, everyday English.
Given the following bill information, provide a clear, concise summary that anyone can 
understand. Avoid legal jargon. Focus on what the bill would do and who it affects.
```

## Performance

- **Full Pipeline**: ~5-15 minutes depending on bill count
- **API Calls**: Batched and rate-limited appropriately
- **Memory**: Minimal - processes bills sequentially

## Archived Code

The original web scraper has been archived to `archived/scraper.py`. See the README in that
directory for reactivation instructions if needed.

## Future Enhancements

- [ ] Incremental updates (only process new/changed bills)
- [ ] Bill change detection and notifications
- [ ] Multiple state support via LegiScan
- [ ] Summary caching to reduce API calls
- [ ] Vote data and amendment tracking

## License

Same as parent project - see [../LICENSE](../LICENSE)
