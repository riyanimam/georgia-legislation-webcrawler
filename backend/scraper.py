import asyncio
import json
import sys
from pathlib import Path
from typing import Optional

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

    def _load_cache(self) -> dict:
        """Load cached bill details from file."""
        if self.cache_file.exists():
            try:
                with open(self.cache_file, encoding="utf-8") as f:
                    return json.load(f)
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
        required_fields = ["doc_number", "caption", "sponsors", "committees", "detail_url"]

        for field in required_fields:
            if field not in bill:
                raise ValidationError(f"Missing required field: {field}")
            if not isinstance(bill[field], str):
                raise ValidationError(f"Field '{field}' must be a string, got {type(bill[field])}")
            if not bill[field].strip():
                raise ValidationError(f"Field '{field}' cannot be empty")

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
                # Use Playwright for JavaScript rendering
                await asyncio.to_thread(self._get_legislation_details_sync, page, url)
                return await asyncio.to_thread(self._get_legislation_details_sync, page, url)
            except asyncio.TimeoutError:
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

    def _get_legislation_details_sync(self, page, url: str) -> dict:
        """Synchronous wrapper for getting legislation details using Playwright.

        Args:
            page: Playwright page object for browser automation.
            url (str): URL of the bill's detail page.

        Returns:
            Dict: Dictionary containing first_reader_summary and status_history.
        """

    def _get_legislation_details_sync(self, page, url: str) -> dict:
        """Synchronous wrapper for getting legislation details using Playwright.

        Args:
            page: Playwright page object for browser automation.
            url (str): URL of the bill's detail page.

        Returns:
            Dict: Dictionary containing first_reader_summary and status_history.
        """
        try:
            # Navigate to detail page
            page.goto(url, wait_until="networkidle", timeout=60000)

            # Wait for content to load - wait for h2 headers that contain detail sections
            try:
                page.wait_for_selector(
                    "h2", timeout=5000
                )  # h2 contains "First Reader Summary" and "Status History"
            except TimeoutError:
                pass  # Content might load without explicit h2 wait

            # Get the rendered HTML
            html_content = page.content()

            soup = BeautifulSoup(html_content, "html.parser")

            details = {"first_reader_summary": "", "status_history": []}

            # Get First Reader Summary - look for h2 instead of h3
            summary_section = soup.find("h2", string=lambda x: x and "First Reader Summary" in x)
            if summary_section:
                # Get the content after the h2
                summary_card = summary_section.find_next("div", class_="card-text-sm")
                if summary_card:
                    details["first_reader_summary"] = summary_card.text.strip()
                else:
                    # Try a more general approach
                    content_div = summary_section.find_next("div")
                    if content_div and "card-text" in str(content_div.get("class", "")):
                        details["first_reader_summary"] = content_div.text.strip()

            # Get Status History - look for h2 instead of h3
            history_section = soup.find("h2", string=lambda x: x and "Status History" in x)
            if history_section:
                history_table = history_section.find_next("table")
                if history_table:
                    history_rows = history_table.select("tbody tr")
                    for row in history_rows:
                        cols = row.find_all("td")
                        if len(cols) >= 2:
                            details["status_history"].append(
                                {"date": cols[0].text.strip(), "status": cols[1].text.strip()}
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
        self, output_file: str = "ga_legislation.json", max_pages: Optional[int] = None
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

        # Save to JSON file
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(legislation_data, f, indent=2, ensure_ascii=False)

        # Print statistics
        print("\nScraping complete!")
        print(f"  Saved {len(legislation_data)} items to {output_file}")
        print(
            f"  Stats: {self.stats['fetched']} fetched, {self.stats['cached']} cached, {self.stats['failed']} failed"
        )

        return legislation_data

    async def get_all_pages(self, max_pages: Optional[int] = None) -> list[dict]:
        """Scrape all pages of legislation using async/concurrent requests.

        Iterates through paginated legislation listings, extracting bill information
        and details from each bill's page using concurrent requests for improved performance.

        Args:
            max_pages (int, optional): Maximum number of pages to scrape. None = all pages.

        Returns:
            List[Dict]: List of legislation records containing:
                - doc_number (str): Bill identifier (e.g., 'HB1', 'SB42')
                - caption (str): Bill title/summary
                - committees (List[str]): Assigned committees
                - sponsors (List[str]): List of sponsors
                - detail_url (str): URL to bill detail page
                - first_reader_summary (str): Full bill summary
                - status_history (List[Dict]): Historical status changes
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

                try:
                    page_num = 1
                    consecutive_failures = 0
                    max_consecutive_failures = 3
                    pending_details = []

                    while True:
                        if max_pages and page_num > max_pages:
                            break

                        if consecutive_failures >= max_consecutive_failures:
                            print(
                                f"\nStopping after {max_consecutive_failures} consecutive failed pages"
                            )
                            break

                        print(f"\nScraping page {page_num}...")
                        url = f"{self.base_url}/legislation/all?page={page_num}"

                        try:
                            # Navigate to the page and wait for content to load
                            await page.goto(url, wait_until="networkidle", timeout=60000)

                            # Wait for table to load
                            try:
                                await page.wait_for_selector("table tbody tr", timeout=10000)
                            except:
                                # Try alternative selectors
                                print("  Waiting for alternative selectors...")
                                try:
                                    await page.wait_for_selector("table tr", timeout=10000)
                                except:
                                    print("  No table rows found on page")
                                    break

                            # Get the HTML after JavaScript has rendered
                            html_content = await page.content()
                            soup = BeautifulSoup(html_content, "html.parser")

                            # Find all legislation rows
                            rows = soup.select("table tbody tr")
                            if not rows:
                                rows = soup.select("table tr")[1:]  # Skip header row if it exists

                            if not rows:
                                print("No more results found.")
                                break

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
                                    detail_url = self.base_url + doc_number_elem["href"]

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
                                details = await self.fetch_bill_detail_async(
                                    session, bill_data["detail_url"], page
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

                            page_num += 1
                            # Delay between pages
                            await asyncio.sleep(1)

                        except Exception as e:
                            consecutive_failures += 1
                            print(f"  Error on page {page_num}: {e}")
                            await asyncio.sleep(5)

                finally:
                    await context.close()
                    await browser.close()

        return all_legislation


# Usage
if __name__ == "__main__":
    # Allow command line argument for max pages (useful for testing)
    max_pages = int(sys.argv[1]) if len(sys.argv) > 1 else None

    scraper = GALegislationScraper()
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
