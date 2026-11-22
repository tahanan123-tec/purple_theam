// ContrastAdjuster class - WCAG AA contrast compliance
// Ensures text readability through WCAG contrast ratio calculations

export class ContrastAdjuster {
  /**
   * Calculate the relative luminance of a color
   * Based on WCAG 2.0 formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
   * @param color - RGB color values as [r, g, b] where each value is 0-255
   * @returns Relative luminance (0-1)
   */
  private calculateRelativeLuminance(color: [number, number, number]): number {
    // Convert RGB values to 0-1 range
    const [r, g, b] = color.map(val => val / 255);
    
    // Apply gamma correction
    const [rLin, gLin, bLin] = [r, g, b].map(val => {
      if (val <= 0.03928) {
        return val / 12.92;
      } else {
        return Math.pow((val + 0.055) / 1.055, 2.4);
      }
    });
    
    // Calculate relative luminance using WCAG formula
    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  }

  /**
   * Parse a color string to RGB values
   * Supports: rgb(r,g,b), rgba(r,g,b,a), #hex, color names
   * @param colorStr - Color string in various formats
   * @returns RGB values as [r, g, b] or null if invalid
   */
  private parseColor(colorStr: string): [number, number, number] | null {
    // Trim whitespace
    const trimmed = colorStr.trim();
    
    // Handle rgb() and rgba() formats
    const rgbMatch = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return [
        parseInt(rgbMatch[1]),
        parseInt(rgbMatch[2]),
        parseInt(rgbMatch[3])
      ];
    }

