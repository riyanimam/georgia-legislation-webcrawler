"""
LegiScan API integration for fetching Georgia legislation data.

This module provides an interface to the LegiScan API for retrieving
bill information from the Georgia General Assembly.

API Documentation: https://legiscan.com/gaits/documentation/legiscan
"""

import os
from dataclasses import dataclass
from typing import Any

import aiohttp

# Georgia state code for LegiScan
GEORGIA_STATE_CODE = "GA"


@dataclass
class LegiscanBill:
    """Represents a bill from LegiScan API."""

    bill_id: int
    bill_number: str
    title: str
    description: str
    state: str
    session_id: int
    status: str
    status_date: str
    url: str
    sponsors: list[dict]
    history: list[dict]
    texts: list[dict]
    votes: list[dict]
    amendments: list[dict]
    subjects: list[str]


class LegiscanService:
    """Service for interacting with LegiScan API."""

    BASE_URL = "https://api.legiscan.com/"

    def __init__(self, api_key: str | None = None):
        """
        Initialize the LegiScan service.

        Args:
            api_key: LegiScan API key. Defaults to LEGISCAN_API_KEY env var.
        """
        self.api_key = api_key or os.getenv("LEGISCAN_API_KEY", "")
        if not self.api_key:
            raise ValueError(
                "LegiScan API key is required. "
                "Set LEGISCAN_API_KEY environment variable or pass api_key parameter."
            )

    async def _make_request(self, operation: str, **params) -> dict[str, Any]:
        """
        Make an API request to LegiScan.

        Args:
            operation: The API operation (e.g., 'getMasterList', 'getBill')
            **params: Additional parameters for the request

        Returns:
            JSON response from the API
        """
        params["key"] = self.api_key
        params["op"] = operation

        async with aiohttp.ClientSession() as session:
            async with session.get(
                self.BASE_URL,
                params=params,
                timeout=aiohttp.ClientTimeout(total=30),
            ) as response:
                if response.status != 200:
                    raise Exception(f"API error: {response.status}")
                data = await response.json()
                if data.get("status") == "ERROR":
                    raise Exception(
                        f"API error: {data.get('alert', {}).get('message', 'Unknown error')}"
                    )
                return data  # type: ignore[no-any-return]

    async def get_session_list(self, state: str = GEORGIA_STATE_CODE) -> list[dict[str, Any]]:
        """
        Get list of legislative sessions for a state.

        Args:
            state: State abbreviation (default: GA)

        Returns:
            List of session objects
        """
        data = await self._make_request("getSessionList", state=state)
        return data.get("sessions", [])  # type: ignore[no-any-return]

    async def get_master_list(
        self, session_id: int | None = None, state: str = GEORGIA_STATE_CODE
    ) -> dict[str, Any]:
        """
        Get master list of bills for a session.

        Args:
            session_id: Specific session ID (optional, defaults to current)
            state: State abbreviation (default: GA)

        Returns:
            Dictionary of bills indexed by bill_id
        """
        params: dict[str, Any] = {"state": state}
        if session_id:
            params["id"] = session_id

        data = await self._make_request("getMasterList", **params)
        return data.get("masterlist", {})  # type: ignore[no-any-return]

    async def get_bill(self, bill_id: int) -> LegiscanBill:
        """
        Get detailed information about a specific bill.

        Args:
            bill_id: LegiScan bill ID

        Returns:
            LegiscanBill object with full bill details
        """
        data = await self._make_request("getBill", id=bill_id)
        bill = data.get("bill", {})

        return LegiscanBill(
            bill_id=bill.get("bill_id"),
            bill_number=bill.get("bill_number", ""),
            title=bill.get("title", ""),
            description=bill.get("description", ""),
            state=bill.get("state", ""),
            session_id=bill.get("session_id"),
            status=bill.get("status_desc", ""),
            status_date=bill.get("status_date", ""),
            url=bill.get("url", ""),
            sponsors=bill.get("sponsors", []),
            history=bill.get("history", []),
            texts=bill.get("texts", []),
            votes=bill.get("votes", []),
            amendments=bill.get("amendments", []),
            subjects=bill.get("subjects", []),
        )

    async def get_bill_text(self, doc_id: int) -> str:
        """
        Get the full text of a bill document.

        Args:
            doc_id: Document ID from bill texts

        Returns:
            Base64-encoded document content
        """
        data = await self._make_request("getBillText", id=doc_id)
        return data.get("text", {}).get("doc", "") or ""

    async def search_bills(
        self,
        query: str,
        state: str = GEORGIA_STATE_CODE,
        year: int = 2,  # Current year + 1 prior
        page: int = 1,
    ) -> list[dict[str, Any]]:
        """
        Search for bills matching a query.

        Args:
            query: Search query
            state: State abbreviation (default: GA for Georgia, ALL for national)
            year: Year filter (1=current, 2=current+1prior, 3=current+2prior, 4=all)
            page: Page number for pagination

        Returns:
            List of search result objects
        """
        data = await self._make_request(
            "getSearch",
            state=state,
            query=query,
            year=year,
            page=page,
        )
        return data.get("searchresult", {}).get("results", [])  # type: ignore[no-any-return]

    async def fetch_all_georgia_bills(self, session_id: int | None = None) -> list[dict[str, Any]]:
        """
        Fetch all bills from Georgia for a given session.

        This is a convenience method that fetches the master list and then
        retrieves full details for each bill.

        Args:
            session_id: Specific session ID (optional)

        Returns:
            List of bill dictionaries formatted for the frontend
        """
        master_list = await self.get_master_list(session_id=session_id)

        bills: list[dict[str, Any]] = []
        for bill_id, _bill_summary in master_list.items():
            if bill_id == "session":  # Skip session metadata
                continue

            try:
                bill = await self.get_bill(int(bill_id))
                bills.append(self._format_bill_for_frontend(bill))
            except Exception as e:
                print(f"Error fetching bill {bill_id}: {e}")
                continue

        return bills

    def _format_bill_for_frontend(self, bill: LegiscanBill) -> dict[str, Any]:
        """
        Format a LegiScan bill for the frontend application.

        Args:
            bill: LegiscanBill object

        Returns:
            Dictionary matching the frontend Bill interface
        """
        return {
            "doc_number": bill.bill_number,
            "caption": bill.title,
            "sponsors": [s.get("name", "") for s in bill.sponsors],
            "committees": [],  # LegiScan uses subjects instead
            "status_history": [
                {"date": h.get("date", ""), "status": h.get("action", "")} for h in bill.history
            ],
            "first_reader_summary": bill.description,
            "url": bill.url,
            "subjects": bill.subjects,
            "legiscan_bill_id": bill.bill_id,
        }


# Singleton instance
_service_instance: LegiscanService | None = None


def get_legiscan_service() -> LegiscanService:
    """Get or create the LegiScan service singleton."""
    global _service_instance
    if _service_instance is None:
        _service_instance = LegiscanService()
    return _service_instance
