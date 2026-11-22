// ThemeEngine class - Core theme application logic
// Handles purple color transformations for webpage elements

/**
 * Interface for color representation
 */
interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * ThemeEngine - Applies purple theme transformations to webpage elements
 * 
 * Validates: Requirements 1.2, 1.3
 */
export class ThemeEngine {
  // Purple color palette - background shades (darker)
  private readonly backgroundShades = [
    '#1a0033', // Darkest
    '#2d0052',
    '#400070',
    '#53008f',
    '#6b00b8',
    '#8b00e0'  // Lightest background
  ];

  // Purple color palette - foreground shades (lighter)
  private readonly foregroundShades = [
    '#8b00e0', // Darkest foreground
    '#a64dff',
    '#c280ff',
    '#e0b3ff',
    '#f0d9ff',
    '#f5e6ff'  // Lightest
  ];

  /**
   * Get purple shade for a given color based on its lightness
   * @param originalColor - Color in any CSS format (rgb, rgba, hsl, hex, named)
   * @returns Purple shade that maintains similar lightness
   */
  getPurpleShade(originalColor: string): string {
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
    } else {
      // Map 50-100 to foreground shades (0-5 index)
      const normalizedLightness = (lightness - 50) / 50;
      const index = Math.floor(normalizedLightness * this.foregroundShades.length);
      return this.foregroundShades[Math.min(index, this.foregroundShades.length - 1)];
    }
  }

  /**
   * Get purple shade specifically for links to ensure distinguishability
   * Links get brighter, more saturated purple shades from the foreground palette
   * @param lightness - Lightness value (0-100)
   * @returns Purple shade optimized for link visibility
   */
  private getLinkPurpleShade(lightness: number): string {
    // Links always use the brighter foreground shades to stand out
    // Map the full lightness range (0-100) to foreground shades
    // but bias towards brighter shades (index 2-5) for better visibility
    
    // Normalize lightness to 0-1
    const normalized = lightness / 100;
    
    // Use only the brighter half of foreground shades (indices 2-5)
    // This ensures links are always more vibrant and visible
    const brightShades = this.foregroundShades.slice(2); // ['#c280ff', '#e0b3ff', '#f0d9ff', '#f5e6ff']
    const index = Math.floor(normalized * brightShades.length);
    
    return brightShades[Math.min(index, brightShades.length - 1)];
  }

  /**
   * Extract lightness value from a color string
   * @param color - Color in any CSS format
   * @returns Lightness value (0-100) or null if unparseable
   */
  private extractLightness(color: string): number | null {
    // Handle transparent/none
    if (!color || color === 'transparent' || color === 'none') {
      return null;
    }

    // Try to parse as RGB/RGBA
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (rgbMatch) {
      const rgb: RGB = {
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
      const rgb: RGB = {
        r: parseInt(hexMatch[1], 16),
        g: parseInt(hexMatch[2], 16),
        b: parseInt(hexMatch[3], 16)
      };
      return this.rgbToLightness(rgb);
    }

    // Try to parse short hex (#abc -> #aabbcc)
    const shortHexMatch = color.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
    if (shortHexMatch) {
      const rgb: RGB = {
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
  private rgbToLightness(rgb: RGB): number {
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
   * Apply theme to entire document
   * Walks through DOM tree and applies purple theme to all elements
   * Validates: Requirements 1.1, 4.4
   */
  applyTheme(): void {
    // Walk through all elements in the document
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach((element) => {
      // Only apply to HTMLElements (not SVG, text nodes, etc.)
      if (element instanceof HTMLElement) {
        this.applyToElement(element);
      }
    });
  }

  /**
   * Remove theme and restore original styling
   * Restores all element styles from data attributes
   * Validates: Requirements 4.4
   */
  removeTheme(): void {
    // Find all elements that have theme applied (have data attributes)
    const themedElements = document.querySelectorAll('[data-sasuke-original-bg], [data-sasuke-original-color], [data-sasuke-original-text-decoration]');
    
    themedElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        // Restore original background color
        const originalBg = element.getAttribute('data-sasuke-original-bg');
        if (originalBg !== null) {
          element.style.backgroundColor = originalBg;
          element.removeAttribute('data-sasuke-original-bg');
        }
        
        // Restore original text color
        const originalColor = element.getAttribute('data-sasuke-original-color');
        if (originalColor !== null) {
          element.style.color = originalColor;
          element.removeAttribute('data-sasuke-original-color');
        }
        
        // Restore original text decoration
        const originalTextDecoration = element.getAttribute('data-sasuke-original-text-decoration');
        if (originalTextDecoration !== null) {
          element.style.textDecoration = originalTextDecoration;
          element.removeAttribute('data-sasuke-original-text-decoration');
        }
      }
    });
  }

  /**
   * Apply theme to specific element
   * Validates: Requirements 1.2, 1.3, 1.5, 3.5
   * 
   * @param element - HTML element to apply purple theme to
   */
  applyToElement(element: HTMLElement): void {
    // Get computed styles from the element
    const computedStyle = window.getComputedStyle(element);
    
    // Store original styles in data attributes for reversal (if not already stored)
    if (!element.hasAttribute('data-sasuke-original-bg')) {
      element.setAttribute('data-sasuke-original-bg', computedStyle.backgroundColor);
    }
    if (!element.hasAttribute('data-sasuke-original-color')) {
      element.setAttribute('data-sasuke-original-color', computedStyle.color);
    }
    if (!element.hasAttribute('data-sasuke-original-text-decoration')) {
      element.setAttribute('data-sasuke-original-text-decoration', computedStyle.textDecoration);
    }
    
    // Apply purple transformation to background-color
    const originalBgColor = computedStyle.backgroundColor;
    if (originalBgColor && originalBgColor !== 'rgba(0, 0, 0, 0)' && originalBgColor !== 'transparent') {
      const purpleBg = this.getPurpleShade(originalBgColor);
      element.style.backgroundColor = purpleBg;
    }
    
    // Check if element is a link
    const isLink = element.tagName === 'A';
    
    // Apply purple transformation to color (text color)
    const originalColor = computedStyle.color;
    if (originalColor) {
      if (isLink) {
        // Links get a brighter, more distinct purple shade
        // Use the brighter foreground shades to stand out
        const lightness = this.extractLightness(originalColor);
        const linkColor = this.getLinkPurpleShade(lightness !== null ? lightness : 50);
        element.style.color = linkColor;
      } else {
        const purpleColor = this.getPurpleShade(originalColor);
        element.style.color = purpleColor;
      }
    }
    
    // Ensure links have distinct text decoration (underline)
    if (isLink) {
      // Preserve underline for links if it exists, or add it if not present
      const textDecoration = computedStyle.textDecoration;
      if (!textDecoration || textDecoration === 'none' || textDecoration.includes('none')) {
        element.style.textDecoration = 'underline';
      }
    }
    
    // Preserve layout properties - these should NOT be modified
    // We don't need to explicitly preserve them as we're only modifying color properties
    // The layout properties (position, width, height, margin, padding) remain untouched
  }
}
