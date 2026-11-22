// Content script entry point
// Initializes and coordinates all theme components
// Validates: Requirements 1.1, 1.4

import { ThemeEngine } from './ThemeEngine';
import { ContrastAdjuster } from './ContrastAdjuster';
import { BackgroundManager } from './BackgroundManager';
import { DOMObserver } from './DOMObserver';
import { StateManager } from './StateManager';

/**
 * Main content script initialization
 * Coordinates all theme components and manages theme application
 */
class ContentScript {
  private themeEngine: ThemeEngine;
  private contrastAdjuster: ContrastAdjuster;
  private backgroundManager: BackgroundManager;
  private domObserver: DOMObserver;
  private stateManager: StateManager;
  private isThemeActive: boolean = false;
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY = 100; // ms

  constructor() {
    // Initialize all components
    this.themeEngine = new ThemeEngine();
    this.contrastAdjuster = new ContrastAdjuster();
    this.backgroundManager = new BackgroundManager();
    this.domObserver = new DOMObserver(this.themeEngine);
    this.stateManager = new StateManager();
  }

  /**
   * Initialize the content script
   * Waits for DOMContentLoaded before applying theme
   * Validates: Requirements 1.1, 1.4
   */
  async init(): Promise<void> {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
    } else {
      // DOM is already ready
      await this.onDOMReady();
    }

