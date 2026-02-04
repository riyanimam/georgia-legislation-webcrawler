# Contributing to Georgia Legislation Tracker

Thank you for your interest in contributing! This document provides guidelines and instructions for
contributing to this project.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- Git

### Setup Development Environment

```bash
# Clone the repository
git clone git@github.com:riyanimam/georgia-legislation-webcrawler.git
cd georgia-legislation-webcrawler

# Create Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Install Node dependencies
npm install

# Install pre-commit hooks (recommended)
pre-commit install
```

### Environment Variables

For backend development, you'll need:

```bash
export LEGISCAN_API_KEY="your-legiscan-api-key"
export OLLAMA_API_KEY="your-ollama-api-key"
```

Get your API keys from:

- LegiScan: [legiscan.com](https://legiscan.com)
- Ollama: [ollama.com](https://ollama.com)

## Making Changes

### Branch Naming Convention

Follow semantic commit convention for branch names:

```bash
feat/description      # New feature
fix/description       # Bug fix
docs/description      # Documentation
refactor/description  # Code refactoring
test/description      # Tests
chore/description     # Maintenance
```

### Commit Messages

Follow semantic commit format:

```bash
feat: Add bill export to CSV feature
fix: Resolve modal close button misalignment
docs: Update API schema documentation
refactor: Split pipeline into modules
```

### Code Style

**Python:**

- Run `ruff check` to lint
- Run `ruff format` to format (100 character line limit)
- All code must pass pre-commit checks

**TypeScript/JavaScript:**

- Use `biome check` for linting
- Use `biome format` for formatting
- Add JSDoc comments to all functions
- Use semantic HTML5 and ARIA labels for accessibility

**CSS:**

- Follow BEM naming convention
- Group styles by feature/component
- Ensure WCAG AA color contrast

### Testing Changes

**Backend:**

```bash
# Run the pipeline locally
python -m backend.pipeline

# Validate output JSON
python -m json.tool ga_legislation.json > /dev/null
```

**Frontend:**

```bash
# Start dev server
npm run dev

# Run tests
npm test

# Build and check for errors
npm run build
```

### Running Validation

```bash
# Python linting
ruff check backend/

# Python formatting
ruff format backend/ --check

# TypeScript/JavaScript validation
npm run biome -- check

# Markdown linting
markdownlint README.md docs/
```

## Before Submitting

1. **Update documentation** if adding/changing features
2. **Run validation tools** (ruff, biome, markdownlint)
3. **Test your changes** thoroughly
4. **Check for console errors** in browser DevTools
5. **Validate JSON output** if modifying pipeline

## PR Guidelines

### PR Title Format

Follow semantic commit format (enforced by pre-commit):

```bash
feat: Add feature description
fix: Fix bug description
docs: Update documentation
```

### PR Checklist

- [ ] Follows code style guidelines
- [ ] All validation tools pass
- [ ] Changes tested locally
- [ ] Documentation updated
- [ ] No debug console.log statements
- [ ] Accessibility improvements (if UI change)
- [ ] No hardcoded data or API keys

### Types of PRs

Use appropriate labels:

- `feature` - New functionality
- `bug` - Bug fix
- `docs` - Documentation
- `refactor` - Code improvement
- `performance` - Performance optimization
- `accessibility` - A11y improvements

## Project Structure

```text
georgia-legislation-webcrawler/
├── backend/              # Python data pipeline
│   ├── pipeline.py       # Main pipeline orchestration
│   ├── legiscan_service.py   # LegiScan API client
│   └── ollama_service.py     # Ollama AI client
├── src/                  # React frontend
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   └── i18n/             # Translations
├── docs/                 # Documentation
├── archived/             # Archived code (old scraper)
├── .github/workflows/    # CI/CD automation
└── tests/                # Test suites
```

## Common Tasks

### Add a new filter to frontend

1. Add filter logic to `Filters.tsx`
2. Update state in `App.tsx`
3. Test with sample data
4. Ensure accessibility (ARIA labels, keyboard nav)

### Add a new data field from LegiScan

1. Update `legiscan_service.py` to extract the field
2. Update `types.ts` TypeScript interface
3. Update frontend to display the field
4. Update `DATA_SCHEMA.md` documentation

### Modify AI summary generation

1. Update prompt in `ollama_service.py`
2. Test with sample bills locally
3. Check output quality before committing

### Update documentation

1. Edit relevant `.md` files in `docs/`
2. Update schema if JSON format changes
3. Update README if project structure changes
4. Run `markdownlint` to validate

## Need Help?

- Check existing issues/PRs
- Review documentation in `docs/`
- See code comments for implementation details

## Recognition

Contributors will be recognized in the project's contributor list.

Happy contributing! 🎉
