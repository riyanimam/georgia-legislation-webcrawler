# Georgia Legislation Web Scraper

A Python web scraper for collecting detailed information about Georgia state legislation from the Georgia General Assembly website (www.legis.ga.gov).

## Overview

This project automatically scrapes Georgia House and Senate bills, capturing:
- Bill numbers (HB/SB)
- Captions/summaries
- Assigned committees
- Sponsors
- First Reader Summary
- Status history with dates

## Features

- **JavaScript Rendering**: Uses Playwright for full Angular.js page rendering
- **Automated Scraping**: Efficiently processes multiple pages of legislation
- **Detailed Extraction**: Captures both basic info and detailed summaries
- **CI/CD Integration**: GitHub Actions workflow for automated scheduling
- **Error Handling**: Robust retry logic and failure recovery
- **Artifact Storage**: Saves results as JSON and uploads to GitHub

## Prerequisites

### Local Development

- Python 3.11+
- pip (Python package manager)
- ~500MB disk space for Chromium browser

### GitHub Actions

All dependencies are installed automatically during CI/CD runs.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/georgia-legislation-webcrawler.git
cd georgia-legislation-webcrawler
```

### 2. Create Virtual Environment (Recommended)

```bash
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Install Playwright Browser

```bash
playwright install chromium
```

### 5. Set Up Pre-commit Hooks (Recommended)

This project includes pre-commit hooks for code quality and formatting. Install them after setting up dependencies:

```bash
pre-commit install
```

This will automatically run linting and formatting checks before each commit.

## Development Setup

### Pre-commit Hooks

Pre-commit hooks are automatically executed before commits to ensure code quality. The configuration includes:

**Python Code**:
- **Ruff Linter**: Checks for code quality issues
  - Auto-fixes simple issues
  - Non-blocking (warnings only)
  - 100-character line length enforced

- **Ruff Formatter**: Ensures consistent code style
  - Automatic formatting on commit
  - Respects 100-character line limit

**YAML Files**:
- **YAML Formatter**: Consistent YAML formatting
  - Preserves quotes
  - Relaxed mode for flexibility
  
- **YAML Linter**: Validates YAML syntax
  - Uses relaxed rule set
  - Catches configuration errors

**Markdown Files**:
- **mdformat**: Markdown formatter with GitHub Flavored Markdown (GFM) support
  - Consistent formatting
  - Table support
  - 100-character wrapping

- **markdownlint**: Markdown linter
  - Auto-fixes issues where possible
  - Validates markdown structure

### Running Pre-commit Checks

```bash
# Run on all files
pre-commit run --all-files

# Run on staged files only
pre-commit run

# Run specific hook
pre-commit run ruff --all-files

# Skip hooks if needed
git commit --no-verify
```

## Usage

### Running Locally

```bash
# Scrape all pages (warning: takes several hours for full session)
python scraper.py

# Scrape limited pages for testing
python scraper.py 1          # Just 1 page
python scraper.py 5          # First 5 pages
```

### Output

The scraper generates `ga_legislation.json` with the following structure:

```json
[
  {
    "doc_number": "HB 1",
    "caption": "Pediatric Health Safe Storage Act; enact",
    "committees": "Public Safety and Homeland Security",
    "sponsors": "Au, Michelle; Cooper, Sharon; Oliver, Mary Margaret; ...",
    "detail_url": "https://www.legis.ga.gov/legislation/69281",
    "first_reader_summary": "A BILL to be entitled an Act to amend Part 3 of Article 4...",
    "status_history": [
      {
        "date": "01/15/2025",
        "status": "House Second Readers"
      },
      {
        "date": "01/14/2025",
        "status": "House First Readers"
      }
    ]
  },
  ...
]
```

## Architecture

### Main Components

#### `scraper.py`

The core scraper module containing the `GALegislationScraper` class:

- **`test_connection()`**: Verifies connectivity to the website
- **`scrape_and_save()`**: Main entry point for scraping and saving data
- **`get_all_pages()`**: Iterates through pagination and collects bills
- **`get_legislation_details()`**: Fetches detailed info from individual bill pages

### Key Technical Details

**JavaScript Rendering**: The Georgia legislature website uses Angular.js for dynamic content rendering. The scraper uses Playwright to:
1. Launch a headless Chromium browser
2. Navigate to each page
3. Wait for JavaScript to render content
4. Extract the fully-rendered HTML

**Detail Page Scraping**: For each bill found on the list page, the scraper:
1. Navigates to the bill's detail page
2. Waits for Angular to render the detail content
3. Extracts the First Reader Summary (h2 heading + card-text div)
4. Extracts Status History from the rendered table
5. Returns to the list page for the next bill

## CI/CD Pipeline

### GitHub Actions Workflow