    // Set up message listener for background script communication
    this.setupMessageListener();
  }

  /**
   * Called when DOM is ready
   * Checks theme state and applies if enabled
   * Validates: Requirements 6.1, 6.3
   */
  private async onDOMReady(): Promise<void> {
    try {
      // Validate document structure before proceeding
      if (!this.validateDocumentStructure()) {
        console.warn('Sasuke Purple Theme: Invalid document structure, will retry');
        await this.retryWithBackoff(async () => {
          if (!this.validateDocumentStructure()) {
            throw new Error('Document structure validation failed');
          }
        });
      }
      
      // Get current domain
      const domain = this.getCurrentDomain();
      
      // Check if theme should be active for this domain
      const shouldBeActive = await this.stateManager.getState(domain);
      
      if (shouldBeActive) {
        await this.applyThemeWithRetry();
      }
    } catch (error) {
      console.error('Sasuke Purple Theme: Error during initialization', error);
    }
  }

  /**
   * Validate that essential document elements exist
   * Validates: Requirements 6.1
   * @returns true if document structure is valid
   */
  private validateDocumentStructure(): boolean {
    // Check for html element
    if (!document.documentElement) {
      console.warn('Sasuke Purple Theme: document.documentElement is missing');
      return false;
    }

    // Check for body element
    if (!document.body) {
      console.warn('Sasuke Purple Theme: document.body is missing');
      return false;
    }

    return true;
  }

  /**
   * Retry an operation with exponential backoff
   * Validates: Requirements 6.1
   * @param operation The async operation to retry
   * @param maxRetries Maximum number of retry attempts (default: 3)
   * @returns Promise that resolves when operation succeeds
   */
  private async retryWithBackoff(
    operation: () => Promise<void>,
    maxRetries: number = this.MAX_RETRIES
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await operation();
        return; // Success
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries - 1) {
          // Calculate exponential backoff delay: 100ms, 200ms, 400ms, etc.
          const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          console.warn(`Sasuke Purple Theme: Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted
    throw lastError || new Error('Operation failed after retries');
  }

  /**
   * Sleep for specified milliseconds
   * @param ms Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Apply theme with retry logic
   * Validates: Requirements 6.1
   */
  private async applyThemeWithRetry(): Promise<void> {
    await this.retryWithBackoff(async () => {
      // Validate structure before each attempt
      if (!this.validateDocumentStructure()) {
        throw new Error('Document structure not ready');
      }
      
      this.applyTheme();
    });
  }

  /**
   * Apply the purple theme to the page
   * Validates: Requirements 1.1, 6.3
   */
  private applyTheme(): void {
    if (this.isThemeActive) {
      return; // Already active
    }

    try {
      // Create and display Sasuke background
      this.backgroundManager.createBackgroundLayer();
      
      // Apply purple theme to all elements with CSP fallback
      try {
        this.themeEngine.applyTheme();
      } catch (cspError) {
        // If inline styles are blocked by CSP, fall back to injected stylesheet
        console.warn('Sasuke Purple Theme: Inline styles blocked, using stylesheet fallback', cspError);
        this.applyThemeViaStylesheet();
      }
      
      // Adjust contrast for readability
      this.adjustContrastForAllText();
      
      // Start observing DOM for dynamic content
      this.domObserver.start();
      
      this.isThemeActive = true;
      console.log('Sasuke Purple Theme: Theme applied successfully');
    } catch (error) {
      console.error('Sasuke Purple Theme: Error applying theme', error);
    }
  }

  /**
   * CSP fallback: Apply theme via injected stylesheet instead of inline styles
   * Validates: Requirements 6.3
   */
  private applyThemeViaStylesheet(): void {
    // Check if stylesheet already exists
    let stylesheet = document.getElementById('sasuke-purple-theme-stylesheet') as HTMLStyleElement | null;
    
    if (!stylesheet) {
      // Create style element
      stylesheet = document.createElement('style');
      stylesheet.id = 'sasuke-purple-theme-stylesheet';
      stylesheet.type = 'text/css';
      
      // Define CSS rules for purple theme
      const css = `
        /* Purple theme background transformations */
        body { background-color: #2d0052 !important; }
        div, section, article, aside, nav, header, footer, main {
          background-color: #400070 !important;
        }
        
        /* Purple theme text transformations */
        body, p, span, div, h1, h2, h3, h4, h5, h6, li, td, th, label {
          color: #c280ff !important;
        }
        
        /* Link styling for distinguishability */
        a {
          color: #e0b3ff !important;
          text-decoration: underline !important;
        }
        
        /* Buttons and form elements */
        button, input, textarea, select {
          background-color: #53008f !important;
          color: #f0d9ff !important;
          border-color: #8b00e0 !important;
        }
      `;
      
      stylesheet.textContent = css;
      
      // Try to inject into document head
      try {
        if (document.head) {
          document.head.appendChild(stylesheet);
        } else {
          // If head doesn't exist yet, append to documentElement
          document.documentElement.appendChild(stylesheet);
        }
      } catch (error) {
        console.error('Sasuke Purple Theme: Failed to inject stylesheet', error);
        throw error;
      }
    }
  }

  /**
   * Remove the theme and restore original styling
   * Validates: Requirements 4.4, 6.3
   */
  private removeTheme(): void {
    if (!this.isThemeActive) {
      return; // Already inactive
    }

    try {
      // Stop observing DOM changes
      this.domObserver.stop();
      
      // Remove Sasuke background
      this.backgroundManager.removeBackgroundLayer();
      
      // Remove theme styling
      this.themeEngine.removeTheme();
      
      // Remove injected stylesheet if it exists (CSP fallback)
      const stylesheet = document.getElementById('sasuke-purple-theme-stylesheet');
      if (stylesheet) {
        stylesheet.remove();
      }
      
      this.isThemeActive = false;
      console.log('Sasuke Purple Theme: Theme removed successfully');
    } catch (error) {
      console.error('Sasuke Purple Theme: Error removing theme', error);
    }
  }

  /**
   * Toggle theme on/off for current domain
   * Validates: Requirements 4.2
   */
  private async toggleTheme(): Promise<void> {
    try {
      const domain = this.getCurrentDomain();
      
      // Toggle state in storage
      const newState = await this.stateManager.toggleState(domain);
      
      // Apply or remove theme based on new state
      if (newState) {
        this.applyTheme();
      } else {
        this.removeTheme();
      }
      
      // Send confirmation back to background script
      return;
    } catch (error) {
      console.error('Sasuke Purple Theme: Error toggling theme', error);
      throw error;
    }
  }

  /**
   * Adjust contrast for all text elements on the page
   * Ensures WCAG AA compliance
   * Validates: Requirements 3.1
   */
  private adjustContrastForAllText(): void {
    // Find all text-containing elements
    const textElements = document.querySelectorAll('p, span, a, h1, h2, h3, h4, h5, h6, li, td, th, div, label, button');
    
    textElements.forEach(element => {
      if (element instanceof HTMLElement) {
        // Check if element has visible text content
        const hasText = element.textContent && element.textContent.trim().length > 0;
        
        if (hasText) {
          // Get font size and weight to determine if it's large text
          const computedStyle = window.getComputedStyle(element);
          const fontSize = parseInt(computedStyle.fontSize);
          const fontWeight = parseInt(computedStyle.fontWeight) || 400;
          
          // Large text: 18pt (24px) or 14pt (18.66px) bold
          const isLargeText = fontSize >= 24 || (fontSize >= 19 && fontWeight >= 700);
          const minRatio = isLargeText ? 3.0 : 4.5;
          
          // Adjust text color if needed
          this.contrastAdjuster.adjustTextColor(element, minRatio);
        }
      }
    });
  }

  /**
   * Get current domain from URL
   * @returns Domain string (e.g., "example.com")
   */
  private getCurrentDomain(): string {
    try {
      const hostname = window.location.hostname;
      // Remove www. prefix if present
      return hostname.replace(/^www\./, '');
    } catch (error) {
      console.error('Sasuke Purple Theme: Error getting domain', error);
      return 'unknown';
    }
  }

  /**
   * Set up message listener for background script communication
   * Validates: Requirements 4.2
   */
  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // Handle toggle message from background script
      if (message.action === 'toggle') {
        this.toggleTheme()
          .then(() => {
            sendResponse({ success: true, isActive: this.isThemeActive });
          })
          .catch((error) => {
            sendResponse({ success: false, error: error.message });
          });
        
        // Return true to indicate we'll send response asynchronously
        return true;
      }
      
      // Handle getState message
      if (message.action === 'getState') {
        sendResponse({ isActive: this.isThemeActive });
        return false;
      }
      
      // Handle setState message
      if (message.action === 'setState') {
        const shouldBeActive = message.data?.enabled;
        
        if (shouldBeActive && !this.isThemeActive) {
          this.applyTheme();
        } else if (!shouldBeActive && this.isThemeActive) {
          this.removeTheme();
        }
        
        sendResponse({ success: true, isActive: this.isThemeActive });
        return false;
      }
      
      return false;
    });
  }
}

// Initialize content script when module loads
const contentScript = new ContentScript();
contentScript.init().catch(error => {
  console.error('Sasuke Purple Theme: Fatal error during initialization', error);
});
