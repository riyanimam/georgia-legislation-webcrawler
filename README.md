# Georgia Legislation Web Scraper

A robust Python web scraper and interactive web UI for collecting and exploring detailed information
about Georgia state legislation from the [Georgia General Assembly](https://www.legis.ga.gov)
website.

## Overview

This project automates the collection of Georgia House and Senate bills with comprehensive data
extraction including bill numbers, captions, committee assignments, sponsors, summaries, and
legislative status history. Includes an interactive web dashboard for searching and filtering
results.

### What Gets Scraped

- Bill identifiers (HB/SB)
- Bill titles and captions
- Assigned committees
- Bill sponsors
- First Reader summaries
- Complete status history with dates

## Features

- 🎯 **JavaScript-Ready**: Playwright-based rendering for dynamic Angular.js content
- ⚙️ **Fully Automated**: CI/CD integration via GitHub Actions with scheduled runs
- 📊 **Comprehensive Data**: Captures both overview and detailed bill information
- 🛡️ **Resilient**: Built-in error handling and retry logic with data validation
- 📦 **Accessible Output**: JSON-formatted results with GitHub artifact storage
- 🎨 **Code Quality**: Pre-commit hooks for linting, formatting, and validation
- 🌐 **Beautiful UI**: Interactive web dashboard to explore and search legislation
- ♿ **Accessible**: ARIA labels and keyboard navigation support

## Documentation

- **[Backend Documentation](docs/BACKEND.md)** - Scraper setup and usage
- **[Frontend Documentation](docs/FRONTEND.md)** - UI features and deployment
- **[Data Schema](docs/DATA_SCHEMA.md)** - JSON structure and validation rules
- **[Contributing Guide](docs/CONTRIBUTING.md)** - How to contribute
- **[Refactoring Notes](docs/REFACTORING_NOTES.md)** - Code organization details

## Quick Start

### Prerequisites

- **Python 3.11+**
- **pip** (Python package manager)
- **~500MB disk space** (for Chromium browser)
- **Modern web browser** (for the interactive UI)

### Installation

```bash
# Clone the repository
git clone https://github.com/riyanimam/georgia-legislation-webcrawler.git
cd georgia-legislation-webcrawler

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
playwright install chromium

# Install pre-commit hooks (optional but recommended)
pre-commit install
```

## Project Structure

This project is organized into two main components:

```text
georgia-legislation-webcrawler/
├── backend/                     # Python web scraper
│   ├── scraper.py              # Main scraping application
│   └── README.md               # Backend documentation
├── frontend/                    # Interactive web UI
│   ├── index.html              # Main HTML markup
│   ├── styles.css              # Styling and animations
│   ├── script.js               # Application logic
│   └── README.md               # Frontend documentation
├── .github/
│   └── workflows/              # CI/CD automation
├── requirements.txt            # Python dependencies
├── pyproject.toml              # Project metadata
├── README.md                   # This file
└── ga_legislation.json         # Generated data (created by scraper)
```

### Backend vs Frontend

| Aspect       | Backend                                | Frontend                                 |
| ------------ | -------------------------------------- | ---------------------------------------- |
| **Location** | `backend/`                             | `frontend/`                              |
| **Purpose**  | Collect data from website              | Display data interactively               |
| **Tech**     | Python, Playwright, BeautifulSoup      | HTML5, CSS3, Vanilla JS                  |
| **Runs**     | Scheduled via GitHub Actions           | In web browser                           |
| **Output**   | JSON file                              | User interface                           |
| **Docs**     | [backend/README.md](backend/README.md) | [frontend/README.md](frontend/README.md) |

See individual README files for detailed documentation on each component.

### Viewing Results with the Interactive UI

The project includes a beautiful, reactive web interface to explore the scraped legislation:

1. **Run the scraper** to generate `ga_legislation.json`:

   ```bash
   python backend/scraper.py
   ```

2. **Open the UI** in your browser:

   - Serve locally: `python -m http.server 8000` then visit `http://localhost:8000/frontend/`
   - Or use VS Code Live Server: right-click `frontend/index.html` and "Open with Live Server"

**UI Features:**

- 🔍 **Search**: Find bills by number, caption, sponsor, or committee
- 🏷️ **Filter**: Filter by bill type (House/Senate)
- 📊 **Statistics**: View real-time counts and bill distribution
- 🔄 **Sort**: Organize results by bill number or caption
- 📖 **Details**: Click any bill to see full summary and status history
- 📁 **File Upload**: Load custom JSON files directly in the browser

### Running the Scraper

```bash
# Scrape all pages (several hours for complete session)
python backend/scraper.py

# Scrape limited pages for testing via environment variable
MAX_PAGES=5 python backend/scraper.py
```

## Output Format

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
  }
]
```

## Architecture

### How It Works

The scraper uses Playwright to handle JavaScript rendering and extract data from dynamic pages:

1. **Page Navigation**: Launches a headless Chromium browser and navigates through bill listings
2. **JavaScript Execution**: Waits for Angular.js to render the full page content
3. **Data Extraction**: Parses HTML with BeautifulSoup to extract bill information
4. **Detail Collection**: For each bill, navigates to the detail page to capture summaries and
   status history
5. **Graceful Handling**: Includes delays between requests and retry logic for reliability

### Performance Expectations

| Scope        | Time            | Notes                           |
| ------------ | --------------- | ------------------------------- |
| Single page  | 3-4 min         | ~20-25 bills per page           |
| Full session | 30 min - 2+ hrs | Depends on bill count per year  |
| Per bill     | ~8-10 sec       | Includes navigation & rendering |

**Key optimizations:**

- 0.5-1 second delays between requests
- 2-3 second delays between pages
- Intelligent retry logic for transient failures

## Code Quality

### Pre-commit Hooks

This project uses pre-commit hooks to maintain code quality automatically. Hooks are configured for:

#### Python Code

- `ruff`: Linting and auto-formatting with 100-character line limit
- Runs automatically before each commit

#### YAML Files

- `yamllint`: Validates configuration files
- Detects syntax errors early

#### Markdown Files

- `mdformat`: Consistent formatting with GitHub Flavored Markdown support
- `markdownlint`: Enforces markdown conventions
- 100-character line wrapping

### Running Code Quality Checks

```bash
# Install hooks (one-time setup)
pre-commit install

