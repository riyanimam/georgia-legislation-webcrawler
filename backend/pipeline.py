"""
Georgia Legislation Data Pipeline

This script orchestrates the complete data pipeline:
1. Fetch all Georgia legislation from LegiScan API
2. Generate AI summaries for all bills in bulk
3. Output a combined JSON file for the frontend

Usage:
    python -m backend.pipeline [--output public/ga_legislation.json]

Environment Variables Required:
    LEGISCAN_API_KEY - LegiScan API key
    OLLAMA_API_KEY - Ollama API key for AI summaries
"""

import argparse
import asyncio
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

from .ollama_service import SummaryResult

# Load environment variables
load_dotenv()


async def fetch_legislation() -> list[dict[str, Any]]:
    """
    Fetch all Georgia legislation from LegiScan API.

    Returns:
        List of bill dictionaries
    """
    from .legiscan_service import GEORGIA_STATE_CODE, LegiscanService

    print("=" * 60)
    print("STEP 1: Fetching Georgia Legislation from LegiScan")
    print("=" * 60)

    api_key = os.getenv("LEGISCAN_API_KEY")
    if not api_key:
        raise ValueError("LEGISCAN_API_KEY environment variable is required")

    service = LegiscanService(api_key=api_key)

    # Get current session
    print(f"Fetching sessions for {GEORGIA_STATE_CODE}...")
    sessions = await service.get_session_list()

    if not sessions:
        raise ValueError("No sessions found for Georgia")

    # Use the most recent session
    current_session = sessions[0]
    session_id = current_session.get("session_id")
    session_name = current_session.get("session_name", "Unknown")
    print(f"Using session: {session_name} (ID: {session_id})")

    # Get master list of bills
    print("Fetching master bill list...")
    master_list = await service.get_master_list(session_id=session_id)

    # Filter out session metadata
    bill_ids = [
        int(bill_id)
        for bill_id, data in master_list.items()
        if bill_id != "session" and isinstance(data, dict)
    ]
    print(f"Found {len(bill_ids)} bills")

    # Fetch full details for each bill
    print("Fetching bill details...")
    bills = []
    failed = 0

    for i, bill_id in enumerate(bill_ids, 1):
        try:
            bill = await service.get_bill(bill_id)
            formatted = service._format_bill_for_frontend(bill)
            bills.append(formatted)

            if i % 50 == 0 or i == len(bill_ids):
                print(f"  Progress: {i}/{len(bill_ids)} bills fetched")

            # Small delay to be respectful to API
            await asyncio.sleep(0.1)

        except Exception as e:
            print(f"  Warning: Failed to fetch bill {bill_id}: {e}")
            failed += 1

    print(f"Successfully fetched {len(bills)} bills ({failed} failed)")
    return bills


