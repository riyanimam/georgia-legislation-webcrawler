# Frontend Testing Guide

## Quick Start

The frontend has been fixed to properly handle JSON data loading and the key issues dropdown.

### Testing with Sample Data

1. **Option 1: Use the file upload**

   - Click "📁 Choose JSON File"
   - Select `test-data.json` from the `frontend/` directory
   - The UI should load with 5 test bills

2. **Option 2: Generate real data**

   - Run the backend scraper to generate `ga_legislation.json`:

     ```bash
     python backend/scraper.py
     ```

   - Copy the generated `ga_legislation.json` to the `frontend/` directory

   - Refresh the page - data will auto-load

### Testing the Key Issues Dropdown

1. Click the **"Select Issues ▼"** dropdown button
2. The dropdown should expand showing 12 issue categories
3. Click any checkbox to filter bills by that issue
4. Multiple selections work (OR logic - shows bills matching ANY selected issue)
5. Click outside to close the dropdown

### Testing Data Loading

✅ **Fixed Issues:**

- File upload now properly validates JSON format (checks if it's an array)
- Error messages display if JSON is invalid
- File input hides after successful data load
- Auto-load attempts to find `ga_legislation.json` but doesn't error if missing

### All Features

- 🔍 **Search**: Type in search box to filter by bill number, caption, sponsors, or committees
- 📋 **Type Filter**: Filter by HB (House Bills) or SB (Senate Bills)
- 🎯 **Key Issues**: Select multiple issue categories to filter bills
- ↕️ **Sort By**: Sort results by bill number or caption
- 🔄 **Reset**: Clear all filters and selections
- 📖 **View Details**: Click to see full bill information in a modal
- 🔗 **Open Link**: Copy the bill's detail URL to clipboard

### Sample Data Fields

Each bill should have:

- `doc_number` - Bill identifier (e.g., "HB 1", "SB 50")
- `caption` - Bill title
- `sponsors` - Sponsor names
- `committees` - Committee assignments
- `first_reader_summary` - Bill description
- `status_history` - Array of `{date, status}` objects
- `detail_url` - Link to bill details

### Troubleshooting

**Dropdown won't open:**

- Check browser console for errors (F12)
- Verify `#issueDropdownToggle` and `#issueFilter` elements exist in HTML

**Data won't load:**

- Check JSON format is valid array of objects
- Verify all required fields are present
- Check browser console for parse errors

**Bills not filtering:**

- Verify data loaded successfully (check stats container)
- Check that checkbox change event fires (use browser devtools)
- Verify `filterBills()` function is being called
