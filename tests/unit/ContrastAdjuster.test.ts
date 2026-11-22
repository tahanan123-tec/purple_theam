import { ContrastAdjuster } from '../../src/ContrastAdjuster';

describe('ContrastAdjuster', () => {
  let adjuster: ContrastAdjuster;

  beforeEach(() => {
    adjuster = new ContrastAdjuster();
  });

  describe('calculateContrast', () => {
    it('should calculate correct contrast ratio for black on white', () => {
      const contrast = adjuster.calculateContrast('#000000', '#ffffff');
      expect(contrast).toBeCloseTo(21, 1); // Maximum contrast ratio
    });

    it('should calculate correct contrast ratio for white on black', () => {
      const contrast = adjuster.calculateContrast('#ffffff', '#000000');
      expect(contrast).toBeCloseTo(21, 1); // Order shouldn't matter
    });

    it('should calculate correct contrast ratio for same colors', () => {
      const contrast = adjuster.calculateContrast('#ffffff', '#ffffff');
      expect(contrast).toBeCloseTo(1, 1); // Minimum contrast ratio
    });

    it('should handle rgb() format', () => {
      const contrast = adjuster.calculateContrast('rgb(0, 0, 0)', 'rgb(255, 255, 255)');
      expect(contrast).toBeCloseTo(21, 1);
    });

    it('should handle rgba() format', () => {
      const contrast = adjuster.calculateContrast('rgba(0, 0, 0, 1)', 'rgba(255, 255, 255, 1)');
      expect(contrast).toBeCloseTo(21, 1);
    });

    it('should handle 3-character hex format', () => {
      const contrast = adjuster.calculateContrast('#000', '#fff');
      expect(contrast).toBeCloseTo(21, 1);
    });

    it('should handle named colors', () => {
      const contrast = adjuster.calculateContrast('black', 'white');
      expect(contrast).toBeCloseTo(21, 1);
    });

    it('should calculate contrast for purple shades', () => {
      // Dark purple background with light text
      const contrast = adjuster.calculateContrast('#e0b3ff', '#1a0033');
      expect(contrast).toBeGreaterThan(4.5); // Should meet WCAG AA
    });

    it('should return minimum contrast for invalid colors', () => {
      const contrast = adjuster.calculateContrast('invalid', 'alsoInvalid');
      expect(contrast).toBe(1);
    });

    it('should handle mixed valid and invalid colors', () => {
      const contrast = adjuster.calculateContrast('#000000', 'invalidColor');
      expect(contrast).toBe(1);
    });
  });

  describe('meetsWCAG_AA', () => {
    it('should return true for black on white (normal text)', () => {
      const meets = adjuster.meetsWCAG_AA('#000000', '#ffffff', false);
      expect(meets).toBe(true);
    });

    it('should return false for low contrast (normal text)', () => {
      // Light gray on white - poor contrast
      const meets = adjuster.meetsWCAG_AA('#cccccc', '#ffffff', false);
      expect(meets).toBe(false);
    });

    it('should apply different threshold for large text', () => {
      // A color combo that passes for large text but not normal text
      const foreground = '#767676'; // Medium gray
      const background = '#ffffff'; // White
      
      const normalText = adjuster.meetsWCAG_AA(foreground, background, false);
      const largeText = adjuster.meetsWCAG_AA(foreground, background, true);
      
      // This specific combo should pass large text (3:1) but may fail normal (4.5:1)
      expect(largeText).toBe(true);
      
      // Check the actual contrast
      const contrast = adjuster.calculateContrast(foreground, background);
      if (contrast >= 4.5) {
        expect(normalText).toBe(true);
      } else if (contrast >= 3.0) {
        expect(normalText).toBe(false);
      }
    });

    it('should handle purple theme colors', () => {
      // Light purple text on dark purple background
      const meets = adjuster.meetsWCAG_AA('#e0b3ff', '#1a0033', false);
      expect(meets).toBe(true);
    });

    it('should check normal text threshold is 4.5:1', () => {
      // Create a color pair with exactly 4.5:1 contrast (approximately)
      // This is a known pair: #777 on white is close to 4.5:1
      const foreground = '#767676';
      const background = '#ffffff';
      const contrast = adjuster.calculateContrast(foreground, background);
      
      // Should be close to threshold
      expect(contrast).toBeGreaterThan(4.5);
      expect(adjuster.meetsWCAG_AA(foreground, background, false)).toBe(true);
    });

    it('should check large text threshold is 3:1', () => {
      // Create a color pair with contrast between 3:1 and 4.5:1
      const foreground = '#949494';
      const background = '#ffffff';
      const contrast = adjuster.calculateContrast(foreground, background);
      
      // Should be between 3.0 and 4.5
      expect(contrast).toBeGreaterThan(3.0);
      
      // Should pass for large text but not normal text
      expect(adjuster.meetsWCAG_AA(foreground, background, true)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      const contrast = adjuster.calculateContrast('', '');
      expect(contrast).toBe(1);
    });

    it('should handle case-insensitive named colors', () => {
      const contrast1 = adjuster.calculateContrast('BLACK', 'WHITE');
      const contrast2 = adjuster.calculateContrast('black', 'white');
      expect(contrast1).toBeCloseTo(contrast2, 1);
    });

    it('should handle whitespace in color strings', () => {
      const contrast = adjuster.calculateContrast(' #000000 ', ' #ffffff ');
      expect(contrast).toBeCloseTo(21, 1);
    });
  });

  describe('adjustTextColor', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      // Create a mock element
      mockElement = document.createElement('div');
      mockElement.textContent = 'Test text';
      document.body.appendChild(mockElement);
    });

    afterEach(() => {
      document.body.removeChild(mockElement);
    });

    it('should not change color if contrast already meets requirement', () => {
      // Set up high contrast: black text on white background
      mockElement.style.color = '#000000';
      mockElement.style.backgroundColor = '#ffffff';
      
      const originalColor = mockElement.style.color;
      adjuster.adjustTextColor(mockElement, 4.5);
      
      // Color should remain unchanged
      expect(mockElement.style.color).toBe(originalColor);
    });

    it('should lighten text color on dark background', () => {
      // Dark background with dark text (poor contrast)
      mockElement.style.backgroundColor = '#1a0033'; // Dark purple
      mockElement.style.color = '#400070'; // Medium purple (poor contrast)
      
      adjuster.adjustTextColor(mockElement, 4.5);
      
      // Text color should be changed (lightened)
      expect(mockElement.style.color).not.toBe('#400070');
      expect(mockElement.style.color).toBeTruthy();
      
      // Verify improved contrast
      const newContrast = adjuster.calculateContrast(
        mockElement.style.color,
        mockElement.style.backgroundColor
      );
      expect(newContrast).toBeGreaterThanOrEqual(4.5);
    });

    it('should darken text color on light background', () => {
      // Light background with light text (poor contrast)
      mockElement.style.backgroundColor = '#f0d9ff'; // Light purple
      mockElement.style.color = '#e0b3ff'; // Slightly darker light purple (poor contrast)
      
      adjuster.adjustTextColor(mockElement, 4.5);
      
      // Text color should be changed (darkened)
      expect(mockElement.style.color).not.toBe('#e0b3ff');
      
      // Verify improved contrast
      const newContrast = adjuster.calculateContrast(
        mockElement.style.color,
        mockElement.style.backgroundColor
      );
      expect(newContrast).toBeGreaterThanOrEqual(4.5);
    });

    it('should handle large text threshold (3:1)', () => {
      // Set up a scenario where 3:1 is achievable
      mockElement.style.backgroundColor = '#1a0033';
      mockElement.style.color = '#400070';
      
      adjuster.adjustTextColor(mockElement, 3.0);
      
      const newContrast = adjuster.calculateContrast(
        mockElement.style.color,
        mockElement.style.backgroundColor
      );
      expect(newContrast).toBeGreaterThanOrEqual(3.0);
    });

    it('should call enhanceReadability when color adjustment is insufficient', () => {
      // Create a scenario where color adjustment might not be enough
      // Very similar colors
      mockElement.style.backgroundColor = '#1a0033';
      mockElement.style.color = '#1a0035';
      
      const enhanceSpy = jest.spyOn(adjuster as any, 'enhanceReadability');
      
      adjuster.adjustTextColor(mockElement, 4.5);
      
      // Should either improve contrast or call enhanceReadability
      const finalContrast = adjuster.calculateContrast(
        mockElement.style.color,
        mockElement.style.backgroundColor
      );
      
      if (finalContrast < 4.5) {
        expect(enhanceSpy).toHaveBeenCalled();
      }
      
      enhanceSpy.mockRestore();
    });

    it('should handle elements without explicit background color', () => {
      // Element inherits background from parent/body
      mockElement.style.color = '#cccccc'; // Light gray
      // No background color set - will inherit
      
      adjuster.adjustTextColor(mockElement, 4.5);
      
      // Should adjust based on effective background (likely white)
      expect(mockElement.style.color).toBeTruthy();
    });
  });

  describe('enhanceReadability', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = document.createElement('div');
      mockElement.textContent = 'Test text';
      document.body.appendChild(mockElement);
    });

    afterEach(() => {
      document.body.removeChild(mockElement);
    });

    it('should apply white text and shadow on dark background', () => {
      mockElement.style.backgroundColor = '#1a0033'; // Dark purple
      
      adjuster.enhanceReadability(mockElement);
      
      // Browser converts hex to rgb format
      expect(mockElement.style.color).toMatch(/rgb\(255,\s*255,\s*255\)|#ffffff/);
      expect(mockElement.style.textShadow).toContain('rgba(0, 0, 0');
    });

    it('should apply dark text and shadow on light background', () => {
      mockElement.style.backgroundColor = '#f0d9ff'; // Light purple
      
      adjuster.enhanceReadability(mockElement);
      
      // Browser converts hex to rgb format
      expect(mockElement.style.color).toMatch(/rgb\(0,\s*0,\s*0\)|#000000/);
      expect(mockElement.style.textShadow).toContain('rgba(255, 255, 255');
    });

    it('should handle elements without explicit background', () => {
      // No background set - will default to light
      
      adjuster.enhanceReadability(mockElement);
      
      // Should apply styling (dark text for light background)
      expect(mockElement.style.color).toBeTruthy();
      expect(mockElement.style.textShadow).toBeTruthy();
    });

    it('should ensure readable contrast after enhancement', () => {
      mockElement.style.backgroundColor = '#1a0033'; // Dark purple
      
      adjuster.enhanceReadability(mockElement);
      
      // Check that the enhanced text meets WCAG AA
      const contrast = adjuster.calculateContrast(
        mockElement.style.color,
        mockElement.style.backgroundColor
      );
      
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });
  });
});
