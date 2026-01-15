import requests
from bs4 import BeautifulSoup
import json
import time
import sys
from typing import List, Dict
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class GALegislationScraper:
    def __init__(self):
        self.base_url = "https://www.legis.ga.gov"
        self.session = requests.Session()
        
        # Configure retries
        retry_strategy = Retry(
            total=5,
            backoff_factor=2,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        # Set headers to look like a real browser
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
    
    def get_legislation_details(self, url: str) -> Dict:
        """Scrape detailed information from individual legislation page."""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                soup = BeautifulSoup(response.content, 'html.parser')
                
                details = {
                    'first_reader_summary': '',
                    'status_history': []
                }
                
                # Get First Reader Summary
                summary_section = soup.find('h3', string='First Reader Summary')
                if summary_section:
                    summary_content = summary_section.find_next('div', class_='summary-content')
                    if summary_content:
                        details['first_reader_summary'] = summary_content.text.strip()
                
                # Get Status History
                history_section = soup.find('h3', string='Status History')
                if history_section:
                    history_table = history_section.find_next('table')
                    if history_table:
                        history_rows = history_table.select('tbody tr')
                        for row in history_rows:
                            cols = row.find_all('td')
                            if len(cols) >= 2:
                                details['status_history'].append({
                                    'date': cols[0].text.strip(),
                                    'status': cols[1].text.strip()
                                })
                
                return details
                
            except requests.exceptions.Timeout:
                print(f"  Timeout on attempt {attempt + 1}/{max_retries} for {url}")
                if attempt < max_retries - 1:
                    time.sleep(5 * (attempt + 1))  # Exponential backoff
                else:
                    print(f"  Failed to get details after {max_retries} attempts")
                    return {'first_reader_summary': '', 'status_history': []}
            except Exception as e:
                print(f"  Error getting details from {url}: {e}")
                return {'first_reader_summary': '', 'status_history': []}
    
    def test_connection(self) -> bool:
        """Test if we can connect to the website."""
        print("Testing connection to www.legis.ga.gov...")
        try:
            response = self.session.get(self.base_url, timeout=30)
            response.raise_for_status()
            print("✓ Connection successful!")
            return True
        except requests.exceptions.Timeout:
            print("✗ Connection timed out. The server may be blocking automated requests.")
            print("  This is common with government websites when accessed from cloud IPs.")
            return False
        except requests.exceptions.RequestException as e:
            print(f"✗ Connection failed: {e}")
            return False
    
    def scrape_and_save(self, output_file: str = 'ga_legislation.json', max_pages: int = None):
        """Main method to scrape all legislation and save to JSON.
        
        Args:
            output_file: Path to save the JSON file
            max_pages: Maximum number of pages to scrape (None = all pages)
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
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(legislation_data, f, indent=2, ensure_ascii=False)
        
        print(f"\nScraping complete! Saved {len(legislation_data)} items to {output_file}")
        return legislation_data
    
    def get_all_pages(self, max_pages: int = None) -> List[Dict]:
        """Scrape all pages of legislation."""
        all_legislation = []
        page = 1
        consecutive_failures = 0
        max_consecutive_failures = 3
        
        while True:
            if max_pages and page > max_pages:
                break
            
            if consecutive_failures >= max_consecutive_failures:
                print(f"\nStopping after {max_consecutive_failures} consecutive failed pages")
                break
                
            print(f"\nScraping page {page}...")
            url = f"{self.base_url}/legislation/all?page={page}"
            
            try:
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find all legislation rows
                rows = soup.select('table.table-striped tbody tr')
                
                if not rows:
                    print("No more results found.")
                    break
                
                consecutive_failures = 0  # Reset on success
                
                for row in rows:
                    try:
                        # Extract basic info
                        doc_number_elem = row.select_one('td:first-child a')
                        if not doc_number_elem:
                            continue
                        
                        doc_number = doc_number_elem.text.strip()
                        detail_url = self.base_url + doc_number_elem['href']
                        
                        caption_td = row.select('td')[1]
                        caption_elem = caption_td.select_one('a')
                        caption = caption_elem.text.strip() if caption_elem else ""
                        
                        committees_td = row.select('td')[2]
                        committees_list = []
                        for dd in committees_td.select('dd a'):
                            committees_list.append(dd.text.strip())
                        committees = '; '.join(committees_list)
                        
                        sponsors_td = row.select('td')[3]
                        sponsors_list = []
                        for sponsor in sponsors_td.select('ol.sponsorList li a'):
                            sponsors_list.append(sponsor.text.strip())
                        sponsors = '; '.join(sponsors_list)
                        
                        print(f"  Scraping details for {doc_number}...")
                        details = self.get_legislation_details(detail_url)
                        
                        all_legislation.append({
                            'doc_number': doc_number,
                            'caption': caption,
                            'committees': committees,
                            'sponsors': sponsors,
                            'detail_url': detail_url,
                            'first_reader_summary': details.get('first_reader_summary', ''),
                            'status_history': details.get('status_history', [])
                        })
                        
                        # Longer delay between requests to avoid rate limiting
                        time.sleep(1.5)
                        
                    except Exception as e:
                        print(f"  Error processing row: {e}")
                        continue
                
                page += 1
                # Extra delay between pages
                time.sleep(2)
                
            except requests.exceptions.Timeout:
                consecutive_failures += 1
                print(f"  Timeout on page {page} (attempt {consecutive_failures}/{max_consecutive_failures})")
                time.sleep(10)  # Wait longer before retrying
                
            except requests.exceptions.RequestException as e:
                consecutive_failures += 1
                print(f"  Request error on page {page}: {e}")
                time.sleep(10)
                
            except Exception as e:
                consecutive_failures += 1
                print(f"  Unexpected error on page {page}: {e}")
                time.sleep(10)
        
        return all_legislation

# Usage
if __name__ == "__main__":
    # Allow command line argument for max pages (useful for testing)
    max_pages = int(sys.argv[1]) if len(sys.argv) > 1 else None
    
    scraper = GALegislationScraper()
    data = scraper.scrape_and_save('ga_legislation.json', max_pages=max_pages)
    
    # Print summary
    print(f"\n{'='*50}")
    print(f"Total bills scraped: {len(data)}")
    print(f"Output file: ga_legislation.json")
    print(f"{'='*50}")
    
    # Print a sample of the first item
    if data:
        print("\nSample of first item:")
        print(json.dumps(data[0], indent=2))
