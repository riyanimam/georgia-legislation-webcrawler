# CI/CD Enhancement & Testing Documentation

## Overview

This document covers the comprehensive CI/CD enhancements including automated testing, schema
validation, and accessibility checks integrated into the GitHub workflow.

## Quick Start

### Running Tests Locally

```bash
# Install dependencies first
npm install

# Run all unit tests
npm test

# Run tests in watch mode (re-run on file changes)
npm test:watch

# Generate test coverage report
npm test:coverage

# Run all validation checks
npm run validate:all
```

### Validation Tools

```bash
# Validate JSON schema (checks scraped data)
npm run validate:schema [file.json]

# Example: Validate the main output
npm run validate:schema ga_legislation.json

# Validate HTML accessibility
npm run validate:a11y [html-file]

# Example: Check the frontend
npm run validate:a11y frontend/index.html
```

## Components

### 1. Unit Tests (Vitest)

**Location:** `tests/bill-processing.test.js`

**What It Tests:**

- Bill data validation (required fields, formats, structure)
- Filtering logic (HB/SB prefix, search, status)
- Latest status extraction
- Edge cases and error handling

**Coverage:**

- ✅ Valid bill object structure
- ✅ Missing required field detection
- ✅ Invalid URL format detection
- ✅ Empty array validation
- ✅ Case-insensitive search
- ✅ Multiple filter combinations
- ✅ Unknown status fallback

**Running Tests:**

```bash
npm test                    # Run once
npm test:watch             # Watch mode
npm test:coverage          # With coverage report
```

### 2. JSON Schema Validation

**Location:** `scripts/validate-schema.js`

**What It Validates:**

- All required fields present (`doc_number`, `caption`, `sponsors`, `detail_url`, `status_history`)
- Correct data types and formats
- Valid URLs
- ISO 8601 date format (YYYY-MM-DD)
- Bill number format (HB/SB followed by digits)
- Non-empty arrays where required

**Schema Definition:**

```javascript
{
  doc_number: string (pattern: /^(HB|SB)\d+$/)
  caption: string (non-empty)
  sponsors: array of strings (min 1 item)
  committees: array of strings (optional)
  detail_url: valid URL
  status_history: array of {date, status} (min 1 item)
    - date: ISO 8601 format
    - status: string (status description)
}
```

**Output Example:**

```text
📋 JSON Schema Validation Report
================================

File: ga_legislation.json
Status: ✅ VALID

Statistics:
  Total Bills: 150
  Valid Bills: 150
  Invalid Bills: 0
```

**Using It:**

```bash
npm run validate:schema ga_legislation.json
npm run validate:schema output.json
node scripts/validate-schema.js any-file.json
```

### 3. Accessibility Validation

**Location:** `scripts/validate-accessibility.js`

**What It Checks:**

- ARIA labels and roles usage
- Semantic HTML5 elements
- Image alt text
- Form label associations
- Heading hierarchy
- Color contrast consideration
- Button and link text accessibility
- Keyboard interaction support
- HTML lang attribute
- Video captions

**WCAG AA Compliance Checks:**

- ✅ Perceivable: alt text, color contrast
- ✅ Operable: keyboard navigation, interactive labels
- ✅ Understandable: semantic HTML, language declaration
- ✅ Robust: ARIA implementation, valid HTML

**Output Example:**

```text
♿ Accessibility Validation Report
==================================

File: frontend/index.html
Status: ✅ VALID

Checks:
  Passed: 6
  Failed: 0
```

**Using It:**

```bash
npm run validate:a11y frontend/index.html
node scripts/validate-accessibility.js frontend/index.html
```

## GitHub Workflow Integration

### Validate Workflow (.github/workflows/validate.yml)

**Triggers:** Pull requests

**Steps:**

1. Code quality checks (Ruff, Biome, Markdownlint)
2. Unit tests execution
3. JSON schema validation (if output exists)
4. Accessibility validation

**Example Job Output:**

```text
Run unit tests: PASSED
Validate JSON schema: PASSED
Validate accessibility: PASSED
```

### CI Workflow (.github/workflows/ci.yml)