The `.github/workflows/ci.yml` file defines an automated scraping job that:

**Trigger**: Manual dispatch with optional parameters
- Run on demand via "Workflow Dispatch"
- Optional: Specify max pages to scrape (leave empty for all)

**Jobs**:
1. **Connection Test**: Verifies website connectivity
2. **Scraping**: Runs the Python scraper
3. **Artifact Upload**: Stores results for 90 days
4. **Optional**: Can be extended to commit and push results

**Environment**:
- Python 3.11 on Ubuntu latest
- 2-hour timeout for long scraping sessions
- Automatic Playwright browser installation

### Running the Workflow

1. Go to the repository on GitHub
2. Click **Actions** tab
3. Select **Scrape Georgia Legislation** workflow
4. Click **Run workflow**
5. Optionally enter max pages parameter
6. View results in the completed job

## Performance

### Expected Timing

- **Single page**: ~3-4 minutes (20-25 bills)
- **Full session**: 30 minutes - 2+ hours depending on bill count

### Bottlenecks

- Browser launch: ~5 seconds
- Per bill detail fetch: ~8-10 seconds (includes page navigation and rendering)

### Optimization Notes

- The scraper includes 0.5-1 second delays between requests to avoid overloading the server
- 2-3 second delays between pages for courtesy
- Retry logic handles temporary failures gracefully

## Requirements

Dependencies are specified in `requirements.txt`:

```
# Core scraping tools
requests>=2.31.0       # HTTP client
beautifulsoup4>=4.12.0 # HTML parsing
playwright>=1.40.0     # Browser automation

# Development tools
pre-commit>=3.5.0             # Pre-commit hook framework
ruff>=0.1.0                   # Python linter & formatter
yamllint>=1.33.0              # YAML linter
mdformat>=0.7.17              # Markdown formatter
mdformat-gfm>=0.6.0           # GitHub Flavored Markdown support
mdformat-tables>=0.1.1        # Markdown table support
markdownlint-cli>=0.37.0      # Markdown linter
```

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'playwright'"

**Solution**: Ensure you've run both:
```bash
pip install -r requirements.txt
playwright install chromium
```

### Issue: Browser Launch Fails on GitHub Actions

**Solution**: The workflow includes automatic Playwright installation. If it fails:
- Check that `playwright install chromium` runs in the workflow
- Ensure sufficient disk space on the runner

### Issue: Getting Empty Summaries/Status History

**Solution**: This typically indicates:
- Page structure changed (Georgia legislature updates site frequently)
- JavaScript rendering incomplete
- Check `debug_detail.html` for actual page structure if regenerated

### Issue: Connection Timeout from GitHub Actions

**Solution**: 
- Try running locally first to test functionality
- Government servers often block cloud provider IPs
- Use the manual workflow trigger to control timing
- Check server status at www.legis.ga.gov

## Development

### Project Structure

```
georgia-legislation-webcrawler/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions workflow
├── .pre-commit-config.yaml           # Pre-commit hooks configuration
├── scraper.py                        # Main scraper module
├── requirements.txt                  # Python & dev dependencies
├── README.md                         # This file
└── LICENSE                           # MIT License
```

### Code Quality Standards

This project maintains code quality through:

1. **Pre-commit Hooks**: Automatically validate code before commits
   - Python linting with Ruff
   - YAML validation and formatting
   - Markdown linting and formatting

2. **Consistent Style**: All code adheres to:
   - 100-character line limit
   - Ruff's default configuration for Python
   - Standard markdown and YAML conventions

### Contributing

To improve the scraper:

1. Create a feature branch
2. Set up pre-commit hooks: `pre-commit install`
3. Test locally with `python scraper.py 1`
4. Make improvements to selectors or data extraction
5. Test with `python scraper.py 5` to verify performance
6. Pre-commit hooks will automatically format your code
7. Commit and push changes

**Note**: If pre-commit hooks block your commit:
- Review the suggested changes
- Most are auto-fixed; re-stage and commit again
- For critical issues, use `git commit --no-verify` to skip (not recommended)

### Common Maintenance Tasks

**If page structure changes**:
1. Run locally to generate debug files
2. Update CSS selectors in `get_legislation_details()`
3. Test with single page first
4. Let pre-commit hooks format your changes
5. Commit changes with notes about what changed

**Running code quality checks manually**:
```bash
# Format all files
ruff format .
ruff check --fix .

# Check markdown
mdformat --wrap 100 README.md
markdownlint --fix README.md

# Validate YAML
yamllint .github/workflows/ci.yml
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This scraper is for educational and research purposes. Always:
- Respect the website's terms of service
- Include appropriate delays between requests
- Use scraped data responsibly
- Check local laws regarding web scraping

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review GitHub Issues
3. Examine debug output files if generated
4. Test locally before assuming a production issue
