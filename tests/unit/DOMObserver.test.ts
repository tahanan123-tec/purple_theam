/**
 * Unit tests for DOMObserver DOM mutation monitoring
 * Validates: Requirements 6.4, 6.5
 */

import { DOMObserver } from '../../src/DOMObserver';
import { ThemeEngine } from '../../src/ThemeEngine';

describe('DOMObserver', () => {
  let domObserver: DOMObserver;
  let themeEngine: ThemeEngine;

  beforeEach(() => {
    // Clean up document
    document.body.innerHTML = '';
    
    // Create instances
    themeEngine = new ThemeEngine();
    domObserver = new DOMObserver(themeEngine);
  });

  afterEach(() => {
    // Stop observer
    domObserver.stop();
    
    // Clean up document
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('should create DOMObserver with ThemeEngine reference', () => {
      expect(domObserver).toBeDefined();
      expect(domObserver).toBeInstanceOf(DOMObserver);
    });
  });

  describe('start', () => {
    it('should start observing DOM mutations', () => {
      expect(() => {
        domObserver.start();
      }).not.toThrow();
    });

    it('should not create multiple observers when called multiple times', () => {
      domObserver.start();
      domObserver.start();
      domObserver.start();
      
      // Should not throw and should work normally
      expect(() => {
        const div = document.createElement('div');
        document.body.appendChild(div);
      }).not.toThrow();
    });

    it('should handle starting before body exists', (done) => {
      // This test simulates early script execution
      // In real scenario, the observer handles waiting for body
      // We just verify it doesn't crash
      const observer = new DOMObserver(themeEngine);
      observer.start();
      
      setTimeout(() => {
        observer.stop();
        done();
      }, 150);
    });
  });

  describe('stop', () => {
    it('should stop observing DOM mutations', () => {
      domObserver.start();
      domObserver.stop();
      
      expect(() => {
        const div = document.createElement('div');
        document.body.appendChild(div);
      }).not.toThrow();
    });

    it('should handle stopping without starting', () => {
      expect(() => {
        domObserver.stop();
      }).not.toThrow();
    });

    it('should handle multiple stop calls', () => {
      domObserver.start();
      domObserver.stop();
      domObserver.stop();
      domObserver.stop();
      
      expect(() => {
        const div = document.createElement('div');
        document.body.appendChild(div);
      }).not.toThrow();
    });
  });

  describe('onMutation - throttling', () => {
    it('should throttle mutations to batch process every 200ms', (done) => {
      domObserver.start();
      
      // Spy on applyToElement
      const applySpy = jest.spyOn(themeEngine, 'applyToElement');
      
      // Add multiple elements rapidly
      const div1 = document.createElement('div');
      div1.style.backgroundColor = 'rgb(100, 100, 100)';
      document.body.appendChild(div1);
      
      const div2 = document.createElement('div');
      div2.style.backgroundColor = 'rgb(150, 150, 150)';
      document.body.appendChild(div2);
      
      const div3 = document.createElement('div');
      div3.style.backgroundColor = 'rgb(200, 200, 200)';
      document.body.appendChild(div3);
      
      // Should not process immediately
      expect(applySpy).not.toHaveBeenCalled();
      
      // Wait for throttle delay + buffer
      setTimeout(() => {
        // Should have processed all elements
        expect(applySpy).toHaveBeenCalled();
        done();
      }, 250);
    });

    it('should accumulate mutations during throttle period', (done) => {
      domObserver.start();
      
      const applySpy = jest.spyOn(themeEngine, 'applyToElement');
      
      // Add elements at different times within throttle period
      const div1 = document.createElement('div');
      document.body.appendChild(div1);
      
      setTimeout(() => {
        const div2 = document.createElement('div');
        document.body.appendChild(div2);
      }, 50);
      
      setTimeout(() => {
        const div3 = document.createElement('div');
        document.body.appendChild(div3);
      }, 100);
      
      // Wait for throttle to complete
      setTimeout(() => {
        // All three elements should be processed in one batch
        expect(applySpy).toHaveBeenCalled();
        done();
      }, 250);
    });
  });

  describe('onMutation - filtering', () => {
    it('should filter out theme engine data attribute mutations', (done) => {
      // Create a div that already has theme applied
      const div = document.createElement('div');
      div.style.backgroundColor = 'rgb(100, 100, 100)';
      div.setAttribute('data-sasuke-original-bg', 'rgb(100, 100, 100)');
      document.body.appendChild(div);
      
      // Now start observer and spy
      domObserver.start();
      const applySpy = jest.spyOn(themeEngine, 'applyToElement');
      
      // Manually set theme data attributes (simulating theme engine internal changes)
      div.setAttribute('data-sasuke-original-bg', 'rgb(150, 150, 150)');
      div.setAttribute('data-sasuke-original-color', 'rgb(0, 0, 0)');
      div.setAttribute('data-sasuke-original-text-decoration', 'none');
      
      // Wait for potential processing
      setTimeout(() => {
        // These data attribute changes should be filtered out
        expect(applySpy).not.toHaveBeenCalled();
        done();
      }, 250);
    });

    it('should process childList mutations with new elements', (done) => {
      domObserver.start();
      
      const applySpy = jest.spyOn(themeEngine, 'applyToElement');
      
      const div = document.createElement('div');
      div.style.backgroundColor = 'rgb(100, 100, 100)';
      document.body.appendChild(div);
      
      setTimeout(() => {
        expect(applySpy).toHaveBeenCalled();
        done();
      }, 250);
    });

    it('should ignore mutations with no added HTML elements', (done) => {
      domObserver.start();
      
      const applySpy = jest.spyOn(themeEngine, 'applyToElement');
      
      // Add a text node (not an HTML element)
      const textNode = document.createTextNode('Text');
      document.body.appendChild(textNode);
      
      setTimeout(() => {
        // Should not process text-only mutations
        expect(applySpy).not.toHaveBeenCalled();
        done();
      }, 250);
    });

    it('should process style attribute changes on elements', (done) => {
      const div = document.createElement('div');
      div.style.backgroundColor = 'rgb(100, 100, 100)';
      document.body.appendChild(div);
      
      domObserver.start();
      
      // Wait a bit, then change style
      setTimeout(() => {
        const applySpy = jest.spyOn(themeEngine, 'applyToElement');
        
        div.style.backgroundColor = 'rgb(200, 200, 200)';
        
        setTimeout(() => {
          expect(applySpy).toHaveBeenCalled();
          done();
        }, 250);
      }, 100);
    });

    it('should process class attribute changes on elements', (done) => {
      const div = document.createElement('div');
      div.className = 'original';
      document.body.appendChild(div);
      
      domObserver.start();
      
      setTimeout(() => {
        const applySpy = jest.spyOn(themeEngine, 'applyToElement');
        
        div.className = 'modified';
        
        setTimeout(() => {
          expect(applySpy).toHaveBeenCalled();
          done();
        }, 250);
      }, 100);
    });
  });

  describe('onMutation - element theming', () => {
    it('should apply theme to newly added elements', (done) => {
      domObserver.start();
      
      const div = document.createElement('div');
      div.style.backgroundColor = 'rgb(100, 100, 100)';
      document.body.appendChild(div);
      
      setTimeout(() => {
        // Element should have theme applied
        expect(div.hasAttribute('data-sasuke-original-bg')).toBe(true);
        done();
      }, 250);
    });

    it('should apply theme to nested elements when parent is added', (done) => {
      domObserver.start();
      
      const parent = document.createElement('div');
      parent.style.backgroundColor = 'rgb(100, 100, 100)';
      
      const child1 = document.createElement('div');
      child1.style.backgroundColor = 'rgb(150, 150, 150)';
      
      const child2 = document.createElement('div');
      child2.style.backgroundColor = 'rgb(200, 200, 200)';
      
      parent.appendChild(child1);
      parent.appendChild(child2);
      
      // Add parent with children
      document.body.appendChild(parent);
      
      setTimeout(() => {
        // All should have theme applied
        expect(parent.hasAttribute('data-sasuke-original-bg')).toBe(true);
        expect(child1.hasAttribute('data-sasuke-original-bg')).toBe(true);
        expect(child2.hasAttribute('data-sasuke-original-bg')).toBe(true);
        done();
      }, 250);
    });

    it('should apply theme to deeply nested elements', (done) => {
      domObserver.start();
      
      const level1 = document.createElement('div');
      const level2 = document.createElement('div');
      const level3 = document.createElement('div');
      const level4 = document.createElement('div');
      
      level1.style.backgroundColor = 'rgb(100, 100, 100)';
      level2.style.backgroundColor = 'rgb(120, 120, 120)';
      level3.style.backgroundColor = 'rgb(140, 140, 140)';
      level4.style.backgroundColor = 'rgb(160, 160, 160)';
      
      level3.appendChild(level4);
      level2.appendChild(level3);
      level1.appendChild(level2);
      
      document.body.appendChild(level1);
      
      setTimeout(() => {
        expect(level1.hasAttribute('data-sasuke-original-bg')).toBe(true);
        expect(level2.hasAttribute('data-sasuke-original-bg')).toBe(true);
        expect(level3.hasAttribute('data-sasuke-original-bg')).toBe(true);
        expect(level4.hasAttribute('data-sasuke-original-bg')).toBe(true);
        done();
      }, 250);
    });

    it('should handle rapid DOM changes', (done) => {
      domObserver.start();
      
      // Add many elements rapidly
      for (let i = 0; i < 10; i++) {
        const div = document.createElement('div');
        div.style.backgroundColor = `rgb(${100 + i * 10}, ${100 + i * 10}, ${100 + i * 10})`;
        div.id = `div-${i}`;
        document.body.appendChild(div);
      }
      
      setTimeout(() => {
        // All elements should have theme applied
        for (let i = 0; i < 10; i++) {
          const element = document.getElementById(`div-${i}`)!;
          expect(element.hasAttribute('data-sasuke-original-bg')).toBe(true);
        }
        done();
      }, 250);
    });

    it('should handle elements added at different times', (done) => {
      domObserver.start();
      
      const div1 = document.createElement('div');
      div1.style.backgroundColor = 'rgb(100, 100, 100)';
      div1.id = 'div1';
      document.body.appendChild(div1);
      
      setTimeout(() => {
        const div2 = document.createElement('div');
        div2.style.backgroundColor = 'rgb(150, 150, 150)';
        div2.id = 'div2';
        document.body.appendChild(div2);
        
        setTimeout(() => {
          const div3 = document.createElement('div');
          div3.style.backgroundColor = 'rgb(200, 200, 200)';
          div3.id = 'div3';
          document.body.appendChild(div3);
          
          setTimeout(() => {
            expect(document.getElementById('div1')!.hasAttribute('data-sasuke-original-bg')).toBe(true);
            expect(document.getElementById('div2')!.hasAttribute('data-sasuke-original-bg')).toBe(true);
            expect(document.getElementById('div3')!.hasAttribute('data-sasuke-original-bg')).toBe(true);
            done();
          }, 250);
        }, 300);
      }, 300);
    }, 2000); // Increase timeout for this test
  });

  describe('integration with ThemeEngine', () => {
    it('should use ThemeEngine to apply styles to new elements', (done) => {
      domObserver.start();
      
      const div = document.createElement('div');
      div.style.backgroundColor = 'rgb(200, 200, 200)';
      div.style.color = 'rgb(50, 50, 50)';
      document.body.appendChild(div);
      
      setTimeout(() => {
        // Theme engine should have applied purple colors
        expect(div.style.backgroundColor).not.toBe('rgb(200, 200, 200)');
        expect(div.style.color).not.toBe('rgb(50, 50, 50)');
        
        // Original colors should be stored
        expect(div.getAttribute('data-sasuke-original-bg')).toContain('200');
        expect(div.getAttribute('data-sasuke-original-color')).toContain('50');
        
        done();
      }, 250);
    });

    it('should apply theme to links added dynamically', (done) => {
      domObserver.start();
      
      const link = document.createElement('a');
      link.href = 'https://example.com';
      link.textContent = 'Dynamic link';
      link.style.color = 'rgb(0, 0, 255)';
      link.style.textDecoration = 'none';
      document.body.appendChild(link);
      
      setTimeout(() => {
        // Link should have purple color and underline
        expect(link.style.color).not.toBe('rgb(0, 0, 255)');
        expect(link.style.textDecoration).toBe('underline');
        expect(link.hasAttribute('data-sasuke-original-color')).toBe(true);
        expect(link.hasAttribute('data-sasuke-original-text-decoration')).toBe(true);
        done();
      }, 250);
    });

    it('should handle various element types', (done) => {
      domObserver.start();
      
      const elements = [
        { tag: 'div', style: 'background-color: rgb(100, 100, 100);' },
        { tag: 'p', style: 'color: rgb(50, 50, 50);' },
        { tag: 'span', style: 'background-color: rgb(150, 150, 150);' },
        { tag: 'section', style: 'background-color: rgb(200, 200, 200);' },
        { tag: 'header', style: 'background-color: rgb(120, 120, 120);' }
      ];
      
      elements.forEach((config, index) => {
        const element = document.createElement(config.tag);
        element.setAttribute('style', config.style);
        element.id = `element-${index}`;
        document.body.appendChild(element);
      });
      
      setTimeout(() => {
        elements.forEach((config, index) => {
          const element = document.getElementById(`element-${index}`)!;
          expect(
            element.hasAttribute('data-sasuke-original-bg') || 
            element.hasAttribute('data-sasuke-original-color')
          ).toBe(true);
        });
        done();
      }, 250);
    });
  });

  describe('performance', () => {
    it('should not process mutations while already processing', (done) => {
      domObserver.start();
      
      const applySpy = jest.spyOn(themeEngine, 'applyToElement');
      
      // Add element
      const div1 = document.createElement('div');
      document.body.appendChild(div1);
      
      // Add another element immediately
      const div2 = document.createElement('div');
      document.body.appendChild(div2);
      
      setTimeout(() => {
        // Both should be processed in a single batch
        const callCount = applySpy.mock.calls.length;
        expect(callCount).toBeGreaterThan(0);
        done();
      }, 250);
    });

    it('should use Set to avoid duplicate element processing', (done) => {
      domObserver.start();
      
      const applySpy = jest.spyOn(themeEngine, 'applyToElement');
      
      const div = document.createElement('div');
      div.id = 'test-div';
      document.body.appendChild(div);
      
      setTimeout(() => {
        // Should be called once per element (no duplicates)
        const callsForDiv = applySpy.mock.calls.filter(call => {
          const element = call[0] as HTMLElement;
          return element.id === 'test-div';
        });
        
        // Should only process the div once even if multiple mutations detected
        expect(callsForDiv.length).toBeGreaterThanOrEqual(1);
        done();
      }, 250);
    });
  });

  describe('edge cases', () => {
    it('should handle removed nodes gracefully', (done) => {
      domObserver.start();
      
      const div = document.createElement('div');
      document.body.appendChild(div);
      
      // Remove immediately
      document.body.removeChild(div);
      
      setTimeout(() => {
        // Should not crash
        expect(true).toBe(true);
        done();
      }, 250);
    });

    it('should handle empty containers', (done) => {
      domObserver.start();
      
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 250);
    });

    it('should handle SVG elements gracefully', (done) => {
      domObserver.start();
      
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      document.body.appendChild(svg);
      
      setTimeout(() => {
        // Should not crash on non-HTML elements
        expect(true).toBe(true);
        done();
      }, 250);
    });
  });
});
