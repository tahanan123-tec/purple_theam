# Sasuke Purple Theme Chrome Extension

A Chrome browser extension that transforms any webpage into a purple-themed interface with a Sasuke Uchiha background image.

## Features

- 🎨 Purple theme applied to all webpage elements
- 🥷 Sasuke Uchiha shadow background image with Sharingan and Rinnegan eyes
- 📖 WCAG AA compliant text readability
- 🔄 Toggle theme on/off per domain
- ⚡ Fast performance with dynamic content support

## Project Structure

```
sasuke-purple-theme-extension/
├── manifest.json           # Chrome Extension Manifest V3 configuration
├── package.json           # Node.js dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── jest.config.js         # Jest testing configuration
├── src/                   # Source code
│   ├── content.ts         # Content script entry point
│   ├── background.ts      # Background service worker
│   ├── popup.html         # Popup UI
│   ├── popup.ts           # Popup script
│   ├── ThemeEngine.ts     # Core theme application logic
│   ├── ContrastAdjuster.ts # WCAG contrast compliance
│   ├── BackgroundManager.ts # Background image management
│   ├── DOMObserver.ts     # Dynamic content monitoring
│   └── StateManager.ts    # State persistence
├── icons/                 # Extension icons and assets
│   └── README.md
└── tests/                 # Test files
    ├── unit/             # Unit tests
    └── property/         # Property-based tests

```

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Chrome browser (version 88+)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build TypeScript:
```bash
npm run build
```

3. Load extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project directory

## Testing

Run all tests:
```bash
npm test
```

Run unit tests only:
```bash
npm test:unit
```

Run property-based tests only:
```bash
npm test:property
```

Run tests with coverage:
```bash
npm test:coverage
```

## Usage

1. Click the extension icon in the Chrome toolbar
2. Click "Toggle Theme" to activate/deactivate the purple theme
3. The theme will be remembered for each domain

## Requirements

See `.kiro/specs/sasuke-purple-theme-extension/requirements.md` for detailed requirements.

## Design

See `.kiro/specs/sasuke-purple-theme-extension/design.md` for architecture and design documentation.

## License

MIT
