# PNG Icon Generation

The SVG icons need to be converted to PNG format at specific sizes for Chrome Extension requirements.

## Required PNG Files

### Inactive State Icons
- `icon16.png` - 16x16 pixels (from icon.svg)
- `icon48.png` - 48x48 pixels (from icon.svg)
- `icon128.png` - 128x128 pixels (from icon.svg)

### Active State Icons
- `icon16-active.png` - 16x16 pixels (from icon-active.svg)
- `icon48-active.png` - 48x48 pixels (from icon-active.svg)
- `icon128-active.png` - 128x128 pixels (from icon-active.svg)

## Conversion Methods

### Option 1: Using ImageMagick (Command Line)
```bash
# Install ImageMagick if not already installed
# On Ubuntu/Debian: sudo apt-get install imagemagick
# On macOS: brew install imagemagick

# Convert inactive icons
convert -background none -resize 16x16 icons/icon.svg icons/icon16.png
convert -background none -resize 48x48 icons/icon.svg icons/icon48.png
convert -background none -resize 128x128 icons/icon.svg icons/icon128.png

# Convert active icons
convert -background none -resize 16x16 icons/icon-active.svg icons/icon16-active.png
convert -background none -resize 48x48 icons/icon-active.svg icons/icon48-active.png
convert -background none -resize 128x128 icons/icon-active.svg icons/icon128-active.png
```

### Option 2: Using Node.js (with sharp library)
```bash
npm install sharp

# Create conversion script
node icons/convert-icons.js
```

### Option 3: Using Inkscape (Command Line)
```bash
# Install Inkscape if not already installed
# On Ubuntu/Debian: sudo apt-get install inkscape
# On macOS: brew install --cask inkscape

# Convert inactive icons
inkscape icons/icon.svg --export-filename=icons/icon16.png --export-width=16 --export-height=16
inkscape icons/icon.svg --export-filename=icons/icon48.png --export-width=48 --export-height=48
inkscape icons/icon.svg --export-filename=icons/icon128.png --export-width=128 --export-height=128

# Convert active icons
inkscape icons/icon-active.svg --export-filename=icons/icon16-active.png --export-width=16 --export-height=16
inkscape icons/icon-active.svg --export-filename=icons/icon48-active.png --export-width=48 --export-height=48
inkscape icons/icon-active.svg --export-filename=icons/icon128-active.png --export-width=128 --export-height=128
```

### Option 4: Using Online Converter
1. Go to https://cloudconvert.com/svg-to-png or similar service
2. Upload each SVG file
3. Set the desired dimensions (16x16, 48x48, 128x128)
4. Download the converted PNG files
5. Place them in the icons/ directory

## Browser Support Note
Chrome extensions can use SVG icons directly in Manifest V3, but PNG is more widely compatible and recommended. The SVG files are provided as source files for easy editing and scaling.

## Background Image
The `sasuke-shadow.svg` file can be used directly in the CSS background or converted to PNG if preferred:
```bash
# Convert to large PNG for high-resolution displays
convert -background none -resize 1600x2400 icons/sasuke-shadow.svg icons/sasuke-shadow.png
```

Or keep as SVG for perfect scaling at any resolution (recommended).
