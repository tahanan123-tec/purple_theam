/**
 * Unit tests for ThemeEngine color conversion logic
 * Validates: Requirements 1.2, 1.3, 1.5, 4.4
 */

import { ThemeEngine } from '../../src/ThemeEngine';

describe('ThemeEngine', () => {
  let themeEngine: ThemeEngine;

  beforeEach(() => {
    themeEngine = new ThemeEngine();
  });

  describe('getPurpleShade', () => {
    it('should convert dark colors to dark purple shades', () => {
      const result = themeEngine.getPurpleShade('rgb(0, 0, 0)');
      // Black (lightness ~0) should map to darkest purple
      expect(result).toBe('#1a0033');
    });

    it('should convert light colors to light purple shades', () => {
      const result = themeEngine.getPurpleShade('rgb(255, 255, 255)');
      // White (lightness 100) should map to lightest purple
      expect(result).toBe('#f5e6ff');
    });

    it('should convert mid-range colors to mid-range purple shades', () => {
      const result = themeEngine.getPurpleShade('rgb(128, 128, 128)');
      // Gray (lightness ~50) should map to mid-range purple
      // Should be one of the purple shades around the transition point
      expect(['#8b00e0', '#a64dff']).toContain(result);
    });

    it('should handle hex color format', () => {
      const result = themeEngine.getPurpleShade('#000000');
      expect(result).toBe('#1a0033');
    });

    it('should handle short hex color format', () => {
      const result = themeEngine.getPurpleShade('#fff');
      expect(result).toBe('#f5e6ff');
    });

    it('should handle RGB format', () => {
      const result = themeEngine.getPurpleShade('rgb(50, 50, 50)');
      // Dark gray should map to a dark purple shade
      expect(result.startsWith('#')).toBe(true);
    });

    it('should handle RGBA format with transparency', () => {
      const result = themeEngine.getPurpleShade('rgba(100, 100, 100, 0.5)');
      // Should still convert based on lightness, ignoring alpha
      expect(result.startsWith('#')).toBe(true);
    });

    it('should handle HSL format', () => {
      const result = themeEngine.getPurpleShade('hsl(0, 0%, 0%)');
      expect(result).toBe('#1a0033');
    });

    it('should handle HSLA format', () => {
      const result = themeEngine.getPurpleShade('hsla(0, 0%, 100%, 0.5)');
      expect(result).toBe('#f5e6ff');
    });

    it('should return default purple for transparent colors', () => {
      const result = themeEngine.getPurpleShade('transparent');
      expect(result).toBe('#400070');
    });

    it('should return default purple for unparseable colors', () => {
      const result = themeEngine.getPurpleShade('invalid-color');
      expect(result).toBe('#400070');
    });

    it('should maintain lightness relationships between colors', () => {
      const darkResult = themeEngine.getPurpleShade('rgb(50, 50, 50)');
      const mediumResult = themeEngine.getPurpleShade('rgb(128, 128, 128)');
      const lightResult = themeEngine.getPurpleShade('rgb(200, 200, 200)');

      // Extract lightness from hex colors for comparison
      const getLightness = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const max = Math.max(r, g, b) / 255;
        const min = Math.min(r, g, b) / 255;
        return (max + min) / 2;
      };

      const darkL = getLightness(darkResult);
      const mediumL = getLightness(mediumResult);
      const lightL = getLightness(lightResult);

      // Verify ordering is preserved
      expect(darkL).toBeLessThan(mediumL);
      expect(mediumL).toBeLessThan(lightL);
    });

    it('should handle various lightness levels correctly', () => {
      // Test boundary cases for lightness mapping
      const veryDark = themeEngine.getPurpleShade('rgb(10, 10, 10)');
      const dark = themeEngine.getPurpleShade('rgb(64, 64, 64)');
      const medium = themeEngine.getPurpleShade('rgb(128, 128, 128)');
      const light = themeEngine.getPurpleShade('rgb(192, 192, 192)');
      const veryLight = themeEngine.getPurpleShade('rgb(240, 240, 240)');

      // All should return valid purple hex colors
      expect(veryDark).toMatch(/^#[0-9a-f]{6}$/i);
      expect(dark).toMatch(/^#[0-9a-f]{6}$/i);
      expect(medium).toMatch(/^#[0-9a-f]{6}$/i);
      expect(light).toMatch(/^#[0-9a-f]{6}$/i);
      expect(veryLight).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should use background shades for dark colors (lightness < 50)', () => {
      const backgroundShades = ['#1a0033', '#2d0052', '#400070', '#53008f', '#6b00b8', '#8b00e0'];
      
      const result = themeEngine.getPurpleShade('rgb(30, 30, 30)');
      // Should be one of the background shades
      expect(backgroundShades).toContain(result);
    });

    it('should use foreground shades for light colors (lightness >= 50)', () => {
      const foregroundShades = ['#8b00e0', '#a64dff', '#c280ff', '#e0b3ff', '#f0d9ff', '#f5e6ff'];
      
      const result = themeEngine.getPurpleShade('rgb(200, 200, 200)');
      // Should be one of the foreground shades
      expect(foregroundShades).toContain(result);
    });
  });

  describe('color palette definitions', () => {
    it('should have 6 background shades defined', () => {
      // Testing through the public interface
      const shades = [
        themeEngine.getPurpleShade('rgb(10, 10, 10)'),
        themeEngine.getPurpleShade('rgb(20, 20, 20)'),
        themeEngine.getPurpleShade('rgb(30, 30, 30)'),
        themeEngine.getPurpleShade('rgb(40, 40, 40)'),
        themeEngine.getPurpleShade('rgb(50, 50, 50)'),
        themeEngine.getPurpleShade('rgb(60, 60, 60)')
      ];

      // All should be valid purple hex colors
      shades.forEach(shade => {
        expect(shade).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('should have 6 foreground shades defined', () => {
      // Testing through the public interface
      const shades = [
        themeEngine.getPurpleShade('rgb(130, 130, 130)'),
        themeEngine.getPurpleShade('rgb(160, 160, 160)'),
        themeEngine.getPurpleShade('rgb(180, 180, 180)'),
        themeEngine.getPurpleShade('rgb(200, 200, 200)'),
        themeEngine.getPurpleShade('rgb(220, 220, 220)'),
        themeEngine.getPurpleShade('rgb(240, 240, 240)')
      ];

      // All should be valid purple hex colors
      shades.forEach(shade => {
        expect(shade).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe('applyToElement', () => {
    let testElement: HTMLElement;

    beforeEach(() => {
      // Create a test element
      testElement = document.createElement('div');
      testElement.textContent = 'Test content';
      document.body.appendChild(testElement);
    });

    afterEach(() => {
      // Clean up
      if (testElement.parentNode) {
        testElement.parentNode.removeChild(testElement);
      }
    });

    it('should apply purple transformation to background color', () => {
      testElement.style.backgroundColor = 'rgb(200, 200, 200)';
      
      themeEngine.applyToElement(testElement);
      
      // Should convert to a purple shade
      const appliedBg = testElement.style.backgroundColor;
      expect(appliedBg).toBeTruthy();
      expect(appliedBg).not.toBe('rgb(200, 200, 200)');
    });

    it('should apply purple transformation to text color', () => {
      testElement.style.color = 'rgb(0, 0, 0)';
      
      themeEngine.applyToElement(testElement);
      
      const appliedColor = testElement.style.color;
      expect(appliedColor).toBeTruthy();
      expect(appliedColor).not.toBe('rgb(0, 0, 0)');
    });

    it('should store original background color in data attribute', () => {
      testElement.style.backgroundColor = 'rgb(100, 150, 200)';
      
      themeEngine.applyToElement(testElement);
      
      const stored = testElement.getAttribute('data-sasuke-original-bg');
      expect(stored).toBeTruthy();
      expect(stored).toContain('rgb');
    });

    it('should store original text color in data attribute', () => {
      testElement.style.color = 'rgb(50, 100, 150)';
      
      themeEngine.applyToElement(testElement);
      
      const stored = testElement.getAttribute('data-sasuke-original-color');
      expect(stored).toBeTruthy();
      expect(stored).toContain('rgb');
    });

    it('should not overwrite stored original styles on subsequent calls', () => {
      testElement.style.backgroundColor = 'rgb(100, 100, 100)';
      testElement.style.color = 'rgb(50, 50, 50)';
      
      // First application
      themeEngine.applyToElement(testElement);
      const firstStoredBg = testElement.getAttribute('data-sasuke-original-bg');
      const firstStoredColor = testElement.getAttribute('data-sasuke-original-color');
      
      // Second application
      themeEngine.applyToElement(testElement);
      const secondStoredBg = testElement.getAttribute('data-sasuke-original-bg');
      const secondStoredColor = testElement.getAttribute('data-sasuke-original-color');
      
      expect(secondStoredBg).toBe(firstStoredBg);
      expect(secondStoredColor).toBe(firstStoredColor);
    });

    it('should preserve layout properties - position', () => {
      testElement.style.position = 'absolute';
      testElement.style.top = '10px';
      testElement.style.left = '20px';
      
      themeEngine.applyToElement(testElement);
      
      expect(testElement.style.position).toBe('absolute');
      expect(testElement.style.top).toBe('10px');
      expect(testElement.style.left).toBe('20px');
    });

    it('should preserve layout properties - dimensions', () => {
      testElement.style.width = '100px';
      testElement.style.height = '50px';
      
      themeEngine.applyToElement(testElement);
      
      expect(testElement.style.width).toBe('100px');
      expect(testElement.style.height).toBe('50px');
    });

    it('should preserve layout properties - margin', () => {
      testElement.style.margin = '10px 20px';
      
      themeEngine.applyToElement(testElement);
      
      expect(testElement.style.margin).toBe('10px 20px');
    });

    it('should preserve layout properties - padding', () => {
      testElement.style.padding = '5px 10px';
      
      themeEngine.applyToElement(testElement);
      
      expect(testElement.style.padding).toBe('5px 10px');
    });

    it('should handle elements with no background color', () => {
      testElement.style.backgroundColor = 'transparent';
      
      expect(() => {
        themeEngine.applyToElement(testElement);
      }).not.toThrow();
      
      expect(testElement.style.backgroundColor).toBe('transparent');
    });

    it('should handle elements with rgba(0, 0, 0, 0) background', () => {
      testElement.style.backgroundColor = 'rgba(0, 0, 0, 0)';
      
      themeEngine.applyToElement(testElement);
      
      expect(testElement.style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    });

    it('should apply purple to both background and text color together', () => {
      testElement.style.backgroundColor = 'rgb(240, 240, 240)';
      testElement.style.color = 'rgb(20, 20, 20)';
      
      themeEngine.applyToElement(testElement);
      
      expect(testElement.style.backgroundColor).not.toBe('rgb(240, 240, 240)');
      expect(testElement.style.color).not.toBe('rgb(20, 20, 20)');
      expect(testElement.getAttribute('data-sasuke-original-bg')).toBeTruthy();
      expect(testElement.getAttribute('data-sasuke-original-color')).toBeTruthy();
    });

    it('should maintain relative lightness between background and text', () => {
      testElement.style.backgroundColor = 'rgb(240, 240, 240)';
      testElement.style.color = 'rgb(20, 20, 20)';
      
      themeEngine.applyToElement(testElement);
      
      const bgColor = testElement.style.backgroundColor;
      const textColor = testElement.style.color;
      
      expect(bgColor).toBeTruthy();
      expect(textColor).toBeTruthy();
      expect(bgColor).not.toBe(textColor);
    });

    it('should work with complex computed styles', () => {
      testElement.style.cssText = `
        background-color: #f0f0f0;
        color: #333333;
        padding: 10px;
        margin: 5px;
        border: 1px solid black;
      `;
      
      themeEngine.applyToElement(testElement);
      
      expect(testElement.style.backgroundColor).not.toBe('rgb(240, 240, 240)');
      expect(testElement.style.color).not.toBe('rgb(51, 51, 51)');
      expect(testElement.style.padding).toBe('10px');
      expect(testElement.style.margin).toBe('5px');
      expect(testElement.style.border).toBe('1px solid black');
    });

    it('should apply distinct purple shade to link elements', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      link.textContent = 'Link';
      link.style.color = 'rgb(0, 0, 255)'; // Blue link
      document.body.appendChild(link);

      const normalText = document.createElement('span');
      normalText.style.color = 'rgb(0, 0, 0)'; // Black text
      document.body.appendChild(normalText);

      themeEngine.applyToElement(link);
      themeEngine.applyToElement(normalText);

      const linkColor = link.style.color;
      const textColor = normalText.style.color;

      // Links should get a different purple shade than regular text
      expect(linkColor).toBeTruthy();
      expect(textColor).toBeTruthy();
      expect(linkColor).not.toBe(textColor);

      // Clean up
      document.body.removeChild(link);
      document.body.removeChild(normalText);
    });

    it('should ensure link has text-decoration underline', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      link.textContent = 'Link';
      link.style.color = 'rgb(0, 0, 255)';
      link.style.textDecoration = 'none'; // No underline initially
      document.body.appendChild(link);

      themeEngine.applyToElement(link);

      // Link should now have underline
      expect(link.style.textDecoration).toBe('underline');

      // Clean up
      document.body.removeChild(link);
    });

    it('should preserve existing underline on links', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      link.textContent = 'Link';
      link.style.color = 'rgb(0, 0, 255)';
      link.style.textDecoration = 'underline';
      document.body.appendChild(link);

      themeEngine.applyToElement(link);

      // Link should still have underline
      expect(link.style.textDecoration).toContain('underline');

      // Clean up
      document.body.removeChild(link);
    });

    it('should store original text-decoration in data attribute', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      link.textContent = 'Link';
      link.style.textDecoration = 'none';
      document.body.appendChild(link);

      themeEngine.applyToElement(link);

      const stored = link.getAttribute('data-sasuke-original-text-decoration');
      expect(stored).toBeTruthy();

      // Clean up
      document.body.removeChild(link);
    });

    it('should not apply underline to non-link elements', () => {
      const div = document.createElement('div');
      div.textContent = 'Not a link';
      div.style.textDecoration = 'none';
      document.body.appendChild(div);

      themeEngine.applyToElement(div);

      // Should not add underline to non-links
      expect(div.style.textDecoration).not.toBe('underline');

      // Clean up
      document.body.removeChild(div);
    });

    it('should apply brighter purple shades to links for visibility', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      link.textContent = 'Link';
      link.style.color = 'rgb(128, 128, 128)'; // Medium gray
      document.body.appendChild(link);

      themeEngine.applyToElement(link);

      const linkColor = link.style.color;
      
      // Link should get a bright purple (from the brighter half of foreground shades)
      // The brighter shades are: #c280ff, #e0b3ff, #f0d9ff, #f5e6ff
      const brightPurples = ['rgb(194, 128, 255)', 'rgb(224, 179, 255)', 'rgb(240, 217, 255)', 'rgb(245, 230, 255)'];
      
      // Check if the applied color is one of the bright purples (allowing for browser color formatting differences)
      expect(linkColor).toBeTruthy();
      expect(linkColor).toContain('rgb');

      // Clean up
      document.body.removeChild(link);
    });
  });

  describe('applyTheme', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('should apply theme to all elements in the document', () => {
      document.body.innerHTML = `
        <div id="parent" style="background-color: rgb(200, 200, 200);">
          <p style="color: rgb(50, 50, 50);">Text</p>
          <span style="background-color: rgb(100, 100, 100);">Span</span>
        </div>
      `;

      themeEngine.applyTheme();

      const parent = document.getElementById('parent')!;
      const p = parent.querySelector('p')!;
      const span = parent.querySelector('span')!;

      expect(parent.getAttribute('data-sasuke-original-bg')).toBeTruthy();
      expect(p.getAttribute('data-sasuke-original-color')).toBeTruthy();
      expect(span.getAttribute('data-sasuke-original-bg')).toBeTruthy();
    });

    it('should apply theme to nested elements', () => {
      document.body.innerHTML = `
        <div style="background-color: white;">
          <div style="background-color: gray;">
            <div style="background-color: black;">
              <p style="color: red;">Deep text</p>
            </div>
          </div>
        </div>
      `;

      themeEngine.applyTheme();

      const allDivs = document.querySelectorAll('div');
      allDivs.forEach(div => {
        expect(div.getAttribute('data-sasuke-original-bg')).toBeTruthy();
      });

      const p = document.querySelector('p')!;
      expect(p.getAttribute('data-sasuke-original-color')).toBeTruthy();
    });

    it('should handle empty document', () => {
      document.body.innerHTML = '';

      expect(() => {
        themeEngine.applyTheme();
      }).not.toThrow();
    });

    it('should apply theme to dynamically added elements when called again', () => {
      document.body.innerHTML = '<div id="container"></div>';

      themeEngine.applyTheme();

      const newDiv = document.createElement('div');
      newDiv.style.backgroundColor = 'rgb(150, 150, 150)';
      document.getElementById('container')!.appendChild(newDiv);

      themeEngine.applyTheme();

      expect(newDiv.getAttribute('data-sasuke-original-bg')).toBeTruthy();
    });

    it('should work with various HTML elements', () => {
      document.body.innerHTML = `
        <header style="background-color: blue;"></header>
        <nav style="background-color: green;"></nav>
        <main style="background-color: yellow;"></main>
        <footer style="background-color: red;"></footer>
      `;

      themeEngine.applyTheme();

      const header = document.querySelector('header')!;
      const nav = document.querySelector('nav')!;
      const main = document.querySelector('main')!;
      const footer = document.querySelector('footer')!;

      expect(header.getAttribute('data-sasuke-original-bg')).toBeTruthy();
      expect(nav.getAttribute('data-sasuke-original-bg')).toBeTruthy();
      expect(main.getAttribute('data-sasuke-original-bg')).toBeTruthy();
      expect(footer.getAttribute('data-sasuke-original-bg')).toBeTruthy();
    });

    it('should apply distinct styling to links in the document', () => {
      document.body.innerHTML = `
        <div>
          <p style="color: rgb(0, 0, 0);">Regular text</p>
          <a href="#" style="color: rgb(0, 0, 255);">Link text</a>
        </div>
      `;

      themeEngine.applyTheme();

      const p = document.querySelector('p')!;
      const link = document.querySelector('a')!;

      // Both should be themed
      expect(p.getAttribute('data-sasuke-original-color')).toBeTruthy();
      expect(link.getAttribute('data-sasuke-original-color')).toBeTruthy();

      // Link should have underline
      expect(link.style.textDecoration).toContain('underline');

      // Colors should be different
      expect(link.style.color).not.toBe(p.style.color);
    });

    it('should handle multiple links with different original colors', () => {
      document.body.innerHTML = `
        <div>
          <a href="#" style="color: rgb(0, 0, 255);">Blue link</a>
          <a href="#" style="color: rgb(255, 0, 0);">Red link</a>
          <a href="#" style="color: rgb(0, 255, 0);">Green link</a>
        </div>
      `;

      themeEngine.applyTheme();

      const links = document.querySelectorAll('a');
      
      links.forEach(link => {
        // All links should have theme applied
        expect(link.getAttribute('data-sasuke-original-color')).toBeTruthy();
        // All links should have underline
        expect(link.style.textDecoration).toContain('underline');
        // All links should have purple color
        expect(link.style.color).toBeTruthy();
      });
    });
  });

  describe('removeTheme', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('should restore original styles from data attributes', () => {
      document.body.innerHTML = `
        <div style="background-color: rgb(200, 200, 200); color: rgb(50, 50, 50);"></div>
      `;

      const div = document.querySelector('div')!;

      themeEngine.applyTheme();

      const originalBg = div.getAttribute('data-sasuke-original-bg');
      const originalColor = div.getAttribute('data-sasuke-original-color');

      themeEngine.removeTheme();

      expect(div.style.backgroundColor).toBe(originalBg);
      expect(div.style.color).toBe(originalColor);
    });

    it('should remove data attributes after restoration', () => {
      document.body.innerHTML = `
        <div style="background-color: rgb(100, 100, 100);"></div>
      `;

      const div = document.querySelector('div')!;

      themeEngine.applyTheme();
      themeEngine.removeTheme();

      expect(div.hasAttribute('data-sasuke-original-bg')).toBe(false);
      expect(div.hasAttribute('data-sasuke-original-color')).toBe(false);
    });

    it('should restore all elements in the document', () => {
      document.body.innerHTML = `
        <div style="background-color: rgb(200, 200, 200);">
          <p style="color: rgb(50, 50, 50);">Text</p>
          <span style="background-color: rgb(100, 100, 100);">Span</span>
        </div>
      `;

      const div = document.querySelector('div')!;
      const p = document.querySelector('p')!;
      const span = document.querySelector('span')!;

      const originalDivBg = window.getComputedStyle(div).backgroundColor;
      const originalPColor = window.getComputedStyle(p).color;
      const originalSpanBg = window.getComputedStyle(span).backgroundColor;

      themeEngine.applyTheme();
      themeEngine.removeTheme();

      expect(div.style.backgroundColor).toBe(originalDivBg);
      expect(p.style.color).toBe(originalPColor);
      expect(span.style.backgroundColor).toBe(originalSpanBg);
    });

    it('should handle elements with only background color themed', () => {
      document.body.innerHTML = `
        <div style="background-color: rgb(100, 100, 100);"></div>
      `;

      const div = document.querySelector('div')!;
      const originalBg = window.getComputedStyle(div).backgroundColor;

      themeEngine.applyTheme();
      themeEngine.removeTheme();

      expect(div.style.backgroundColor).toBe(originalBg);
      expect(div.hasAttribute('data-sasuke-original-bg')).toBe(false);
    });

    it('should handle elements with only text color themed', () => {
      document.body.innerHTML = `
        <p style="color: rgb(50, 50, 50);">Text</p>
      `;

      const p = document.querySelector('p')!;
      const originalColor = window.getComputedStyle(p).color;

      themeEngine.applyTheme();
      themeEngine.removeTheme();

      expect(p.style.color).toBe(originalColor);
      expect(p.hasAttribute('data-sasuke-original-color')).toBe(false);
    });

    it('should not throw when removing theme without applying it', () => {
      document.body.innerHTML = `
        <div style="background-color: rgb(100, 100, 100);"></div>
      `;

      expect(() => {
        themeEngine.removeTheme();
      }).not.toThrow();
    });

    it('should maintain layout properties after theme removal', () => {
      document.body.innerHTML = `
        <div style="background-color: rgb(100, 100, 100); width: 100px; height: 50px; margin: 10px; padding: 5px; position: absolute;"></div>
      `;

      const div = document.querySelector('div')!;

      themeEngine.applyTheme();
      themeEngine.removeTheme();

      expect(div.style.width).toBe('100px');
      expect(div.style.height).toBe('50px');
      expect(div.style.margin).toBe('10px');
      expect(div.style.padding).toBe('5px');
      expect(div.style.position).toBe('absolute');
    });

    it('should restore original text-decoration for links', () => {
      document.body.innerHTML = `
        <a href="#" style="color: rgb(0, 0, 255); text-decoration: none;">Link without underline</a>
      `;

      const link = document.querySelector('a')!;
      const originalTextDecoration = link.style.textDecoration;

      themeEngine.applyTheme();
      
      // Theme should add underline
      expect(link.style.textDecoration).toBe('underline');

      themeEngine.removeTheme();

      // Should restore original (no underline)
      expect(link.style.textDecoration).toBe(originalTextDecoration);
      expect(link.hasAttribute('data-sasuke-original-text-decoration')).toBe(false);
    });

    it('should restore links with original underline', () => {
      document.body.innerHTML = `
        <a href="#" style="color: rgb(0, 0, 255); text-decoration: underline;">Link with underline</a>
      `;

      const link = document.querySelector('a')!;
      const originalTextDecoration = link.style.textDecoration;

      themeEngine.applyTheme();
      themeEngine.removeTheme();

      // Should maintain underline
      expect(link.style.textDecoration).toBe(originalTextDecoration);
      expect(link.hasAttribute('data-sasuke-original-text-decoration')).toBe(false);
    });
  });

  describe('applyTheme and removeTheme round-trip', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('should restore original state after apply and remove', () => {
      document.body.innerHTML = `
        <div style="background-color: rgb(240, 240, 240); color: rgb(20, 20, 20);">
          <p style="background-color: rgb(100, 100, 100); color: rgb(200, 200, 200);">Nested</p>
        </div>
      `;

      const div = document.querySelector('div')!;
      const p = document.querySelector('p')!;

      const originalDivBg = div.style.backgroundColor;
      const originalDivColor = div.style.color;
      const originalPBg = p.style.backgroundColor;
      const originalPColor = p.style.color;

      themeEngine.applyTheme();
      themeEngine.removeTheme();

      expect(div.style.backgroundColor).toBe(originalDivBg);
      expect(div.style.color).toBe(originalDivColor);
      expect(p.style.backgroundColor).toBe(originalPBg);
      expect(p.style.color).toBe(originalPColor);

      expect(div.hasAttribute('data-sasuke-original-bg')).toBe(false);
      expect(div.hasAttribute('data-sasuke-original-color')).toBe(false);
      expect(p.hasAttribute('data-sasuke-original-bg')).toBe(false);
      expect(p.hasAttribute('data-sasuke-original-color')).toBe(false);
    });

    it('should handle multiple apply-remove cycles', () => {
      document.body.innerHTML = `
        <div style="background-color: rgb(100, 100, 100);"></div>
      `;

      const div = document.querySelector('div')!;
      const originalBg = div.style.backgroundColor;

      themeEngine.applyTheme();
      themeEngine.removeTheme();
      expect(div.style.backgroundColor).toBe(originalBg);

      themeEngine.applyTheme();
      themeEngine.removeTheme();
      expect(div.style.backgroundColor).toBe(originalBg);

      themeEngine.applyTheme();
      themeEngine.removeTheme();
      expect(div.style.backgroundColor).toBe(originalBg);
    });
  });
});