    // Handle hex formats (#rgb, #rrggbb)
    const hexMatch = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hexMatch) {
      const hex = hexMatch[1];
      if (hex.length === 3) {
        // Convert #rgb to #rrggbb
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return [r, g, b];
      } else {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return [r, g, b];
      }
    }

    // Handle named colors - basic set
    const namedColors: { [key: string]: [number, number, number] } = {
      'black': [0, 0, 0],
      'white': [255, 255, 255],
      'red': [255, 0, 0],
      'green': [0, 128, 0],
      'blue': [0, 0, 255],
      'yellow': [255, 255, 0],
      'purple': [128, 0, 128],
      'gray': [128, 128, 128],
      'grey': [128, 128, 128]
    };

    const normalized = trimmed.toLowerCase();
    if (normalized in namedColors) {
      return namedColors[normalized];
    }

    return null;
  }

  /**
   * Calculate contrast ratio between two colors
   * Based on WCAG 2.0 formula: (L1 + 0.05) / (L2 + 0.05) where L1 > L2
   * @param foreground - Foreground color string
   * @param background - Background color string
   * @returns Contrast ratio (1-21), or 1 if colors cannot be parsed
   */
  calculateContrast(foreground: string, background: string): number {
    const fgRgb = this.parseColor(foreground);
    const bgRgb = this.parseColor(background);

    if (!fgRgb || !bgRgb) {
      // If colors can't be parsed, return minimum contrast
      return 1;
    }

    const fgLuminance = this.calculateRelativeLuminance(fgRgb);
    const bgLuminance = this.calculateRelativeLuminance(bgRgb);

    // Ensure L1 is the lighter color
    const l1 = Math.max(fgLuminance, bgLuminance);
    const l2 = Math.min(fgLuminance, bgLuminance);

    // Calculate contrast ratio
    return (l1 + 0.05) / (l2 + 0.05);
  }

  /**
   * Check if two colors meet WCAG AA contrast standards
   * @param foreground - Foreground color string
   * @param background - Background color string
   * @param isLargeText - Whether text is large (18pt or 14pt bold)
   * @returns true if contrast meets WCAG AA standard
   */
  meetsWCAG_AA(foreground: string, background: string, isLargeText: boolean = false): boolean {
    const contrast = this.calculateContrast(foreground, background);
    
    // WCAG AA standards:
    // - Normal text: 4.5:1 minimum
    // - Large text (18pt or 14pt bold): 3:1 minimum
    const minRatio = isLargeText ? 3.0 : 4.5;
    
    return contrast >= minRatio;
  }

  /**
   * Lighten a color by a percentage
   * @param rgb - RGB color values
   * @param percentage - Amount to lighten (0-1)
   * @returns Lightened RGB values
   */
  private lightenColor(rgb: [number, number, number], percentage: number): [number, number, number] {
    return rgb.map(channel => {
      const increased = channel + (255 - channel) * percentage;
      return Math.min(255, Math.round(increased));
    }) as [number, number, number];
  }

  /**
   * Darken a color by a percentage
   * @param rgb - RGB color values
   * @param percentage - Amount to darken (0-1)
   * @returns Darkened RGB values
   */
  private darkenColor(rgb: [number, number, number], percentage: number): [number, number, number] {
    return rgb.map(channel => {
      const decreased = channel * (1 - percentage);
      return Math.max(0, Math.round(decreased));
    }) as [number, number, number];
  }

  /**
   * Convert RGB values to CSS color string
   * @param rgb - RGB color values
   * @returns CSS color string in rgb() format
   */
  private rgbToString(rgb: [number, number, number]): string {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  }

  /**
   * Get the effective background color of an element
   * Traverses up the DOM tree to find the first non-transparent background
   * @param element - HTML element to check
   * @returns Background color string or white as fallback
   */
  private getEffectiveBackground(element: HTMLElement): string {
    let current: HTMLElement | null = element;
    
    while (current && current !== document.body.parentElement) {
      const bgColor = window.getComputedStyle(current).backgroundColor;
      
      // Check if background is not transparent
      if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
        return bgColor;
      }
      
      current = current.parentElement;
    }
    
    // Default to white if no background found
    return '#ffffff';
  }

  /**
   * Adjust text color to meet minimum contrast ratio
   * Progressively lightens or darkens text color until contrast is sufficient
   * @param element - HTML element to adjust
   * @param minRatio - Minimum contrast ratio to achieve
   */
  adjustTextColor(element: HTMLElement, minRatio: number = 4.5): void {
    const bgColor = this.getEffectiveBackground(element);
    const currentColor = window.getComputedStyle(element).color;
    
    const currentRgb = this.parseColor(currentColor);
    const bgRgb = this.parseColor(bgColor);
    
    if (!currentRgb || !bgRgb) {
      return; // Can't adjust if colors are invalid
    }
    
    // Check current contrast
    const currentContrast = this.calculateContrast(currentColor, bgColor);
    if (currentContrast >= minRatio) {
      return; // Already meets requirement
    }
    
    // Determine if background is light or dark
    const bgLuminance = this.calculateRelativeLuminance(bgRgb);
    const shouldLighten = bgLuminance < 0.5; // Darken background = lighten text
    
    // Progressively adjust color
    let adjustedRgb = currentRgb;
    let adjustedColor = currentColor;
    let contrast = currentContrast;
    const steps = 10; // Number of adjustment steps to try
    
    for (let i = 1; i <= steps && contrast < minRatio; i++) {
      const percentage = i * 0.1; // Adjust by 10% increments
      
      if (shouldLighten) {
        adjustedRgb = this.lightenColor(currentRgb, percentage);
      } else {
        adjustedRgb = this.darkenColor(currentRgb, percentage);
      }
      
      adjustedColor = this.rgbToString(adjustedRgb);
      contrast = this.calculateContrast(adjustedColor, bgColor);
    }
    
    // If we still haven't met the ratio, try the opposite direction
    if (contrast < minRatio) {
      adjustedRgb = currentRgb;
      
      for (let i = 1; i <= steps && contrast < minRatio; i++) {
        const percentage = i * 0.1;
        
        if (shouldLighten) {
          adjustedRgb = this.darkenColor(currentRgb, percentage);
        } else {
          adjustedRgb = this.lightenColor(currentRgb, percentage);
        }
        
        adjustedColor = this.rgbToString(adjustedRgb);
        contrast = this.calculateContrast(adjustedColor, bgColor);
      }
    }
    
    // Apply the adjusted color if we improved contrast
    if (contrast >= minRatio) {
      element.style.color = adjustedColor;
    } else {
      // Color adjustment alone is insufficient, use enhanceReadability
      this.enhanceReadability(element);
    }
  }

  /**
   * Apply text shadows or backgrounds to enhance readability
   * Used when color adjustment alone is insufficient
   * @param element - HTML element to enhance
   */
  enhanceReadability(element: HTMLElement): void {
    const bgColor = this.getEffectiveBackground(element);
    const bgRgb = this.parseColor(bgColor);
    
    if (!bgRgb) {
      return;
    }
    
    // Determine if background is light or dark
    const bgLuminance = this.calculateRelativeLuminance(bgRgb);
    const isDarkBackground = bgLuminance < 0.5;
    
    if (isDarkBackground) {
      // Dark background: use white text with dark shadow
      element.style.color = '#ffffff';
      element.style.textShadow = '0 0 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6)';
    } else {
      // Light background: use dark text with light shadow
      element.style.color = '#000000';
      element.style.textShadow = '0 0 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(255, 255, 255, 0.6)';
    }
    
    // Alternative approach: semi-transparent background
    // Uncomment if text shadows are not sufficient
    // if (isDarkBackground) {
    //   element.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    //   element.style.color = '#ffffff';
    // } else {
    //   element.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    //   element.style.color = '#000000';
    // }
  }
}
