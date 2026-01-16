# Contributing to Georgia Legislation Webcrawler

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

# Install Playwright browsers
playwright install chromium

# Install Node dependencies
npm install
```

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
refactor: Split script.js into modules
```

### Code Style

**Python:**

- Run `ruff check` to lint
- Run `ruff format` to format (100 character line limit)
- All code must pass pre-commit checks

**JavaScript:**

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
# Test with limited pages
MAX_PAGES=1 python backend/scraper.py

# Validate output JSON
python -m json.tool ga_legislation.json > /dev/null
```

**Frontend:**

1. Open `frontend/index.html` in browser
2. Test with `frontend/test-data.json`
3. Check console for errors (F12)
4. Test all filter combinations
5. Test keyboard navigation (ESC to close modal)

### Running Validation

```bash
# Python linting
ruff check backend/

# Python formatting
ruff format backend/ --check

# JavaScript/CSS validation
npm run biome -- check

# Markdown linting
markdownlint README.md docs/
```

## Before Submitting

1. **Update documentation** if adding/changing features
2. **Run validation tools** (ruff, biome, markdownlint)
3. **Test your changes** thoroughly
4. **Check for console errors** in browser DevTools
5. **Validate JSON output** from scraper

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
├── backend/              # Python scraper
├── frontend/             # HTML/CSS/JS UI
├── docs/                 # Documentation
├── .github/workflows/    # CI/CD
└── config/               # Configuration files
```

## Common Tasks

### Add a new filter to frontend

1. Add keyword mapping to `issueKeywords` in `script.js`
2. Add checkbox to HTML with unique ID
3. Ensure filtering logic includes the new category
4. Test with sample data

### Add a new data field from scraper

1. Update `scraper.py` extraction logic
2. Update `validate_bill_data()` if required field
3. Update frontend to display the field
4. Update test data schema

### Update documentation

1. Edit relevant `.md` files in `docs/`
2. Update schema if JSON format changes
3. Update README if project structure changes
4. Run `markdownlint` to validate

## Need Help?

- Check existing issues/PRs
- Review documentation in `docs/`
- See code comments for implementation details
- Test with `frontend/debug-upload.html` for frontend debugging

## Recognition

Contributors will be recognized in the project's contributor list.

Happy contributing! 🎉
