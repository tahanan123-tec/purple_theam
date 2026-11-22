# Build Instructions

## TypeScript Compilation

This project uses TypeScript for development. The source files (`.ts`) need to be compiled to JavaScript (`.js`) before loading the extension in Chrome.

### Compile TypeScript

```bash
npm run build
```

This compiles all `.ts` files in `src/` to `.js` files in the same directory.

### Watch Mode (Development)

For continuous compilation during development:

```bash
npm run watch
```

### Loading the Extension

After building:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the project root directory (not the src/ folder)

The manifest.json references the compiled `.js` files in the `src/` directory.

## Notes

- The `.gitignore` excludes compiled `.js` files except `jest.config.js`
- Always build before loading/reloading the extension in Chrome
- TypeScript configuration outputs JS files to `src/` directory (same as source)