async def generate_summaries(bills: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Generate AI summaries for all bills in bulk.

    Uses batch processing to minimize API calls while respecting rate limits.

    Args:
        bills: List of bill dictionaries

    Returns:
        List of bills with ai_summary field added
    """
    from .ollama_service import OllamaService

    print("\n" + "=" * 60)
    print("STEP 2: Generating AI Summaries")
    print("=" * 60)

    api_key = os.getenv("OLLAMA_API_KEY")
    if not api_key:
        print("Warning: OLLAMA_API_KEY not set. Skipping AI summaries.")
        return bills

    service = OllamaService(api_key=api_key)
    print(f"Using Ollama model: {service.model}")

    # Check API health
    if not await service.check_health():
        print("Warning: Ollama API health check failed. Skipping summaries.")
        return bills

    # Process bills in batches for efficiency
    batch_size = 5  # Concurrent requests per batch
    total_batches = (len(bills) + batch_size - 1) // batch_size
    successful = 0
    failed = 0

    print(f"Processing {len(bills)} bills in {total_batches} batches...")

    for batch_num in range(total_batches):
        start_idx = batch_num * batch_size
        end_idx = min(start_idx + batch_size, len(bills))
        batch = bills[start_idx:end_idx]

        # Create tasks for concurrent processing
        tasks = []
        for bill in batch:
            sponsors = bill.get("sponsors", [])
            if isinstance(sponsors, str):
                sponsors = [sponsors]

            committees = bill.get("committees", [])
            if isinstance(committees, str):
                committees = [committees]

            task = service.generate_summary(
                bill_number=bill.get("doc_number", ""),
                caption=bill.get("caption", ""),
                first_reader_summary=bill.get("first_reader_summary"),
                sponsors=sponsors,
                committees=committees,
            )
            tasks.append(task)

        # Execute batch concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Apply results to bills
        for i, result in enumerate(results):
            bill = batch[i]
            if isinstance(result, Exception):
                print(f"  Error: {bill.get('doc_number')}: {result}")
                failed += 1
            else:
                summary_result: SummaryResult = result  # type: ignore[assignment]
                if summary_result.success:
                    bill["ai_summary"] = summary_result.summary
                    bill["summary_model"] = summary_result.model
                    successful += 1
                else:
                    failed += 1

        # Progress update
        if (batch_num + 1) % 10 == 0 or batch_num == total_batches - 1:
            print(f"  Progress: {end_idx}/{len(bills)} bills processed")

        # Brief delay between batches
        if batch_num < total_batches - 1:
            await asyncio.sleep(0.5)

    print(f"Summaries generated: {successful} successful, {failed} failed")
    return bills


def save_output(bills: list[dict[str, Any]], output_path: Path) -> None:
    """
    Save the combined bill data to a JSON file.

    Args:
        bills: List of bill dictionaries with summaries
        output_path: Path to save the JSON file
    """
    print("\n" + "=" * 60)
    print("STEP 3: Saving Output")
    print("=" * 60)

    # Create output directory if needed
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Add metadata
    output_data = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "source": "LegiScan API",
        "state": "GA",
        "bill_count": len(bills),
        "bills_with_summaries": len([b for b in bills if b.get("ai_summary")]),
        "bills": bills,
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    file_size = output_path.stat().st_size / 1024  # KB
    print(f"Output saved to: {output_path}")
    print(f"File size: {file_size:.1f} KB")
    print(f"Total bills: {len(bills)}")
    print(f"Bills with AI summaries: {len([b for b in bills if b.get('ai_summary')])}")


async def run_pipeline(output_path: Path) -> dict[str, Any]:
    """
    Run the complete data pipeline.

    Args:
        output_path: Path to save the output JSON

    Returns:
        Statistics about the pipeline run
    """
    start_time = datetime.now()

    print("\n" + "=" * 60)
    print("GEORGIA LEGISLATION DATA PIPELINE")
    print(f"Started at: {start_time.isoformat()}")
    print("=" * 60)

    # Step 1: Fetch legislation
    bills = await fetch_legislation()

    # Step 2: Generate AI summaries
    bills = await generate_summaries(bills)

    # Step 3: Save output
    save_output(bills, output_path)

    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()

    stats = {
        "started_at": start_time.isoformat(),
        "completed_at": end_time.isoformat(),
        "duration_seconds": duration,
        "total_bills": len(bills),
        "bills_with_summaries": len([b for b in bills if b.get("ai_summary")]),
        "output_file": str(output_path),
    }

    print("\n" + "=" * 60)
    print("PIPELINE COMPLETE")
    print(f"Duration: {duration:.1f} seconds")
    print("=" * 60)

    return stats


def main():
    """Main entry point for the pipeline."""
    parser = argparse.ArgumentParser(
        description="Georgia Legislation Data Pipeline - Fetch bills and generate AI summaries"
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=Path("public/ga_legislation.json"),
        help="Output JSON file path (default: public/ga_legislation.json)",
    )

    args = parser.parse_args()

    # Validate environment
    if not os.getenv("LEGISCAN_API_KEY"):
        print("Error: LEGISCAN_API_KEY environment variable is required")
        print("Get your API key at: https://legiscan.com/legiscan")
        sys.exit(1)

    if not os.getenv("OLLAMA_API_KEY"):
        print("Warning: OLLAMA_API_KEY not set. Bills will be fetched without AI summaries.")

    # Run the pipeline
    try:
        stats = asyncio.run(run_pipeline(args.output))

        # Output stats as JSON for GitHub Actions
        print("\n::set-output name=stats::" + json.dumps(stats))

    except KeyboardInterrupt:
        print("\nPipeline interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\nPipeline failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
