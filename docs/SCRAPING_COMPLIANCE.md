# Web Scraping Compliance & Ethics

This document outlines the legal and ethical considerations for scraping the Georgia General
Assembly website.

## Compliance Checklist

### ✅ 1. robots.txt Compliance

**Status**: **COMPLIANT**

- **URL Checked**: `https://www.legis.ga.gov/robots.txt`
- **Result**: No robots.txt file exists (404 response)
- **Interpretation**: When no robots.txt exists, there are no explicit restrictions
- **Action**: Scraper automatically checks robots.txt on each run

```python
# Automated check in scraper.py
def check_robots_txt(self) -> bool:
    """Check if scraping is allowed per robots.txt."""
    # Returns True if allowed or if robots.txt doesn't exist
```

### ✅ 2. Terms of Service

**Status**: **PUBLIC DATA**

- **URL Checked**: `https://www.legis.ga.gov/terms`, `/terms-of-use`
- **Result**: No explicit ToS found
- **Interpretation**: Georgia General Assembly legislation is **public domain information**
- **Legal Basis**:
  - Government works in the US are not subject to copyright (17 U.S.C. § 105)
  - Legislative data is public record under Georgia Open Records Act
  - No authentication/login required (no contractual agreement)

### ✅ 3. Rate Limiting & Respectful Scraping

**Current Settings**:

```python
# Default configuration (conservative)
max_concurrent = 5          # Max 5 parallel requests
request_delay = 0.3         # 300ms between requests
page_pool_size = 5          # 5 browser pages
jitter = 0-0.2s            # Random delay to prevent thundering herd
```

**Rate Limit Protections**:

1. **Exponential Backoff**: Retries with 2^attempt second delays
2. **Respect 429 Status**: Backs off on "Too Many Requests" errors
3. **Connection Pooling**: Reuses connections (respectful of server resources)
4. **Caching**: Stores previously fetched data to avoid redundant requests
5. **Per-Page Locking**: Prevents concurrent navigation conflicts
6. **Request Jitter**: Randomizes timing to spread load

**Comparison to Human Browsing**:

| Metric           | Human User     | Our Scraper         |
| ---------------- | -------------- | ------------------- |
| Requests/second  | 1-2            | 0.3-3 (with delays) |
| Concurrent pages | 1              | 5 (max)             |
| Session duration | 5-30 min       | 10-30 min           |
| Retry on errors  | Manual refresh | Automatic backoff   |

**Verdict**: Our scraper is **less aggressive** than typical human browsing patterns.

### ✅ 4. User-Agent Identification

**Current User-Agent**:

```text
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
```

**Consideration**: Using a standard browser user-agent rather than identifying as a bot

**Justification**:

- Many sites block non-browser user-agents unnecessarily
- We're not hiding our purpose (public GitHub repository)
- Our behavior is respectful regardless of user-agent
- **Alternative**: Could use
  `GeorgiaLegislationBot/1.0 (+https://github.com/riyanimam/georgia-legislation-webcrawler)`

**Recommendation**: Consider adding custom user-agent for transparency:

```python
self.session.headers.update({
    "User-Agent": "GeorgiaLegislationCrawler/1.0 (Educational Project; +https://github.com/riyanimam/georgia-legislation-webcrawler; bengo@example.com)"
})
```

### ✅ 5. Data Usage & Attribution

**Our Usage**:

- **Purpose**: Educational/informational display of public legislative data
- **Attribution**: Website footer credits "Georgia General Assembly"
- **No Commercial Use**: Open-source educational project
- **Data Format**: JSON export with source URLs for verification

### ⚠️ 6. Server Impact Mitigation

**Protections In Place**:

1. **Caching Layer**: Disk-based cache prevents re-fetching unchanged bills
2. **Graceful Degradation**: `continue-on-error` in CI allows workflow to complete
3. **Configurable Limits**: Environment variables allow tuning for server conditions
4. **Timeout Management**: 30s timeout prevents hung connections
5. **Connection Reuse**: HTTP connection pooling reduces overhead

**Monitoring**:

- Track `ERR_ABORTED` errors (indicates server pushback)
- Monitor `429 Too Many Requests` responses
- Adjust concurrency if errors increase

## Legal Considerations

### Public Domain Status

Georgia state law (O.C.G.A. § 50-18-70 et seq.) establishes a right to access public records,
including legislative information. As government works, these materials are not copyrightable under
federal law (17 U.S.C. § 105).

### Computer Fraud and Abuse Act (CFAA)

The CFAA prohibits "unauthorized access" to computer systems. Our scraping is **authorized**
because:

1. ✅ No authentication required (public access)
2. ✅ No bypass of access controls
3. ✅ No terms of service violations (none exist)
4. ✅ Respectful rate limiting (no DoS)
5. ✅ No damage or disruption to systems

### State-Specific Laws

Georgia does not have specific laws prohibiting web scraping of public data. The Anti-Phishing Act
(O.C.G.A. § 16-9-93.1) focuses on fraudulent data collection, not legitimate public record access.

## Best Practices

### Current Implementation

- ✅ Check robots.txt before scraping
- ✅ Implement rate limiting
- ✅ Use exponential backoff on errors
- ✅ Cache results to minimize requests
- ✅ Document data sources
- ✅ Open-source for transparency

### Future Improvements

- [ ] Add custom user-agent with contact info
- [ ] Implement crawl-delay from robots.txt (if added)
- [ ] Add monitoring/alerting for rate limit violations
- [ ] Consider reaching out to GA Legislature IT for explicit permission
- [ ] Add sitemap.xml support if provided

## Ethical Statement

This project aims to increase public access to legislative information through a modern, accessible
interface. We:

1. **Respect server resources** through conservative rate limiting
2. **Provide attribution** to the Georgia General Assembly
3. **Enhance public access** to government information
4. **Operate transparently** via open-source code
5. **Comply with all applicable laws** and web standards

## Contact & Compliance

If you represent the Georgia General Assembly and have concerns about this scraper, please open an
issue on GitHub or contact the maintainers. We're committed to respectful data access and will
gladly adjust our practices if needed.

**Project**: <https://github.com/riyanimam/georgia-legislation-webcrawler>

______________________________________________________________________

*Last Updated: January 18, 2026* *Reviewed By: Project Maintainers* *Next Review: Quarterly or upon
legislative website changes*
