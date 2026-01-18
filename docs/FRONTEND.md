# Frontend - Georgia Legislation Explorer UI

Modern React-based web application for exploring and searching Georgia state legislation with
stunning animations and interactive features.

## Overview

This is a fully-featured React application built with TypeScript, Vite, and Framer Motion that
provides a beautiful, responsive interface for browsing legislation data collected by the backend
scraper.

## Technology Stack

- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool and dev server
- **Framer Motion**: Smooth, performant animations
- **Lucide React**: Beautiful icon library
- **CSS Variables**: Theme system with dark mode support

## File Structure

```text
src/
├── components/          # React components
│   ├── Header.tsx      # Animated header with branding
│   ├── Stats.tsx       # Statistics dashboard with animations
│   ├── Filters.tsx     # Search and filter controls
│   ├── BillGrid.tsx    # Grid of bill cards with pagination
│   ├── BillModal.tsx   # Detailed bill modal dialog
│   └── LoadingAnimation.tsx  # Loading state animation
├── App.tsx             # Main application component
├── App.css             # Global styles and animations
├── main.tsx            # Application entry point
src/
├── components/          # React components
│   ├── Header.tsx      # Animated header with branding
│   ├── Stats.tsx       # Statistics dashboard with animations
│   ├── Filters.tsx     # Search and filter controls
│   ├── BillGrid.tsx    # Grid of bill cards with pagination
│   ├── BillModal.tsx   # Detailed bill modal dialog
│   ├── FavoritesModal.tsx  # Favorites management modal
│   ├── LoadingAnimation.tsx  # Loading state animation
│   ├── AnimatedBackground.tsx  # Background animations with SVGs
│   └── __tests__/      # Component tests
├── test/               # Test configuration
│   └── setup.ts        # Test environment setup
├── App.tsx             # Main application component
├── App.css             # Global styles and animations
├── main.tsx            # Application entry point
├── types.ts            # TypeScript type definitions
├── utils.ts            # Utility functions
└── vite-env.d.ts       # Vite environment types
public/
├── capitol.svg         # Capitol building icon
├── capitol-detailed.svg # Detailed capitol illustration
├── georgia-state.svg   # Georgia state outline
├── peach.svg          # Georgia peach icon
└── voting.svg         # Voting/democracy icon
```

## Features

- 🔍 **Advanced Search**: Multi-field search across bill data
- 🏷️ **Smart Filters**: Filter by type, issues, dates, sponsors, status
- 📊 **Animated Statistics**: Real-time bill counts with smooth animations
- 🎯 **Key Issue Tags**: Auto-categorization of bills by topic
- ↕️ **Flexible Sorting**: Multiple sort options
- 📋 **Rich Modal View**: Detailed bill information with status history
- ⭐ **Favorites System**: Save bills with localStorage persistence
- 📥 **Export Features**: Download bills as CSV or JSON
- 📱 **Fully Responsive**: Optimized for all screen sizes
- 🎨 **Beautiful Animations**: Smooth transitions with Framer Motion
- 🌙 **Dark Mode**: Complete theme switching with persistence
- 🔗 **Direct Links**: Deep linking support
- ♿ **Accessible**: ARIA labels, keyboard navigation, screen reader support

## How It Works

### Data Loading

The application expects JSON data in this format:

```json
[
  {
    "doc_number": "HB 1",
    "caption": "Bill title/caption",
    "sponsors": "Sponsor names" | ["Sponsor 1", "Sponsor 2"],
    "committees": "Committee assignments" | ["Committee 1"],
    "first_reader_summary": "Summary text",
    "status_history": [
      {
        "date": "2024-01-15",
        "status": "Status text"
      }
    ]
  }
]
```

### Auto-Loading

In production (GitHub Pages), the application automatically loads `ga_legislation.json` from the
repository root. In development, users can manually upload JSON files via the file picker interface.

### Component Architecture

```text
App (Main State Management)
├── AnimatedBackground (Background SVG animations)
├── Header (Animated branding with theme toggle)
├── Stats (Statistics with animations)
├── Filters (Search & filter controls)
├── BillGrid (Card grid with pagination)
│   └── BillCard (Individual bill cards)
├── BillModal (Detail modal - conditionally rendered)
└── FavoritesModal (Favorites management - conditionally rendered)
```

## Running Locally

### Development Server

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Visit http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

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
