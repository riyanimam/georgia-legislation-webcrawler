# Georgia Legislation Tracker

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Languages](https://img.shields.io/badge/Languages-14-blue.svg)](docs/MULTILINGUAL_SUPPORT.md)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Code Quality](https://img.shields.io/badge/Code%20Quality-Biome-60A5FA?logo=biomejs&logoColor=white)](https://biomejs.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11.15-FF0055?logo=framer&logoColor=white)](https://www.framer.com/motion/)

A modern React-based web application for exploring Georgia state legislation with AI-powered plain
English summaries. Data is sourced from the [LegiScan API](https://legiscan.com).

## Overview

This project features a stunning React interface with smooth animations and an automated data
pipeline that fetches Georgia House and Senate bill data from LegiScan and generates AI-powered
summaries using Ollama.

### What's Included

- Bill identifiers (HB/SB)
- Bill titles and captions
- Assigned committees
- Bill sponsors
- First Reader summaries
- Complete status history with dates
- **AI-generated plain English summaries** ✨

## Features

- ⚛️ **Modern React UI**: Built with React 18, TypeScript, and Framer Motion
- 🎨 **Stunning Visuals**: Smooth animations, gradients, and interactive elements
- 🤖 **AI Summaries**: Plain English bill explanations powered by Ollama
- ⚙️ **Fully Automated**: Daily updates via GitHub Actions
- 📊 **Comprehensive Data**: LegiScan API provides official legislative data
- 🛡️ **Resilient**: Built-in error handling and retry logic
- 📦 **Fresh Data**: Daily pipeline runs keep information current
- 🎨 **Code Quality**: Pre-commit hooks for linting, formatting, and validation
- 🌐 **Beautiful UI**: Interactive web dashboard to explore and search legislation
- ♿ **Accessible**: ARIA labels and keyboard navigation support
- 🌙 **Dark Mode**: Toggle between light and dark themes
- ⚡ **Fast & Responsive**: Optimized with Vite for lightning-fast builds
- 🌍 **Multilingual**: 14 language translations available

## Documentation

- **[Backend Documentation](docs/BACKEND.md)** - Data pipeline and API setup
- **[Frontend Documentation](docs/FRONTEND.md)** - UI features and deployment
- **[Data Schema](docs/DATA_SCHEMA.md)** - JSON structure and validation rules
- **[Contributing Guide](docs/CONTRIBUTING.md)** - How to contribute
- **[CI/CD Documentation](docs/CI_CD.md)** - Testing and validation pipeline

## Quick Start

### Prerequisites

- **Node.js 20+**
- **npm** (Node package manager)
- **Python 3.11+** (for backend pipeline)

### Installation

```bash
# Clone the repository
git clone https://github.com/riyanimam/georgia-legislation-webcrawler.git
cd georgia-legislation-webcrawler

# Install frontend dependencies
npm install

# Start development server
npm run dev

# For backend pipeline setup:
pip install -r requirements.txt

# Install pre-commit hooks (optional but recommended)
pre-commit install
```

## Project Structure

```text
georgia-legislation-webcrawler/
├── src/                         # React application source
│   ├── components/             # React components
│   │   ├── __tests__/         # Component tests
│   │   ├── AnimatedBackground.tsx  # Background animations
│   │   ├── BillGrid.tsx       # Bill cards grid
│   │   ├── BillModal.tsx      # Bill detail modal (with AI summaries)
│   │   ├── Filters.tsx        # Search and filters
│   │   ├── Header.tsx         # Application header
│   │   └── Stats.tsx          # Statistics dashboard
│   ├── hooks/                  # Custom React hooks
│   │   └── useAISummary.ts    # AI summary hook
│   ├── i18n/                   # Translations (14 languages)
│   ├── test/                   # Test configuration
│   ├── App.tsx                # Main application
│   ├── App.css                # Global styles
│   ├── main.tsx               # Application entry
│   ├── types.ts               # TypeScript types
│   └── utils.ts               # Utility functions
├── backend/                     # Python data pipeline
│   ├── pipeline.py            # Main pipeline (fetch + summarize)
│   ├── legiscan_service.py    # LegiScan API client
│   ├── ollama_service.py      # Ollama AI client
│   └── api.py                 # Optional FastAPI server
├── archived/                    # Archived code
│   └── scraper.py             # Legacy web scraper (archived)
├── docs/                        # Documentation
├── tests/                       # Test suites
├── public/                      # Static assets
├── scripts/                     # Validation scripts
├── .github/workflows/          # CI/CD automation
│   └── data-pipeline.yml      # Daily data pipeline
├── index.html                   # HTML entry point
├── package.json                 # NPM dependencies
├── vite.config.ts               # Vite configuration
├── requirements.txt             # Python dependencies
└── ga_legislation.json          # Generated data
```

### Architecture Overview

| Component    | Purpose                            | Technology                       |
| ------------ | ---------------------------------- | -------------------------------- |
| **Frontend** | Interactive bill exploration UI    | React, TypeScript, Framer Motion |
| **Pipeline** | Fetch data + generate AI summaries | Python, LegiScan API, Ollama     |
| **CI/CD**    | Daily automated data updates       | GitHub Actions                   |
| **Hosting**  | Static site hosting                | GitHub Pages                     |

## Data Pipeline

The backend pipeline runs daily via GitHub Actions:

1. **Fetch**: Query LegiScan API for all Georgia legislation
2. **Summarize**: Generate plain English summaries via Ollama AI
3. **Deploy**: Upload JSON data to GitHub Pages

### Running the Pipeline Locally

```bash
# Set environment variables
export LEGISCAN_API_KEY="your-key"
export OLLAMA_API_KEY="your-key"

# Run the pipeline
python -m backend.pipeline
```

### Environment Variables

| Variable           | Required | Description                      |
| ------------------ | -------- | -------------------------------- |
| `LEGISCAN_API_KEY` | Yes      | API key from legiscan.com        |
| `OLLAMA_API_KEY`   | Yes      | API key for Ollama cloud service |

## AI Summaries

Bills include AI-generated plain English summaries powered by **Ollama** using the **llama3.1**
model. Summaries:

- Explain what the bill does in simple terms
- Avoid legal jargon
- Focus on who the bill affects
- Are generated automatically during the daily pipeline run

**Example:**

> **Original**: "A BILL to be entitled an Act to amend Chapter 2 of Title 20 of the Official Code of
> Georgia Annotated, relating to elementary and secondary education..."
>
> **AI Summary**: "This bill would require all Georgia public schools to offer free breakfast and
> lunch to students, regardless of family income."

## UI Features

- 🔍 **Advanced Search**: Find bills by number, caption, sponsor, committee, or summary
- 🏷️ **Smart Filters**: Filter by bill type, key issues, date ranges, and status
- 📊 **Live Statistics**: View animated real-time counts and bill distribution
- 🔄 **Flexible Sorting**: Organize by date, bill number (ascending/descending)
- 📖 **Interactive Details**: Click bills for modal with full information + AI summary
- ⭐ **Favorites**: Save bills to favorites for quick access
- 📥 **Export**: Download individual bills as CSV or JSON
- 🎨 **Beautiful Animations**: Smooth transitions powered by Framer Motion
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📱 **Responsive Design**: Works beautifully on all screen sizes
- 📁 **File Upload**: Load custom JSON files directly in the browser

## Building for Production

```bash
# Build the React app
npm run build

# Preview the production build
npm run preview
```

## Output Format

The pipeline generates `ga_legislation.json` with the following structure:

```json
{
  "generated_at": "2025-02-03T06:00:00Z",
  "source": "legiscan",
  "total_bills": 150,
  "bills": [
    {
      "doc_number": "HB 1",
      "caption": "Pediatric Health Safe Storage Act; enact",
      "committees": "Public Safety and Homeland Security",
      "sponsors": "Au, Michelle; Cooper, Sharon; ...",
      "detail_url": "https://legiscan.com/GA/bill/HB1/2025",
      "first_reader_summary": "A BILL to be entitled an Act...",
      "ai_summary": "This bill would require safe storage of firearms...",
      "summary_model": "llama3.1",
      "status_history": [
        { "date": "2025-01-15", "status": "House Second Readers" },
        { "date": "2025-01-14", "status": "House First Readers" }
      ]
    }
  ]
}
```

## Code Quality

### Pre-commit Hooks

This project uses pre-commit hooks for:

- **Python**: ruff (linting + formatting)
- **TypeScript/JavaScript**: Biome
- **Markdown**: mdformat + markdownlint
- **YAML**: yamllint

```bash
# Install hooks
pre-commit install

# Run on all files
pre-commit run --all-files
```

## Continuous Integration

### GitHub Actions Workflows

| Workflow            | Purpose                            | Trigger           |
| ------------------- | ---------------------------------- | ----------------- |
| `data-pipeline.yml` | Fetch data + AI summaries + deploy | Daily at 6 AM UTC |
| `deploy.yml`        | Build and deploy frontend          | Push to main      |
| `validate.yml`      | Run tests and linting              | Pull requests     |

## Dependencies

| Package         | Purpose                         |
| --------------- | ------------------------------- |
| `react`         | UI framework                    |
| `framer-motion` | Animations                      |
| `vite`          | Build tool                      |
| `aiohttp`       | Async HTTP client (Python)      |
| `python-dotenv` | Environment variable management |

## How to Contribute

Contributions are welcome! Please read our [Contributing Guide](docs/CONTRIBUTING.md) for:

- Development setup
- Code style guidelines
- Testing procedures
- PR submission process

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Disclaimer

This application is provided for educational and informational purposes. Legislative data is sourced
from LegiScan. AI summaries are generated automatically and should not be considered official legal
interpretations.

## Support & Questions

For issues or questions:

1. Check the [Documentation](docs/)
2. Review [GitHub Issues](https://github.com/riyanimam/georgia-legislation-webcrawler/issues)
3. Open a new issue with detailed information
