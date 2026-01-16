# Frontend - Georgia Legislation Explorer UI

Interactive web dashboard for exploring and searching Georgia state legislation.

## Overview

This directory contains all frontend code for the Georgia Legislation Explorer - a beautiful,
responsive web interface for browsing legislation data collected by the backend scraper.

## Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Grid, Flexbox, and animations
- **Vanilla JavaScript**: No external dependencies, pure ES6+

## File Structure

```text
frontend/
├── index.html       # Main application markup
├── styles.css       # All styling and animations
├── script.js        # Application logic and interactivity
└── README.md        # This file
```

## Features

- 🔍 **Search & Filter**: Find bills by number, caption, sponsors, or committees
- 📊 **Statistics Dashboard**: Real-time statistics on loaded bills
- 🎯 **Type Filtering**: Filter by House Bills (HB) or Senate Bills (SB)
- ↕️ **Sorting**: Sort by bill number or caption
- 📋 **Detailed View**: Modal with comprehensive bill information
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎨 **Modern UI**: Gradient design with smooth animations
- 📁 **File Upload**: Load custom JSON data files
- 🔗 **Share Links**: Copy legislation URLs to clipboard

## How It Works

### Data Loading

The UI expects JSON data in the following format:

```json
[
  {
    "doc_number": "HB 1",
    "caption": "Bill title/caption",
    "sponsors": "Sponsor names",
    "committees": "Committee assignments",
    "first_reader_summary": "Summary text",
    "status_history": [
      {
        "date": "2024-01-15",
        "status": "Status text"
      }
    ],
    "detail_url": "https://..."
  }
]
```

### Auto-Loading

The application automatically tries to load `ga_legislation.json` from the same directory. If not
found, users can manually upload a JSON file via the file picker.

### Event Architecture

The application uses event delegation pattern for dynamic elements:

```javascript
// Data attributes store references
<button class="view-details-btn" data-bill-index="${index}">View Details</button>

// Event listeners attached after rendering
document.querySelectorAll(".view-details-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
        const billIndex = btn.closest(".bill-card").dataset.billIndex;
        const bill = filteredBills[billIndex];
        openModal(bill);
    });
});
```

## Running Locally

### Option 1: Using Python's Built-in Server

```bash
# From the project root
python -m http.server 8000
# Visit http://localhost:8000/frontend/
```

### Option 2: Using Node.js HTTP Server

```bash
# Install if needed
npm install -g http-server

# From the project root
http-server . -p 8000
# Visit http://localhost:8000/frontend/
```

### Option 3: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click `index.html` and select "Open with Live Server"

## Development Workflow

### File Organization

- **index.html**: All markup and structure
- **styles.css**: Organized into semantic sections (Global, Layout, Forms, Buttons, Cards, Modal,
  etc.)
- **script.js**: Organized into functional groups (Data Management, Filtering, Rendering, etc.)

### Adding New Features

1. **New UI Element**: Add HTML to `index.html`
2. **Style It**: Add CSS to appropriate section in `styles.css`
3. **Wire It Up**: Add JavaScript to appropriate section in `script.js`

### Code Style

- Use semantic HTML5 elements
- CSS organized by feature/component
- JavaScript functions have JSDoc comments
- No external dependencies (keep it lightweight)

## Performance Considerations

- **CSS Grid/Flexbox**: Efficient layout engine
- **Native JavaScript**: No framework overhead
- **Event Delegation**: Efficient event handling for dynamic content
- **Responsive Images**: Not used in this version, but can be added
- **CSS Animations**: Hardware-accelerated transforms

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Works on modern mobile browsers

## Future Enhancements

- Export to CSV/PDF
- Favorites/bookmarking
- Advanced filtering with date ranges
- Bill comparison view
- Legislative tracking/subscriptions
- Dark mode toggle
- Accessibility improvements (ARIA labels)

## Integration with Backend

The backend (`backend/scraper.py`) generates JSON data that this frontend consumes. The workflow is:

1. Backend scraper runs and generates `ga_legislation.json`
2. Frontend loads the JSON and displays it interactively
3. Users can also upload custom JSON files via the file picker

See [BACKEND.md](BACKEND.md) for backend information.

## Troubleshooting

### "Module not found" or blank page

- Ensure you're running a local HTTP server (not using `file://` protocol)
- Check browser console for any error messages
- Verify `index.html` is in the same directory as `styles.css` and `script.js`

### JSON file not loading

- Ensure JSON file is valid (use [jsonlint.com](https://jsonlint.com))
- Check that the file is in the correct location
- Verify all required fields are present in the JSON objects
- Check browser console for error messages

### Styles not applying

- Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- Verify `styles.css` path in `index.html` is correct
- Check if any browser extensions are blocking styles

## License

Same as parent project - see [../LICENSE](../LICENSE)
