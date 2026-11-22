// ThemeEngine class - Core theme application logic
// Handles purple color transformations for webpage elements
/**
 * ThemeEngine - Applies purple theme transformations to webpage elements
 *
 * Validates: Requirements 1.2, 1.3
 */
export class ThemeEngine {
    constructor() {
        // Purple color palette - background shades (darker)
        this.backgroundShades = [
            '#1a0033', // Darkest
            '#2d0052',
            '#400070',
            '#53008f',
            '#6b00b8',
            '#8b00e0' // Lightest background
        ];
        // Purple color palette - foreground shades (lighter)
        this.foregroundShades = [
            '#8b00e0', // Darkest foreground
            '#a64dff',
            '#c280ff',
            '#e0b3ff',
            '#f0d9ff',
            '#f5e6ff' // Lightest
        ];
    }
    /**
     * Get purple shade for a given color based on its lightness
     * @param originalColor - Color in any CSS format (rgb, rgba, hsl, hex, named)
     * @returns Purple shade that maintains similar lightness
     */
    getPurpleShade(originalColor) {
        // Parse the color and extract lightness
        const lightness = this.extractLightness(originalColor);
        // If we couldn't parse the color, return a default purple
        if (lightness === null) {
            return '#400070'; // Mid-range purple
        }
        // Map lightness (0-100) to appropriate purple shade
        // Lightness 0-50: use background shades (darker purples)
        // Lightness 50-100: use foreground shades (lighter purples)
        if (lightness < 50) {
            // Map 0-50 to background shades (0-5 index)
            const index = Math.floor((lightness / 50) * this.backgroundShades.length);
            return this.backgroundShades[Math.min(index, this.backgroundShades.length - 1)];
        }
        else {
            // Map 50-100 to foreground shades (0-5 index)
            const normalizedLightness = (lightness - 50) / 50;
            const index = Math.floor(normalizedLightness * this.foregroundShades.length);
            return this.foregroundShades[Math.min(index, this.foregroundShades.length - 1)];
        }
    }
    /**
     * Extract lightness value from a color string
     * @param color - Color in any CSS format
     * @returns Lightness value (0-100) or null if unparseable
     */
    extractLightness(color) {
        // Handle transparent/none
        if (!color || color === 'transparent' || color === 'none') {
            return null;
        }
        // Try to parse as RGB/RGBA
        const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        if (rgbMatch) {
            const rgb = {
                r: parseInt(rgbMatch[1]),
                g: parseInt(rgbMatch[2]),
                b: parseInt(rgbMatch[3])
            };
            return this.rgbToLightness(rgb);
        }
        // Try to parse as HSL/HSLA
        const hslMatch = color.match(/hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(?:,\s*[\d.]+)?\)/);
        if (hslMatch) {
            return parseFloat(hslMatch[3]); // Lightness is the third value
        }
        // Try to parse as hex
        const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        if (hexMatch) {
            const rgb = {
                r: parseInt(hexMatch[1], 16),
                g: parseInt(hexMatch[2], 16),
                b: parseInt(hexMatch[3], 16)
            };
            return this.rgbToLightness(rgb);
        }
        // Try to parse short hex (#abc -> #aabbcc)
        const shortHexMatch = color.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
        if (shortHexMatch) {
            const rgb = {
                r: parseInt(shortHexMatch[1] + shortHexMatch[1], 16),
                g: parseInt(shortHexMatch[2] + shortHexMatch[2], 16),
                b: parseInt(shortHexMatch[3] + shortHexMatch[3], 16)
            };
            return this.rgbToLightness(rgb);
        }
        // Try to parse named colors by creating a temporary element
        if (typeof document !== 'undefined') {
            const tempElement = document.createElement('div');
            tempElement.style.color = color;
            document.body.appendChild(tempElement);
            const computed = window.getComputedStyle(tempElement).color;
            document.body.removeChild(tempElement);
            // Recursively parse the computed RGB value
            if (computed && computed !== color) {
                return this.extractLightness(computed);
            }
        }
        // Unable to parse
        return null;
    }
    /**
     * Convert RGB to lightness value using HSL conversion
     * @param rgb - RGB color values (0-255)
     * @returns Lightness value (0-100)
     */
    rgbToLightness(rgb) {
        // Normalize RGB values to 0-1
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        // Find min and max values
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        // Calculate lightness (average of max and min)
        const lightness = (max + min) / 2;
        // Return as percentage (0-100)
        return lightness * 100;
    }
    /**
     * Apply theme to entire document (to be implemented in task 3.5)
     */
    applyTheme() {
        // TODO: Implement in task 3.5
        throw new Error('applyTheme() not yet implemented');
    }
    /**
     * Remove theme and restore original styling (to be implemented in task 3.5)
     */
    removeTheme() {
        // TODO: Implement in task 3.5
        throw new Error('removeTheme() not yet implemented');
    }
    /**
     * Apply theme to specific element (to be implemented in task 3.3)
     */
    applyToElement(element) {
        // TODO: Implement in task 3.3
        throw new Error('applyToElement() not yet implemented');
    }
}