# Run checks on all files
pre-commit run --all-files

# Run checks on staged files only
pre-commit run

# Run specific tool
pre-commit run ruff --all-files

# Bypass hooks if necessary (not recommended)
git commit --no-verify
```

Most issues are automatically fixed; re-stage and commit again after corrections.

## Continuous Integration

### GitHub Actions Workflow

The project includes an automated CI/CD pipeline (`.github/workflows/ci.yml`) that:

- Runs on manual trigger via "Workflow Dispatch"
- Tests website connectivity before scraping
- Executes the scraper with optional page limits
- Uploads results as GitHub artifacts (90-day retention)
- Can be extended to commit and push results

### Running the Workflow

1. Go to the repository on GitHub
2. Click the **Actions** tab
3. Select **Scrape Georgia Legislation** workflow
4. Click **Run workflow**
5. Optionally specify maximum pages to scrape
6. Monitor progress and download results when complete

## Troubleshooting

### ModuleNotFoundError: No module named 'playwright'

Ensure both installation steps are completed:

```bash
pip install -r requirements.txt
playwright install chromium
```

### Browser Launch Fails on GitHub Actions

The workflow includes automatic Playwright setup. If it fails:

- Verify sufficient disk space on runner
- Check that `playwright install chromium` runs in workflow
- Review GitHub Actions logs for specific error

### Empty Summaries or Status History

This typically indicates:

- Georgia legislature website structure changed
- JavaScript rendering incomplete
- Solution: Test locally first, then update CSS selectors if needed

### Connection Timeout from GitHub Actions

- Government servers often block cloud provider IPs
- Test functionality locally first
- Try running workflow at different times
- Check [Georgia General Assembly website](https://www.legis.ga.gov) status

## Development

### Project Structure

```txt
georgia-legislation-webcrawler/
├── .github/
│   └── workflows/
│       ├── ci.yml                      # Automated scraping workflow
│       ├── semantic-release.yml        # Release automation
│       └── validate-pr-title.yml       # PR title validation
├── .pre-commit-config.yaml             # Pre-commit hooks configuration
├── .releaserc.json                     # Semantic-release configuration
├── scraper.py                          # Main scraper module
├── requirements.txt                    # Python & development dependencies
├── pyproject.toml                      # Project metadata
├── README.md                           # This file
└── LICENSE                             # MIT License
```

### Contributing

To contribute improvements:

1. Create a feature branch from `main`
2. Install pre-commit hooks: `pre-commit install`
3. Test locally: `python scraper.py 1` (single page test)
4. Make your improvements
5. Test with: `python scraper.py 5` (verify performance)
6. Pre-commit hooks will automatically format code
7. Commit and push changes

**PR Title Format**: Use semantic commit convention

- Examples: `feat: Add new scraper feature`, `fix(scraper): Handle edge case`

### Maintenance Tasks

**If page structure changes:**

1. Generate debug files locally
2. Update CSS selectors in scraper.py
3. Test with single page first
4. Verify with multiple pages
5. Pre-commit hooks will format automatically

**Code quality checks:**

```bash
# Format Python code
ruff format .
ruff check --fix .

# Format markdown
mdformat --wrap 100 README.md
markdownlint --fix README.md

# Validate YAML
yamllint .github/workflows/
```

## Dependencies

| Package            | Purpose                                     |
| ------------------ | ------------------------------------------- |
| `requests`         | HTTP client for web requests                |
| `beautifulsoup4`   | HTML parsing and data extraction            |
| `playwright`       | Browser automation for JavaScript rendering |
| `ruff`             | Python linting and formatting               |
| `yamllint`         | YAML validation                             |
| `mdformat`         | Markdown formatting with GFM support        |
| `markdownlint-cli` | Markdown linting                            |
| `pre-commit`       | Pre-commit hook framework                   |

## Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/CONTRIBUTING.md) for:

- Development setup
- Code style guidelines
- Testing procedures
- PR submission process
- Branch naming conventions

### Reporting Issues

Found a bug? Have a feature request?

1. Check if the issue already exists
2. Provide clear reproduction steps
3. Include relevant error messages
4. Specify your environment (OS, Python version, etc.)

### Development Workflow

```bash
# Setup
git clone https://github.com/riyanimam/georgia-legislation-webcrawler.git
cd georgia-legislation-webcrawler
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm install

# Make changes on a feature branch
git checkout -b feat/your-feature

# Run validation
ruff check backend/
biome check

# Test thoroughly before committing
git commit -am "feat: Description of changes"
git push origin feat/your-feature
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Disclaimer

This scraper is provided for educational and research purposes. When using it, please:

- Respect the website's terms of service
- Include appropriate delays between requests
- Use scraped data responsibly and ethically
- Review local laws regarding web scraping
- Don't overload the government servers

## Support & Questions

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review [GitHub Issues](https://github.com/riyanimam/georgia-legislation-webcrawler/issues)
3. Test functionality locally before assuming production issues
4. Examine debug output files if generated
5. Check if the Georgia General Assembly website is accessible