**Triggers:** Manual dispatch or scheduled daily

**Enhancements:**

1. Scrapes Georgia legislation data
2. Validates output JSON against schema
3. Uploads to artifacts
4. Optional: commits to repository

**Critical Validation Step:**

```yaml
- name: Validate JSON schema
  if: steps.check_file.outputs.exists == 'true'
  continue-on-error: false
  run: node scripts/validate-schema.js ga_legislation.json
```

This ensures only valid data is uploaded.

## Test Examples

### Example 1: Valid Bill

```javascript
const validBill = {
  doc_number: 'HB 123',
  caption: 'An Act to establish Georgia education reform',
  sponsors: ['John Smith', 'Jane Doe'],
  committees: ['Judiciary Committee', 'Finance Committee'],
  detail_url: 'https://www.legis.ga.gov/bills/house/123',
  status_history: [
    { date: '2024-01-15', status: 'Introduced' },
    { date: '2024-02-20', status: 'Committee Review' }
  ]
};

// Result: ✅ VALID
```

### Example 2: Invalid Bill (Missing Required Field)

```javascript
const invalidBill = {
  doc_number: 'HB 123',
  caption: 'An Act to establish Georgia education reform',
  // Missing: sponsors
  committees: [],
  detail_url: 'https://www.legis.ga.gov/bills/house/123',
  status_history: [
    { date: '2024-01-15', status: 'Introduced' }
  ]
};

// Result: ❌ INVALID - sponsors array is required
```

### Example 3: Filtering Test

```javascript
const bills = [
  { doc_number: 'HB 1', caption: 'Education Reform', ... },
  { doc_number: 'SB 1', caption: 'Healthcare Bill', ... }
];

// Filter only HB bills
const hbOnly = filterBills(bills, { hbOnly: true });
// Result: [{ doc_number: 'HB 1', ... }]

// Filter by search term
const filtered = filterBills(bills, { searchTerm: 'Education' });
// Result: [{ doc_number: 'HB 1', caption: 'Education Reform', ... }]
```

## Best Practices

### Before Committing

```bash
# Run all tests and validation
npm run validate:all

# Check test coverage
npm test:coverage

# Fix any issues found
# Then commit with confidence
```

### When Adding New Features

1. Add unit test cases in `tests/bill-processing.test.js`
2. Run `npm test` to verify
3. If modifying scraper, run `npm run validate:schema`
4. If modifying HTML, run `npm run validate:a11y`
5. Commit with semantic message

### Debugging Test Failures

```bash
# Run tests with more detail
npm test -- --reporter=verbose

# Run specific test file
npm test -- tests/bill-processing.test.js

# Run tests with watch mode for development
npm test:watch
```

## CI/CD Pipeline Flow

```text
┌─────────────────────────┐
│  Pull Request Created   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Run Validation Checks  │
├─────────────────────────┤
│ - Code Quality (Ruff)   │
│ - Format (Biome)        │
│ - Markdown (Lint)       │
│ - Unit Tests (Vitest)   │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  PR Title Validation    │
│  (Semantic Commit)      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  All Checks Pass? ✓     │
│  Ready for Review       │
└─────────────────────────┘
```

## Troubleshooting

### Tests Fail Locally but Pass in CI

- Ensure `npm install` is run
- Check Node.js version: should be 20.x
- Clear node_modules: `rm -rf node_modules && npm install`

### Schema Validation Fails

- Check `docs/DATA_SCHEMA.md` for required structure
- Use `node scripts/validate-schema.js output.json` for detailed report
- Most common: missing required fields or invalid URLs

### Accessibility Warnings

- Review `.github/workflows/validate.yml` for specific warnings
- Check `docs/CONTRIBUTING.md` for accessibility guidelines
- Not all warnings are errors; document exceptions in comments

## Future Enhancements

- [ ] Integration tests with real data
- [ ] Performance benchmarks
- [ ] Visual regression testing
- [ ] E2E tests with Playwright
- [ ] PDF report generation for test results

## References

- [Vitest Documentation](https://vitest.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [JSON Schema](https://json-schema.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
