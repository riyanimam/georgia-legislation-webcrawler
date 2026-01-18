# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of the Georgia Legislation Web Crawler seriously. If you discover a security
vulnerability, please follow these steps:

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisories** (Preferred)

   - Navigate to the
     [Security tab](https://github.com/riyanimam/georgia-legislation-webcrawler/security/advisories)
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **Email**

   - Send an email to: <riyanimam@users.noreply.github.com>
   - Include "SECURITY" in the subject line
   - Provide detailed information about the vulnerability

### What to Include

Please include the following information in your report:

- Type of vulnerability (e.g., XSS, SQL injection, authentication bypass)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability
- Suggested fix (if available)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: 90+ days

### What to Expect

After submitting a vulnerability report:

1. We'll acknowledge receipt within 48 hours
2. We'll investigate and validate the issue
3. We'll work on a fix and keep you updated on progress
4. We'll notify you when the fix is released
5. We'll credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

When using this project:

1. **Keep Dependencies Updated**: Regularly update all dependencies
2. **Review Generated Data**: Inspect scraped data before using in production
3. **Rate Limiting**: Respect the configured rate limits to avoid IP bans
4. **API Keys**: Never commit API keys or secrets to the repository
5. **Data Privacy**: Be mindful of any personal information in scraped data

## Known Security Considerations

- This tool scrapes public data from the Georgia General Assembly website
- Playwright is used for browser automation - ensure you're running in a secure environment
- Cached data may contain sensitive information - handle appropriately
- Rate limiting is configured to be respectful - do not bypass these limits

## Security Updates

Security updates will be announced through:

- GitHub Security Advisories
- Release notes in CHANGELOG.md
- Git tags with version numbers

## Attribution

We believe in responsible disclosure and will credit security researchers who report valid
vulnerabilities (with permission).

Thank you for helping keep this project secure!
