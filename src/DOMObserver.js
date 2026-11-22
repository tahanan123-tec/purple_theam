// DOMObserver class - Monitor DOM changes for dynamic content
// Validates: Requirements 6.4, 6.5

/**
 * DOMObserver - Monitors DOM changes and applies theme to dynamically added elements
 * 
 * Uses MutationObserver to detect new elements and changes to the DOM,
 * then applies the purple theme to maintain consistent styling.
 * 
 * Features:
 * - Throttles mutations to batch process every 200ms for performance
 * - Filters out mutations from the theme engine itself to avoid infinite loops
 * - Observes childList, subtree, and attributes
 * 
 * Validates: Requirements 6.4, 6.5
 */
export class DOMObserver {
  /**
   * Create a new DOMObserver
   * @param {Object} themeEngine - ThemeEngine instance to apply theme to new elements
   */
  constructor(themeEngine) {
    this.themeEngine = themeEngine;
    this.observer = null;
    this.throttleTimer = null;
    this.pendingMutations = [];
    this.isProcessing = false;
    
    // Throttle delay in milliseconds
    this.THROTTLE_DELAY = 200;
    
    // Data attribute used by theme engine to mark themed elements
    this.THEME_MARKER_ATTRIBUTES = [
      'data-sasuke-original-bg',
      'data-sasuke-original-color',
      'data-sasuke-original-text-decoration'
    ];
  }

  /**
   * Start observing DOM mutations
   * Begins monitoring for childList, subtree, and attribute changes
   * Validates: Requirements 6.4, 6.5
   */
  start() {
    // Don't create multiple observers
    if (this.observer) {
      return;
    }

    // Create MutationObserver with our callback
    this.observer = new MutationObserver((mutations) => {
      this.onMutation(mutations);
    });

    // Configure observer to watch for:
    // - childList: detect new elements added to DOM
    // - subtree: watch entire tree, not just direct children
    // - attributes: detect attribute changes (for dynamic styling)
    const config = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'] // Only watch style and class changes
    };

    // Start observing the document body
    if (document.body) {
      this.observer.observe(document.body, config);
    } else {
      // If body doesn't exist yet, wait for it
      const waitForBody = setInterval(() => {
        if (document.body) {
          clearInterval(waitForBody);
          this.observer?.observe(document.body, config);
        }
      }, 100);
    }
  }

  /**
   * Stop observing DOM mutations
   */
  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    // Clear any pending throttled processing
    if (this.throttleTimer !== null) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }
    
    this.pendingMutations = [];
  }

  /**
   * Handle mutation callback
   * Throttles mutations to batch process every 200ms
   * Filters out mutations from theme engine itself
   * Validates: Requirements 6.4, 6.5
   * 
   * @param {MutationRecord[]} mutations - Array of MutationRecord objects
   */
  onMutation(mutations) {
    // Filter out mutations from the theme engine itself
    const relevantMutations = mutations.filter(mutation => {
      return this.isRelevantMutation(mutation);
    });

    // If no relevant mutations, skip processing
    if (relevantMutations.length === 0) {
      return;
    }

    // Add to pending mutations
    this.pendingMutations.push(...relevantMutations);

    // Throttle processing - batch process every 200ms
    if (this.throttleTimer !== null) {
      // Already have a timer scheduled, just accumulate mutations
      return;
    }

    // Schedule processing after throttle delay
    this.throttleTimer = setTimeout(() => {
      this.processPendingMutations();
      this.throttleTimer = null;
    }, this.THROTTLE_DELAY);
  }

  /**
   * Check if a mutation is relevant (not from theme engine)
   * @param {MutationRecord} mutation - MutationRecord to check
   * @returns {boolean} true if mutation should be processed
   */
  isRelevantMutation(mutation) {
    // Filter out attribute mutations that are just theme data attributes being set
    if (mutation.type === 'attributes') {
      const attrName = mutation.attributeName;
      
      // Ignore if it's one of our theme marker attributes
      if (attrName && this.THEME_MARKER_ATTRIBUTES.includes(attrName)) {
        return false;
      }
      
      // Ignore if target already has theme applied (avoid re-processing)
      const target = mutation.target;
      if (target instanceof HTMLElement) {
        // If element already has our data attributes, it's likely a theme-induced change
        if (target.hasAttribute('data-sasuke-original-bg')) {
          // Check if this is a style change on an already-themed element
          // We only want to re-theme if it's a significant change, not our own style changes
          if (attrName === 'style') {
            // This could be from dynamic page changes, so we do want to process it
            // but we'll handle duplicates in processPendingMutations
            return true;
          }
          // For class changes on themed elements, we should re-theme
          if (attrName === 'class') {
            return true;
          }
        }
      }
    }

    // For childList mutations, check if added nodes need theming
    if (mutation.type === 'childList') {
      // Only process if there are added nodes
      if (mutation.addedNodes.length === 0) {
        return false;
      }
      
      // Check if any added nodes are actual HTML elements (not text nodes)
      const hasHtmlElements = Array.from(mutation.addedNodes).some(node => {
        return node instanceof HTMLElement;
      });
      
      return hasHtmlElements;
    }

    return true;
  }

  /**
   * Process accumulated mutations in batch
   */
  processPendingMutations() {
    if (this.isProcessing || this.pendingMutations.length === 0) {
      return;
    }

    this.isProcessing = true;

    // Collect all elements that need theming
    const elementsToTheme = new Set();

    for (const mutation of this.pendingMutations) {
      if (mutation.type === 'childList') {
        // Process added nodes
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            // Add the element itself
            elementsToTheme.add(node);
            
            // Also add all descendant elements
            const descendants = node.querySelectorAll('*');
            descendants.forEach(descendant => {
              if (descendant instanceof HTMLElement) {
                elementsToTheme.add(descendant);
              }
            });
          }
        });
      } else if (mutation.type === 'attributes') {
        // Re-theme elements that had their style/class changed
        const target = mutation.target;
        if (target instanceof HTMLElement) {
          elementsToTheme.add(target);
        }
      }
    }

    // Apply theme to all collected elements
    elementsToTheme.forEach(element => {
      this.themeEngine.applyToElement(element);
    });

    // Clear pending mutations
    this.pendingMutations = [];
    this.isProcessing = false;
  }
}
