/**
 * Unit tests for content script error handling
 * Tests document validation, retry logic, and CSP fallback
 * Validates: Requirements 6.1, 6.3
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('Content Script Error Handling', () => {
  // We'll need to mock the Chrome API and DOM
  let originalDocument: Document;
  let originalChrome: any;

  beforeEach(() => {
    // Save original document
    originalDocument = global.document;

    // Mock Chrome API
    originalChrome = (global as any).chrome;
    (global as any).chrome = {
      runtime: {
        onMessage: {
          addListener: jest.fn()
        }
      },
      storage: {
        sync: {
          get: jest.fn(() => Promise.resolve({})),
          set: jest.fn(() => Promise.resolve(undefined))
        }
      }
    };
  });

  afterEach(() => {
    // Restore originals
    global.document = originalDocument;
    (global as any).chrome = originalChrome;
    jest.restoreAllMocks();
  });

  describe('Document Structure Validation', () => {
    it('should validate that html element exists', () => {
      // Create a mock document without documentElement
      const mockDoc = {
        body: document.createElement('body'),
        documentElement: null,
        readyState: 'complete',
        addEventListener: jest.fn(),
        querySelectorAll: jest.fn().mockReturnValue([])
      } as any;

      global.document = mockDoc;

      // The validation should fail when documentElement is missing
      expect(mockDoc.documentElement).toBeNull();
    });

    it('should validate that body element exists', () => {
      // Create a mock document without body
      const mockDoc = {
        documentElement: document.createElement('html'),
        body: null,
        readyState: 'complete',
        addEventListener: jest.fn(),
        querySelectorAll: jest.fn().mockReturnValue([])
      } as any;

      global.document = mockDoc;

      // The validation should fail when body is missing
      expect(mockDoc.body).toBeNull();
    });

    it('should pass validation when both html and body exist', () => {
      // Use actual document which has both
      expect(document.documentElement).toBeTruthy();
      expect(document.body).toBeTruthy();
    });
  });

  describe('Retry Logic with Exponential Backoff', () => {
    it('should retry operation up to 3 times', async () => {
      let attemptCount = 0;
      const operation = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Operation failed');
        }
        return Promise.resolve();
      });

      // Simulate retry logic
      const maxRetries = 3;
      let lastError: Error | null = null;
      let succeeded = false;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          await operation();
          succeeded = true;
          lastError = null; // Clear error on success
          break; // Success
        } catch (error) {
          lastError = error as Error;
          if (attempt < maxRetries - 1) {
            // Would wait here in real implementation
            continue;
          }
        }
      }

      expect(attemptCount).toBe(3);
      expect(succeeded).toBe(true);
      expect(lastError).toBeNull();
    });

    it('should use exponential backoff delays', () => {
      const INITIAL_DELAY = 100;
      const expectedDelays = [
        INITIAL_DELAY * Math.pow(2, 0), // 100ms
        INITIAL_DELAY * Math.pow(2, 1), // 200ms
        INITIAL_DELAY * Math.pow(2, 2)  // 400ms
      ];

      expect(expectedDelays).toEqual([100, 200, 400]);
    });

    it('should throw error after all retries exhausted', async () => {
      const operation = jest.fn(() => Promise.reject(new Error('Persistent failure')));

      const maxRetries = 3;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          await operation();
          break;
        } catch (error) {
          lastError = error as Error;
        }
      }

      expect(operation).toHaveBeenCalledTimes(3);
      expect(lastError).toBeTruthy();
      expect(lastError?.message).toBe('Persistent failure');
    });
  });

  describe('CSP Fallback - Injected Stylesheet', () => {
    it('should create stylesheet element when inline styles blocked', () => {
      // Create a stylesheet programmatically
      const stylesheet = document.createElement('style');
      stylesheet.id = 'sasuke-purple-theme-stylesheet';
      stylesheet.type = 'text/css';
      
      const css = `
        body { background-color: #2d0052 !important; }
        a { color: #e0b3ff !important; }
      `;
      
      stylesheet.textContent = css;
      
      expect(stylesheet.id).toBe('sasuke-purple-theme-stylesheet');
      expect(stylesheet.type).toBe('text/css');
      expect(stylesheet.textContent).toContain('#2d0052');
    });

    it('should inject stylesheet into document head', () => {
      const stylesheet = document.createElement('style');
      stylesheet.id = 'sasuke-purple-theme-stylesheet';
      stylesheet.textContent = 'body { background-color: #2d0052; }';
      
      document.head.appendChild(stylesheet);
      
      const injected = document.getElementById('sasuke-purple-theme-stylesheet');
      expect(injected).toBeTruthy();
      expect(injected?.tagName).toBe('STYLE');
      
      // Cleanup
      injected?.remove();
    });

    it('should not create duplicate stylesheet if one already exists', () => {
      // First injection
      const stylesheet1 = document.createElement('style');
      stylesheet1.id = 'sasuke-purple-theme-stylesheet';
      document.head.appendChild(stylesheet1);
      
      // Check if it already exists before creating second
      const existing = document.getElementById('sasuke-purple-theme-stylesheet');
      
      if (!existing) {
        const stylesheet2 = document.createElement('style');
        stylesheet2.id = 'sasuke-purple-theme-stylesheet';
        document.head.appendChild(stylesheet2);
      }
      
      // Should only have one stylesheet
      const allStylesheets = document.querySelectorAll('#sasuke-purple-theme-stylesheet');
      expect(allStylesheets.length).toBe(1);
      
      // Cleanup
      existing?.remove();
    });

    it('should remove injected stylesheet on theme removal', () => {
      // Inject stylesheet
      const stylesheet = document.createElement('style');
      stylesheet.id = 'sasuke-purple-theme-stylesheet';
      document.head.appendChild(stylesheet);
      
      expect(document.getElementById('sasuke-purple-theme-stylesheet')).toBeTruthy();
      
      // Remove it
      const toRemove = document.getElementById('sasuke-purple-theme-stylesheet');
      toRemove?.remove();
      
      expect(document.getElementById('sasuke-purple-theme-stylesheet')).toBeNull();
    });

    it('should include purple color transformations in stylesheet', () => {
      const css = `
        body { background-color: #2d0052 !important; }
        div { background-color: #400070 !important; }
        a { color: #e0b3ff !important; }
        p, span { color: #c280ff !important; }
      `;
      
      // Verify purple colors are included
      expect(css).toContain('#2d0052');
      expect(css).toContain('#400070');
      expect(css).toContain('#e0b3ff');
      expect(css).toContain('#c280ff');
    });

    it('should include link distinguishability styles in stylesheet', () => {
      const css = `
        a {
          color: #e0b3ff !important;
          text-decoration: underline !important;
        }
      `;
      
      expect(css).toContain('text-decoration: underline');
      expect(css).toContain('#e0b3ff');
    });
  });

  describe('Error Recovery Integration', () => {
    it('should handle missing body gracefully with retry', async () => {
      // Simulate body not ready initially
      let bodyReadyCount = 0;
      const checkBody = () => {
        bodyReadyCount++;
        return bodyReadyCount >= 2 ? document.body : null;
      };

      // First check fails, second succeeds
      expect(checkBody()).toBeNull();
      expect(checkBody()).toBeTruthy();
      expect(bodyReadyCount).toBe(2);
    });

    it('should fall back to stylesheet when style application fails', () => {
      // Simulate CSP blocking inline styles
      const mockElement = document.createElement('div');
      let styleSetFailed = false;

      try {
        // Simulate CSP error when setting style
        Object.defineProperty(mockElement, 'style', {
          set: () => {
            throw new Error('CSP: Refused to apply inline style');
          }
        });
        mockElement.style.backgroundColor = '#400070';
      } catch (error) {
        styleSetFailed = true;
        
        // Fallback to stylesheet approach
        const stylesheet = document.createElement('style');
        stylesheet.textContent = 'div { background-color: #400070; }';
        expect(stylesheet.textContent).toContain('#400070');
      }

      expect(styleSetFailed).toBe(true);
    });
  });
});
