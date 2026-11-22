import { BackgroundManager } from '../../src/BackgroundManager';

// Mock chrome API
Object.defineProperty(window, 'chrome', {
  writable: true,
  value: {
    runtime: {
      getURL: jest.fn((path: string) => `chrome-extension://mock-id/${path}`)
    }
  }
});

describe('BackgroundManager', () => {
  let backgroundManager: BackgroundManager;
  let mockBody: HTMLElement;

  beforeEach(() => {
    // Set up a clean DOM environment
    document.body.innerHTML = '';
    mockBody = document.body;
    backgroundManager = new BackgroundManager();
  });

  afterEach(() => {
    // Clean up any background layers
    backgroundManager.removeBackgroundLayer();
  });

  describe('createBackgroundLayer', () => {
    it('should create a background layer with correct CSS properties', () => {
      backgroundManager.createBackgroundLayer();

      const layer = document.getElementById('sasuke-purple-theme-background');
      expect(layer).not.toBeNull();
      expect(layer?.style.position).toBe('fixed');
      expect(layer?.style.top).toBe('0px');
      expect(layer?.style.left).toBe('0px');
      expect(layer?.style.width).toBe('100vw');
      expect(layer?.style.height).toBe('100vh');
      expect(layer?.style.zIndex).toBe('-1'); // Requirement 2.5: behind content
      expect(layer?.style.pointerEvents).toBe('none');
    });

    it('should apply Sasuke image with background-size: cover', () => {
      backgroundManager.createBackgroundLayer();

      const layer = document.getElementById('sasuke-purple-theme-background');
      expect(layer?.style.backgroundSize).toBe('cover');
      expect(layer?.style.backgroundImage).toContain('sasuke-shadow.png');
    });

    it('should set background-attachment: fixed for scroll persistence', () => {
      backgroundManager.createBackgroundLayer();

      const layer = document.getElementById('sasuke-purple-theme-background');
      expect(layer?.style.backgroundAttachment).toBe('fixed'); // Requirement 2.4
    });

    it('should set pointer-events: none to prevent interaction blocking', () => {
      backgroundManager.createBackgroundLayer();

      const layer = document.getElementById('sasuke-purple-theme-background');
      expect(layer?.style.pointerEvents).toBe('none');
    });

    it('should not create duplicate layers when called multiple times', () => {
      backgroundManager.createBackgroundLayer();
      backgroundManager.createBackgroundLayer();
      backgroundManager.createBackgroundLayer();

      const layers = document.querySelectorAll('#sasuke-purple-theme-background');
      expect(layers.length).toBe(1);
    });

    it('should insert layer at the beginning of body', () => {
      const existingElement = document.createElement('div');
      existingElement.id = 'existing-content';
      document.body.appendChild(existingElement);

      backgroundManager.createBackgroundLayer();

      expect(document.body.firstChild).toHaveProperty('id', 'sasuke-purple-theme-background');
    });

    it('should use chrome.runtime.getURL for image path', () => {
      backgroundManager.createBackgroundLayer();

      expect(chrome.runtime.getURL).toHaveBeenCalledWith('icons/sasuke-shadow.png');
    });
  });

  describe('removeBackgroundLayer', () => {
    it('should remove the background layer from DOM', () => {
      backgroundManager.createBackgroundLayer();
      expect(document.getElementById('sasuke-purple-theme-background')).not.toBeNull();

      backgroundManager.removeBackgroundLayer();
      expect(document.getElementById('sasuke-purple-theme-background')).toBeNull();
    });

    it('should handle removal when no layer exists', () => {
      // Should not throw error
      expect(() => backgroundManager.removeBackgroundLayer()).not.toThrow();
    });

    it('should clean up orphaned layers by ID', () => {
      // Manually create an orphaned layer
      const orphanedLayer = document.createElement('div');
      orphanedLayer.id = 'sasuke-purple-theme-background';
      document.body.appendChild(orphanedLayer);

      backgroundManager.removeBackgroundLayer();
      expect(document.getElementById('sasuke-purple-theme-background')).toBeNull();
    });
  });

  describe('updatePosition', () => {
    it('should maintain fixed positioning when called', () => {
      backgroundManager.createBackgroundLayer();

      const layer = document.getElementById('sasuke-purple-theme-background');
      // Simulate position change
      if (layer) {
        layer.style.position = 'absolute';
      }

      backgroundManager.updatePosition();
      expect(layer?.style.position).toBe('fixed');
    });

    it('should maintain fixed background attachment', () => {
      backgroundManager.createBackgroundLayer();

      const layer = document.getElementById('sasuke-purple-theme-background');
      // Simulate attachment change
      if (layer) {
        layer.style.backgroundAttachment = 'scroll';
      }

      backgroundManager.updatePosition();
      expect(layer?.style.backgroundAttachment).toBe('fixed');
    });

    it('should handle call when no layer exists', () => {
      // Should not throw error
      expect(() => backgroundManager.updatePosition()).not.toThrow();
    });
  });

  describe('z-index ordering (Requirement 2.5)', () => {
    it('should place background layer behind content elements', () => {
      const contentDiv = document.createElement('div');
      contentDiv.style.zIndex = '1';
      document.body.appendChild(contentDiv);

      backgroundManager.createBackgroundLayer();

      const backgroundLayer = document.getElementById('sasuke-purple-theme-background');
      expect(parseInt(backgroundLayer?.style.zIndex || '0')).toBeLessThan(
        parseInt(contentDiv.style.zIndex)
      );
    });

    it('should have z-index of -1 to ensure it is behind all normal content', () => {
      backgroundManager.createBackgroundLayer();

      const layer = document.getElementById('sasuke-purple-theme-background');
      expect(layer?.style.zIndex).toBe('-1');
    });
  });

  describe('Edge cases', () => {
    it('should handle missing body element gracefully', () => {
      // This is a hypothetical scenario since we always have body in tests
      // but we ensure the code checks for body existence
      backgroundManager.createBackgroundLayer();
      // Should not throw
    });

    it('should create layer after previous layer was removed', () => {
      backgroundManager.createBackgroundLayer();
      let layer = document.getElementById('sasuke-purple-theme-background');
      expect(layer).not.toBeNull();

      backgroundManager.removeBackgroundLayer();
      expect(document.getElementById('sasuke-purple-theme-background')).toBeNull();

      backgroundManager.createBackgroundLayer();
      layer = document.getElementById('sasuke-purple-theme-background');
      expect(layer).not.toBeNull();
    });
  });
});
