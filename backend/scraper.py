import asyncio
import json
import re
import sys
from pathlib import Path
from typing import Any

import aiohttp
import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Try to import playwright, with fallback to requests-only mode
try:
    from playwright.async_api import async_playwright

    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("Warning: Playwright not installed. Install with: pip install playwright")
    print("Then run: playwright install")


class ValidationError(Exception):
    """Raised when bill data validation fails."""

    pass


class GALegislationScraper:
    def __init__(self, max_concurrent: int = 5, request_delay: float = 0.1):
        """Initialize scraper with async support and caching.

        Args:
            max_concurrent (int): Maximum concurrent requests. Default 5 (respectful).
            request_delay (float): Delay between requests in seconds. Default 0.1.
        """
        self.base_url = "https://www.legis.ga.gov"
        self.max_concurrent = max_concurrent
        self.request_delay = request_delay
        self.cache_file = Path("bill_details_cache.json")
        self.cache = self._load_cache()
        self.session = requests.Session()

        # Configure retries
        retry_strategy = Retry(
            total=5,
            backoff_factor=2,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

        # Set headers to look like a real browser
        self.session.headers.update(
            {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
            }
        )

        # Statistics tracking
        self.stats = {
            "fetched": 0,
            "cached": 0,
            "failed": 0,
        }

    def _load_cache(self) -> dict[str, dict[str, Any]]:
        """Load cached bill details from file."""
        if self.cache_file.exists():
            try:
                with open(self.cache_file, encoding="utf-8") as f:
                    return json.load(f)  # type: ignore[no-any-return]
            except Exception as e:
                print(f"Warning: Could not load cache: {e}")
        return {}

    def _save_cache(self) -> None:
        """Save cached bill details to file."""
        try:
            with open(self.cache_file, "w", encoding="utf-8") as f:
                json.dump(self.cache, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Warning: Could not save cache: {e}")

    def validate_bill_data(self, bill: dict) -> None:
        """Validate that bill data contains required fields and valid types.

        Args:
            bill (dict): Bill data to validate.

        Raises:
            ValidationError: If required fields are missing or invalid.
        """
        required_fields = ["doc_number", "caption", "sponsors", "detail_url"]

        for field in required_fields:
            if field not in bill:
                raise ValidationError(f"Missing required field: {field}")

        # Validate string fields
        string_fields = ["doc_number", "caption", "detail_url"]
        for field in string_fields:
            if not isinstance(bill[field], str):
                raise ValidationError(f"Field '{field}' must be a string, got {type(bill[field])}")
            if not bill[field].strip():
                raise ValidationError(f"Field '{field}' cannot be empty")

        # Validate array fields
        array_fields = ["sponsors"]
        for field in array_fields:
            if field in bill:
                if not isinstance(bill[field], list):
                    raise ValidationError(
                        f"Field '{field}' must be an array, got {type(bill[field])}"
                    )
                if len(bill[field]) == 0:
                    raise ValidationError(f"Field '{field}' cannot be empty")
            else:
                raise ValidationError(f"Missing required field: {field}")

        # Optional fields
        if "committees" in bill:
            if not isinstance(bill["committees"], list):
                raise ValidationError(
                    f"Field 'committees' must be an array, got {type(bill['committees'])}"
                )

        # Validate status_history if present
        if "status_history" in bill and bill["status_history"]:
            if not isinstance(bill["status_history"], list):
                raise ValidationError("Field 'status_history' must be a list")
            for item in bill["status_history"]:
                if not isinstance(item, dict) or "date" not in item or "status" not in item:
                    raise ValidationError(
                        "Status history items must have 'date' and 'status' fields"
                    )

    async def fetch_bill_detail_async(self, session: aiohttp.ClientSession, url: str, page) -> dict:
        """Fetch bill details with caching and concurrent requests.

        Args:
            session: aiohttp session for async requests.
            url: Bill detail URL.
            page: Playwright page object (reused for detail fetching).

        Returns:
            Dictionary with first_reader_summary and status_history.
        """
        # Check cache first
        if url in self.cache:
            self.stats["cached"] += 1
            return self.cache[url]

        # Fetch with retry logic
        details = await self._fetch_with_retry(session, url, page)

        # Save to cache
        self.cache[url] = details
        self._save_cache()
        self.stats["fetched"] += 1

        return details

    async def _fetch_with_retry(
        self, session: aiohttp.ClientSession, url: str, page, max_retries: int = 3
    ) -> dict:
        """Fetch bill detail with exponential backoff retry.

        Args:
            session: aiohttp session.
            url: Bill detail URL.
            page: Playwright page object.
            max_retries: Maximum retry attempts.

        Returns:
            Dictionary with bill details.
        """
        for attempt in range(max_retries):
            try:
                # Use async Playwright for detail fetching
                return await self._get_legislation_details_async(page, url)
            except TimeoutError:
                if attempt < max_retries - 1:
                    wait_time = 2**attempt
                    print(f"    Timeout fetching {url}. Waiting {wait_time}s...")
                    await asyncio.sleep(wait_time)
            except Exception as e:
                if attempt < max_retries - 1:
                    wait_time = 2**attempt
                    await asyncio.sleep(wait_time)
                else:
                    print(f"    Error fetching {url}: {e}")
                    self.stats["failed"] += 1
                    return {"first_reader_summary": "", "status_history": []}

        self.stats["failed"] += 1
        return {"first_reader_summary": "", "status_history": []}

    async def _get_legislation_details_async(self, page, url: str) -> dict:
        """Async wrapper for getting legislation details using Playwright.

        Args:
            page: Playwright async page object for browser automation.
            url (str): URL of the bill's detail page.

        Returns:
            Dict: Dictionary containing first_reader_summary and status_history.
        """
        try:
            # Navigate to detail page
            await page.goto(url, wait_until="networkidle", timeout=60000)

            # Wait for content to load - wait for h2 headers that contain detail sections
            try:
                await page.wait_for_selector(
                    "h2", timeout=5000
                )  # h2 contains "First Reader Summary" and "Status History"
            except Exception:
                pass  # Content might load without explicit h2 wait

            # Get the rendered HTML
            html_content = await page.content()

            soup = BeautifulSoup(html_content, "html.parser")

            details = {"first_reader_summary": "", "status_history": []}

            # Get First Reader Summary - find h2, then get next div sibling
            summary_section = soup.find("h2", string=lambda x: x and "First Reader Summary" in x)
            if summary_section:
                # The content is in the next sibling div
                content_div = summary_section.find_next_sibling("div")
                if content_div:
                    # Get all text from the div
                    summary_text = content_div.get_text(strip=True)
                    if summary_text:
                        details["first_reader_summary"] = summary_text

            # Get Status History - find h2, then find table inside next div
            history_section = soup.find("h2", string=lambda x: x and "Status History" in x)
            if history_section:
                # The table is in the next sibling div
                history_div = history_section.find_next_sibling("div")
                if history_div:
                    history_table = history_div.find("table")
                    if history_table:
                        # Skip header row (tr with th elements)
                        history_rows = history_table.select("tbody tr")  # type: ignore[union-attr]
                        for row in history_rows:
                            cols = row.find_all("td")
                            if len(cols) >= 2:
                                date_str = cols[0].get_text(strip=True)
                                # Convert MM/DD/YYYY to YYYY-MM-DD
                                try:
                                    from datetime import datetime

                                    date_obj = datetime.strptime(date_str, "%m/%d/%Y")
                                    formatted_date = date_obj.strftime("%Y-%m-%d")
                                except ValueError:
                                    formatted_date = date_str

                                status_list: list[dict[str, str]] = details["status_history"]  # type: ignore[assignment]
                                status_list.append(
                                    {
                                        "date": formatted_date,
                                        "status": cols[1].get_text(strip=True),
                                    }
                                )

            return details

        except Exception as e:
            print(f"  Warning: Could not get details from {url}: {e}")
            return {"first_reader_summary": "", "status_history": []}

    def test_connection(self) -> bool:
        """Test if we can connect to the website.

        Attempts to establish a connection to the Georgia Legislature website
        to verify network connectivity before starting the full scraping process.

        Returns:
            bool: True if connection successful, False otherwise.
        """
        print("Testing connection to www.legis.ga.gov...")
        try:
            response = self.session.get(self.base_url, timeout=30)
            response.raise_for_status()
            print("[OK] Connection successful!")
            return True
        except requests.exceptions.Timeout:
            print("[ERROR] Connection timed out. The server may be blocking automated requests.")
            print("  This is common with government websites when accessed from cloud IPs.")
            return False
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Connection failed: {e}")
            return False

    def scrape_and_save(
        self, output_file: str = "ga_legislation.json", max_pages: int | None = None
    ) -> list[dict]:
        """Main method to scrape all legislation and save to JSON.

        Orchestrates the entire scraping process: tests connection, scrapes pages,
        and saves results to a JSON file.

        Args:
            output_file (str): Path to save the JSON file. Defaults to 'ga_legislation.json'.
            max_pages (int, optional): Maximum number of pages to scrape. None = all pages.

        Returns:
            List[Dict]: List of legislation records, each containing doc_number, caption,
                committees, sponsors, detail_url, first_reader_summary, and status_history.

        Raises:
            SystemExit: Exits with code 1 if unable to connect to the website.
        """
        # Test connection first
        if not self.test_connection():
            print("\nUnable to connect to the website. Possible reasons:")
            print("1. The website may be blocking GitHub Actions IP addresses")
            print("2. The website may be temporarily down")
            print("3. Network connectivity issues")
            print("\nTry running this script from your local machine instead.")
            sys.exit(1)

        print("\nStarting to scrape Georgia legislation...")
        print(
            f"Configuration: {self.max_concurrent} concurrent requests, {self.request_delay}s delay"
        )

        # Run async scraper
        legislation_data = asyncio.run(self.get_all_pages(max_pages))

        # Deduplicate by doc_number (pagination may create duplicates)
        seen_doc_numbers = set()
        unique_legislation = []
        for bill in legislation_data:
            doc_num = bill.get("doc_number")
            if doc_num and doc_num not in seen_doc_numbers:
                seen_doc_numbers.add(doc_num)
                unique_legislation.append(bill)

        # Save to JSON file
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(unique_legislation, f, indent=2, ensure_ascii=False)

        # Print statistics
        print("\nScraping complete!")
        print(f"  Saved {len(unique_legislation)} unique items to {output_file}")
        if len(legislation_data) > len(unique_legislation):
            duplicates_removed = len(legislation_data) - len(unique_legislation)
            print(f"  Removed {duplicates_removed} duplicate entries")
        print(
            f"  Stats: {self.stats['fetched']} fetched, {self.stats['cached']} cached, {self.stats['failed']} failed"
        )

        return legislation_data

    async def get_all_pages(self, max_pages: int | None = None) -> list[dict]:
        """Scrape all pages of legislation using JavaScript pagination clicks.

        Uses Playwright to click pagination buttons to navigate through all pages,
        extracting bill information and details from each page using concurrent requests.

        Args:
            max_pages (int, optional): Maximum number of pages to scrape. None = all pages.

        Returns:
            List[Dict]: List of legislation records.
        """
        if not PLAYWRIGHT_AVAILABLE:
            print("Error: Playwright is required to scrape this website (it uses JavaScript).")
            print("Install it with: pip install playwright")
            print("Then run: playwright install")
            return []

        all_legislation = []

        connector = aiohttp.TCPConnector(
            limit=self.max_concurrent, limit_per_host=2, ttl_dns_cache=300
        )
        timeout = aiohttp.ClientTimeout(total=60)

        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            async with async_playwright() as p:
                # Launch browser with headless mode
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                )
                page = await context.new_page()
                # Separate page for detail fetching to avoid losing pagination context
                detail_page = await context.new_page()

                try:
                    page_num = 1
                    total_pages = None
                    consecutive_failures = 0
                    max_consecutive_failures = 3

                    # Load initial page
                    print("Loading legislation page...")
                    url = f"{self.base_url}/legislation/all"
                    await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                    await asyncio.sleep(2)

                    while True:
                        if max_pages and page_num > max_pages:
                            break

                        if consecutive_failures >= max_consecutive_failures:
                            print(
                                f"\nStopping after {max_consecutive_failures} consecutive failed pages"
                            )
                            break

                        if total_pages and page_num > total_pages:
                            print(f"\nReached last page ({total_pages})")
                            break

                        print(f"\nScraping page {page_num}...")

                        try:
                            # Get the HTML after JavaScript has rendered
                            html_content = await page.content()
                            soup = BeautifulSoup(html_content, "html.parser")

                            # Detect total pages from pagination info on first page
                            if not total_pages:
                                pagination_text = soup.get_text()
                                match = re.search(r"(\d+)-(\d+)\s+of\s+(\d+)", pagination_text)
                                if match:
                                    total_results = int(match.group(3))
                                    items_per_page = int(match.group(2)) - int(match.group(1)) + 1
                                    total_pages = (
                                        total_results + items_per_page - 1
                                    ) // items_per_page
                                    print(
                                        f"  Detected: {total_results} total bills across {total_pages} pages"
                                    )

                            # Find all legislation rows
                            rows: Any = soup.select("table tbody tr")
                            if not rows:
                                rows_temp = soup.select("table tr")[
                                    1:
                                ]  # Skip header row if it exists
                                rows = rows_temp

                            if not rows:
                                consecutive_failures += 1
                                print(
                                    f"  No rows found (attempt {consecutive_failures}/{max_consecutive_failures})"
                                )
                                await asyncio.sleep(2)
                                # Try clicking next page anyway
                                if total_pages and page_num < total_pages:
                                    try:
                                        await page.click(f'a:text("{page_num + 1}")', timeout=5000)
                                        await asyncio.sleep(2)
                                    except Exception:
                                        pass
                                page_num += 1
                                continue

                            consecutive_failures = 0  # Reset on success

                            # Collect bill info and queue detail fetches
                            page_bills = []
                            for row in rows:
                                try:
                                    # Extract basic info
                                    doc_number_elem = row.select_one("td:first-child a")
                                    if not doc_number_elem:
                                        continue

                                    doc_number = doc_number_elem.text.strip().replace(" ", "")
                                    href = doc_number_elem.get("href", "")
                                    detail_url = self.base_url + (
                                        href if isinstance(href, str) else str(href)
                                    )

                                    tds = row.select("td")
                                    if len(tds) < 4:
                                        continue

                                    caption_elem = tds[1].select_one("a")
                                    caption = caption_elem.text.strip() if caption_elem else ""

                                    committees_list = []
                                    for dd in tds[2].select("a"):
                                        committees_list.append(dd.text.strip())

                                    sponsors_list = []
                                    for sponsor in tds[3].select("a"):
                                        sponsors_list.append(sponsor.text.strip())
                                    print(f"  Found {doc_number}...")

                                    bill_data = {
                                        "doc_number": doc_number,
                                        "caption": caption,
                                        "committees": committees_list,
                                        "sponsors": sponsors_list,
                                        "detail_url": detail_url,
                                    }
                                    page_bills.append(bill_data)

                                except Exception as e:
                                    print(f"  Error processing row: {e}")
                                    continue

                            # Fetch details concurrently with rate limiting
                            print(
                                f"  Fetching details for {len(page_bills)} bills (with caching)..."
                            )
                            for bill_data in page_bills:
                                detail_url_val = bill_data.get("detail_url", "")
                                if isinstance(detail_url_val, str):
                                    details = await self.fetch_bill_detail_async(
                                        session, detail_url_val, detail_page
                                    )
                                    bill_data.update(details)

                                # Validate bill data before adding
                                try:
                                    self.validate_bill_data(bill_data)
                                    all_legislation.append(bill_data)
                                except ValidationError as e:
                                    print(
                                        f"    Validation error for {bill_data['doc_number']}: {e}"
                                    )
                                    continue

                                # Respectful delay between requests
                                await asyncio.sleep(self.request_delay)

                            # Click next page if not at last page
                            if total_pages is None or page_num < total_pages:
                                next_page_num = page_num + 1
                                try:
                                    print(f"  Navigating to page {next_page_num}...")
                                    # Get current bill count to detect when new content loads
                                    old_content = await page.content()

                                    # First, scroll to bottom to ensure pagination is visible
                                    await page.evaluate(
                                        "window.scrollTo(0, document.body.scrollHeight)"
                                    )
                                    await asyncio.sleep(0.5)

                                    # Strategy 1: Try clicking the visible page number link first
                                    clicked = False
                                    try:
                                        await page.click(
                                            f'a:text-is("{next_page_num}")',
                                            timeout=5000,
                                            force=True,
                                        )
                                        clicked = True
                                        print(f"    Clicked page {next_page_num} link directly")
                                    except Exception:
                                        pass

                                    # Strategy 2: If page number not visible, try "Next" button or navigation arrow
                                    if not clicked:
                                        try:
                                            # Try common "Next" button selectors
                                            next_selectors = [
                                                'a:has-text("Next")',
                                                'a:has-text("›")',
                                                'a:has-text("»")',
                                                'button:has-text("Next")',
                                                'a[aria-label*="Next"]',
                                                'button[aria-label*="Next"]',
                                                ".pagination a.next",
                                                ".pagination-next",
                                                'a[rel="next"]',
                                            ]

                                            for selector in next_selectors:
                                                try:
                                                    await page.click(selector, timeout=2000)
                                                    clicked = True
                                                    print(
                                                        f"    Clicked next page using selector: {selector}"
                                                    )
                                                    break
                                                except Exception:
                                                    continue
                                        except Exception as e:
                                            print(f"    Next button strategies failed: {e}")

                                    # Strategy 3: If still not clicked, check if page number is in visible pagination
                                    if not clicked:
                                        try:
                                            # Get all visible page links
                                            page_links = await page.locator('a[href*="page"]').all()
                                            if not page_links:
                                                page_links = await page.locator(
                                                    ".pagination a"
                                                ).all()

                                            # Find the highest visible page number and click it if it's < next_page_num
                                            highest_visible = 0
                                            for link in page_links:
                                                text = await link.inner_text()
                                                if text.strip().isdigit():
                                                    num = int(text.strip())
                                                    if num > highest_visible:
                                                        highest_visible = num

                                            if highest_visible > page_num:
                                                await page.click(
                                                    f'a:text-is("{highest_visible}")', timeout=5000
                                                )
                                                clicked = True
                                                print(
                                                    f"    Clicked highest visible page: {highest_visible}"
                                                )
                                        except Exception as e:
                                            print(f"    Fallback pagination strategy failed: {e}")

                                    if not clicked:
                                        raise Exception(
                                            f"Could not navigate to page {next_page_num}"
                                        )

                                    # Wait for content to change
                                    for attempt in range(15):
                                        await asyncio.sleep(1)
                                        new_content = await page.content()
                                        if new_content != old_content:
                                            print(f"    Page loaded after {attempt + 1}s")
                                            break

                                except Exception as e:
                                    print(f"  Could not click page {next_page_num}: {e}")
                                    if total_pages and page_num < total_pages:
                                        # If we can't click but there are more pages, increment failure counter
                                        consecutive_failures += 1
                                    else:
                                        # Otherwise we've reached the end
                                        break
                            else:
                                break

                            page_num += 1

                        except Exception as e:
                            consecutive_failures += 1
                            print(f"  Error on page {page_num}: {e}")
                            await asyncio.sleep(5)

                finally:
                    await detail_page.close()
                    await page.close()
                    await context.close()
                    await browser.close()

        return all_legislation


# Usage
if __name__ == "__main__":
    import os

    # Read environment variables for CI/CD configuration
    max_concurrent = int(os.getenv("SCRAPER_CONCURRENCY", "5"))
    request_delay = float(os.getenv("SCRAPER_DELAY", "0.1"))

    # Allow command line argument for max pages (useful for testing)
    max_pages = int(sys.argv[1]) if len(sys.argv) > 1 else None

    print(f"Starting scraper with concurrency={max_concurrent}, delay={request_delay}s")
    scraper = GALegislationScraper(max_concurrent=max_concurrent, request_delay=request_delay)
    data = scraper.scrape_and_save("ga_legislation.json", max_pages=max_pages)

    # Print summary
    print(f"\n{'=' * 50}")
    print(f"Total bills scraped: {len(data)}")
    print("Output file: ga_legislation.json")
    print(f"{'=' * 50}")

    # Print a sample of the first item
    if data:
        print("\nSample of first item:")
        print(json.dumps(data[0], indent=2))
