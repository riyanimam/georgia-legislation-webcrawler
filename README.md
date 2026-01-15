# georgia-legislation-webcrawler

## Troubleshooting Georgia Legislation Scraper

### The Problem

The connection timeout you're experiencing is likely due to one of these reasons:

#### 1. **IP Blocking** (Most Likely)

Government websites often block or rate-limit requests from cloud service IPs (like GitHub Actions, AWS, etc.) to prevent abuse. The Georgia legislature website may be:

- Blocking GitHub's IP ranges entirely
- Rate-limiting automated requests aggressively
- Using bot detection that identifies the GitHub Actions environment

#### 2. **Rate Limiting**

Making too many requests too quickly can trigger defensive measures.

#### 3. **Geographic Restrictions**

Some government sites restrict access to US-based IPs only.

### Solutions

#### Solution 1: Run Locally (Recommended)

The most reliable approach is to run the scraper from your local machine:

```bash
# Install dependencies
pip install requests beautifulsoup4

# Run the scraper
python scraper.py

# Or limit to a few pages for testing
python scraper.py 5
```

**Advantages:**

- Your residential IP is less likely to be blocked
- More control over timing and retries
- Can monitor progress in real-time

#### Solution 2: Use GitHub Actions with Proxy

You could use a proxy service or VPN within GitHub Actions:

```yaml
- name: Set up proxy
  run: |
    # Use a proxy service (requires setup)
    export HTTP_PROXY=your-proxy-url
    export HTTPS_PROXY=your-proxy-url
```

#### Solution 3: Self-Hosted Runner

Use a self-hosted GitHub Actions runner on your own infrastructure:

- Set up a runner on your local machine or a VPS
- The runner uses your IP address instead of GitHub's

#### Solution 4: Scheduled Local Execution

Set up a cron job on your local machine or server:

```bash
# Add to crontab (run daily at 2 AM)
0 2 * * * cd /path/to/repo && python scraper.py && git add . && git commit -m "Update" && git push
```

### Current Improvements Made

The updated scraper includes:

1. **Better timeout handling** - 30 second timeouts with retries
2. **Exponential backoff** - Waits longer between retry attempts
3. **Request throttling** - 1.5 seconds between detail requests, 2 seconds between pages
4. **Retry logic** - Up to 5 retries with backoff for transient failures
5. **Better headers** - More realistic browser headers
6. **Connection testing** - Tests connectivity before starting the full scrape
7. **Graceful failure** - Continues scraping even if individual items fail

### Testing the Connection

Run this quick test to see if the issue is connectivity:

```bash
curl -I https://www.legis.ga.gov/legislation/all
```

If this times out, the issue is definitely IP-based blocking.

### Recommended Approach

**For immediate results:**

1. Run the scraper locally on your machine
2. Commit the resulting JSON to your repo
3. Set up a local cron job for daily updates

**For future automation:**

1. Consider using a self-hosted runner
2. Or manually run it locally and commit results periodically

The Georgia legislature website is designed for human browsing, not automated scraping, so local execution is likely your best bet for reliability.
