import json
import sys
import time

import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Try to import playwright, with fallback to requests-only mode
try:
    from playwright.sync_api import sync_playwright

    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("Warning: Playwright not installed. Install with: pip install playwright")
    print("Then run: playwright install")


class GALegislationScraper:
    def __init__(self):
        self.base_url = "https://www.legis.ga.gov"
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

    def get_legislation_details(self, page, url: str) -> dict:
        """Scrape detailed information from individual legislation page using Playwright.

        Navigates to a bill's detail page, waits for JavaScript rendering, and
        extracts the First Reader Summary and Status History table.

        Args:
            page: Playwright page object for browser automation.
            url (str): URL of the bill's detail page.

        Returns:
            Dict: Dictionary containing:
                - first_reader_summary (str): Bill summary text.
                - status_history (List[Dict]): List of status history items with
                  'date' and 'status' keys.
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

            # Debug: save a sample detail page
            if url.endswith("69281"):
                with open("debug_detail.html", "w", encoding="utf-8") as f:
                    f.write(html_content)

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

    def scrape_and_save(self, output_file: str = "ga_legislation.json", max_pages: int = None):
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
        legislation_data = self.get_all_pages(max_pages)

        # Save to JSON file
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(legislation_data, f, indent=2, ensure_ascii=False)

        print(f"\nScraping complete! Saved {len(legislation_data)} items to {output_file}")
        return legislation_data

    def get_all_pages(self, max_pages: int = None) -> list[dict]:
        """Scrape all pages of legislation using Playwright for JavaScript rendering.

        Iterates through paginated legislation listings, extracting bill information
        and details from each bill's page.

        Args:
            max_pages (int, optional): Maximum number of pages to scrape. None = all pages.

        Returns:
            List[Dict]: List of legislation records containing:
                - doc_number (str): Bill identifier (e.g., 'HB 1')
                - caption (str): Bill title/summary
                - committees (str): Assigned committees
                - sponsors (str): List of sponsors
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

        with sync_playwright() as p:
            # Launch browser with headless mode
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            )
            page = context.new_page()

            try:
                page_num = 1
                consecutive_failures = 0
                max_consecutive_failures = 3

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
                        page.goto(url, wait_until="networkidle", timeout=60000)

                        # Wait for table to load
                        try:
                            page.wait_for_selector("table tbody tr", timeout=10000)
                        except TimeoutError:
                            # Try alternative selectors
                            print("  Waiting for alternative selectors...")
                            try:
                                page.wait_for_selector("table tr", timeout=10000)
                            except TimeoutError:
                                print("  No table rows found on page")
                                break

                        # Get the HTML after JavaScript has rendered
                        html_content = page.content()
                        soup = BeautifulSoup(html_content, "html.parser")

                        # Find all legislation rows
                        rows = soup.select("table tbody tr")
                        if not rows:
                            rows = soup.select("table tr")[1:]  # Skip header row if it exists

                        if not rows:
                            print("No more results found.")
                            break

                        consecutive_failures = 0  # Reset on success

                        for row in rows:
                            try:
                                # Extract basic info
                                doc_number_elem = row.select_one("td:first-child a")
                                if not doc_number_elem:
                                    continue

                                doc_number = doc_number_elem.text.strip()
                                detail_url = self.base_url + doc_number_elem["href"]

                                tds = row.select("td")
                                if len(tds) < 4:
                                    continue

                                caption_elem = tds[1].select_one("a")
                                caption = caption_elem.text.strip() if caption_elem else ""

                                committees_list = []
                                for dd in tds[2].select("a"):
                                    committees_list.append(dd.text.strip())
                                committees = "; ".join(committees_list)

                                sponsors_list = []
                                for sponsor in tds[3].select("a"):
                                    sponsors_list.append(sponsor.text.strip())
                                sponsors = "; ".join(sponsors_list)

                                print(f"  Found {doc_number}...")
                                details = self.get_legislation_details(page, detail_url)

                                all_legislation.append(
                                    {
                                        "doc_number": doc_number,
                                        "caption": caption,
                                        "committees": committees,
                                        "sponsors": sponsors,
                                        "detail_url": detail_url,
                                        "first_reader_summary": details.get(
                                            "first_reader_summary", ""
                                        ),
                                        "status_history": details.get("status_history", []),
                                    }
                                )

                                # Delay between requests
                                time.sleep(0.5)

                            except Exception as e:
                                print(f"  Error processing row: {e}")
                                continue

                        page_num += 1
                        # Delay between pages
                        time.sleep(1)

                    except Exception as e:
                        consecutive_failures += 1
                        print(f"  Error on page {page_num}: {e}")
                        time.sleep(5)

            finally:
                context.close()
                browser.close()

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
