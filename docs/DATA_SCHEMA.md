# Georgia Legislation Data Schema

This document describes the JSON schema for bill data used throughout the project.

## Data Source

Data is fetched from the **LegiScan API** and enriched with AI-generated summaries via **Ollama**.

## Root Object Schema

The JSON file contains a wrapper object with metadata:

```json
{
  "generated_at": "2025-02-03T06:00:00Z",
  "source": "legiscan",
  "total_bills": 150,
  "bills": [...]
}
```

| Field          | Type   | Description                                   |
| -------------- | ------ | --------------------------------------------- |
| `generated_at` | string | ISO 8601 timestamp of generation              |
| `source`       | string | Data source identifier (`legiscan`)           |
| `total_bills`  | number | Total count of bills in the array             |
| `bills`        | array  | Array of bill objects                         |

## Bill Object Schema

Each bill object represents a single piece of legislation:

```json
{
  "doc_number": "HB 1",
  "caption": "Omnibus Education Reform Bill",
  "sponsors": "Rep. John Smith; Rep. Jane Doe",
  "committees": "Education Committee; Ways and Means Committee",
  "first_reader_summary": "This bill establishes comprehensive education standards...",
  "ai_summary": "This bill would change how schools teach students by...",
  "summary_model": "llama3.1",
  "summary_generated_at": "2025-02-03T06:00:00Z",
  "status_history": [
    {
      "date": "2024-01-15",
      "status": "Introduced"
    },
    {
      "date": "2024-01-20",
      "status": "Assigned to Committee"
    }
  ],
  "detail_url": "https://legiscan.com/GA/bill/HB1/2025"
}
```

## Field Specifications

### Required Fields

| Field                  | Type   | Description                                                          |
| ---------------------- | ------ | -------------------------------------------------------------------- |
| `doc_number`           | string | Bill identifier (e.g., "HB 1", "SB 50"). Format: `[HB\|SB] \d+`      |
| `caption`              | string | Official bill title/caption. 1-1000 characters.                      |
| `sponsors`             | string | Semicolon-separated list of sponsor names.                           |
| `committees`           | string | Semicolon-separated list of assigned committees.                     |
| `detail_url`           | string | Full URL to bill details. Must be valid HTTP(S) URL.                 |

### Optional Fields

| Field                  | Type   | Description                                                          |
| ---------------------- | ------ | -------------------------------------------------------------------- |
| `first_reader_summary` | string | Official bill description from legislature. May be empty.            |
| `ai_summary`           | string | AI-generated plain English summary. Added by Ollama pipeline.        |
| `summary_model`        | string | AI model used for summary (e.g., `llama3.1`).                        |
| `summary_generated_at` | string | ISO 8601 timestamp when AI summary was generated.                    |
| `status_history`       | array  | Array of status objects tracking bill progression. May be empty.     |

## Status History Object

```json
{
  "date": "2024-01-15",
  "status": "Introduced"
}
```

| Field    | Type   | Required | Description                                         |
| -------- | ------ | -------- | --------------------------------------------------- |
| `date`   | string | ✓        | Date in `YYYY-MM-DD` format                         |
| `status` | string | ✓        | Status text (e.g., "Introduced", "Passed Committee")|

## AI Summary Field

The `ai_summary` field contains a plain English explanation of the bill:

- **Purpose**: Make legislative text accessible to everyday citizens
- **Generation**: Created by Ollama API using `llama3.1` model
- **Content**: Explains what the bill does and who it affects
- **Style**: Avoids legal jargon, uses simple language

### Example AI Summary

**Original (first_reader_summary)**:
> "A BILL to be entitled an Act to amend Chapter 2 of Title 20 of the Official Code of Georgia
> Annotated, relating to elementary and secondary education, so as to provide for..."

**AI Summary**:
> "This bill would require all Georgia public schools to offer free breakfast and lunch to
> students, regardless of family income. It affects all K-12 public school students statewide."

## Validation Rules

The following validation is enforced:

- **Required fields**: `doc_number`, `caption`, `sponsors`, `committees`, `detail_url`
- **Field types**: All required fields must be strings
- **Field values**: No required fields may be empty or whitespace-only
- **Status history**: If present, must be an array of objects with `date` and `status`
- **Date format**: Status history dates should follow `YYYY-MM-DD` ISO 8601 format

## Example Valid Bill

```json
{
  "doc_number": "HB 42",
  "caption": "Healthcare Access Expansion Act",
  "sponsors": "Rep. Michael Chen; Rep. Patricia Lopez",
  "committees": "Health and Human Services; Appropriations",
  "first_reader_summary": "Expands healthcare access to underserved communities...",
  "ai_summary": "This bill would expand Medicaid coverage to more Georgia residents...",
  "summary_model": "llama3.1",
  "summary_generated_at": "2025-02-03T06:00:00Z",
  "status_history": [
    {
      "date": "2024-01-10",
      "status": "Introduced"
    },
    {
      "date": "2024-02-05",
      "status": "Referred to Health Committee"
    }
  ],
  "detail_url": "https://legiscan.com/GA/bill/HB42/2024"
}
```

## Data Generation

This data is generated by the backend pipeline:

1. **Data Source**: LegiScan API (legiscan.com)
2. **AI Enhancement**: Ollama API generates plain English summaries
3. **Automation**: GitHub Actions runs daily at 6 AM UTC
4. **Output**: JSON file deployed to GitHub Pages

## Frontend Expectations

The frontend (`src/App.tsx`) expects:

- Root level: Object with `bills` array OR plain array for backwards compatibility
- Each item: Valid bill object
- No null/undefined values in required fields
- AI summary: Optional, displayed when present

## Schema Versioning

Current schema version: **2.0**

### Changes from v1.0

- Added `ai_summary` field for plain English explanations
- Added `summary_model` field to track AI model used
- Added `summary_generated_at` timestamp
- Changed data source from web scraping to LegiScan API
- Added root wrapper object with metadata

## Troubleshooting

**Issue**: "Expected an array of bills"

- **Cause**: Old code expecting array root, new format uses object wrapper
- **Solution**: Frontend handles both formats via `Array.isArray()` check

**Issue**: "AI summary missing"

- **Cause**: Summary generation may have failed or timed out
- **Solution**: Check pipeline logs; bill displays without summary gracefully

**Issue**: "Missing required field"

- **Cause**: Bill object missing required field from LegiScan
- **Solution**: Check LegiScan API response; validate data before processing
