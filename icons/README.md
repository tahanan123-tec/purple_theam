# Icons Directory

This directory contains the extension icons and background assets.

## Created Assets

### SVG Source Files (Created)
- ✅ **icon.svg** - Main extension icon (inactive state) with Sharingan eye design
- ✅ **icon-active.svg** - Active state icon (brighter colors, glow effect, green indicator dot)
- ✅ **sasuke-shadow.svg** - Sasuke shadow silhouette with both Sharingan (left, red) and Rinnegan (right, purple) eyes

### Icon Features
- **Sharingan Eye**: Red iris with three tomoe (comma patterns) - visible in both icons and left eye of Sasuke shadow
- **Rinnegan Eye**: Purple iris with ripple pattern and six dots - visible in right eye of Sasuke shadow
- **Purple Theme**: Consistent purple gradient matching the extension's color palette
- **Active State Indicator**: Green dot on active icon, brighter colors and glow effect

### PNG Files (To Be Generated)
The SVG files need to be converted to PNG format for maximum browser compatibility:

#### Required PNG Files
- icon16.png - 16x16 pixels (from icon.svg)
- icon48.png - 48x48 pixels (from icon.svg)
- icon128.png - 128x128 pixels (from icon.svg)
- icon16-active.png - 16x16 pixels (from icon-active.svg)
- icon48-active.png - 48x48 pixels (from icon-active.svg)
- icon128-active.png - 128x128 pixels (from icon-active.svg)

#### Background Image
- sasuke-shadow.png - 1600x2400 pixels (optional, can use SVG directly)

## Generating PNG Files

### Quick Method (Recommended)
```bash
# Install dependencies (if not already installed)
npm install

# Run conversion script
npm run icons:convert
```

### Alternative Methods
See `generate-pngs.md` for other conversion options using ImageMagick, Inkscape, or online converters.

## Usage in Extension

The icons are referenced in `manifest.json`:
```json
{
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  }
}
```

The Sasuke background is used in the content script via `BackgroundManager.ts`.

## Notes
- SVG files are the source files and can be edited with any vector graphics editor
- Chrome Extension Manifest V3 supports SVG icons directly, but PNG is recommended for compatibility
- The Sasuke shadow image includes both eye techniques as specified in Requirements 2.2 and 2.3

