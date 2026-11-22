"use strict";
// Content script entry point
// Initializes and coordinates all theme components
// Validates: Requirements 1.1, 1.4
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ThemeEngine_1 = require("./ThemeEngine");
const ContrastAdjuster_1 = require("./ContrastAdjuster");
const BackgroundManager_1 = require("./BackgroundManager");
const DOMObserver_1 = require("./DOMObserver");
const StateManager_1 = require("./StateManager");
/**
 * Main content script initialization
 * Coordinates all theme components and manages theme application
 */
class ContentScript {
    constructor() {
        this.isThemeActive = false;
        // Initialize all components
        this.themeEngine = new ThemeEngine_1.ThemeEngine();
        this.contrastAdjuster = new ContrastAdjuster_1.ContrastAdjuster();
        this.backgroundManager = new BackgroundManager_1.BackgroundManager();
        this.domObserver = new DOMObserver_1.DOMObserver(this.themeEngine);
        this.stateManager = new StateManager_1.StateManager();
    }
    /**
     * Initialize the content script
     * Waits for DOMContentLoaded before applying theme
     * Validates: Requirements 1.1, 1.4
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
            }
            else {
                // DOM is already ready
                yield this.onDOMReady();
            }
            // Set up message listener for background script communication
            this.setupMessageListener();
        });
    }
    /**
     * Called when DOM is ready
     * Checks theme state and applies if enabled
     */
    onDOMReady() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get current domain
                const domain = this.getCurrentDomain();
                // Check if theme should be active for this domain
                const shouldBeActive = yield this.stateManager.getState(domain);
                if (shouldBeActive) {
                    this.applyTheme();
                }
            }
            catch (error) {
                console.error('Sasuke Purple Theme: Error during initialization', error);
            }
        });
    }
    /**
     * Apply the purple theme to the page
     * Validates: Requirements 1.1
     */
    applyTheme() {
        if (this.isThemeActive) {
            return; // Already active
        }
        try {
            // Create and display Sasuke background
            this.backgroundManager.createBackgroundLayer();
            // Apply purple theme to all elements
            this.themeEngine.applyTheme();
            // Adjust contrast for readability
            this.adjustContrastForAllText();
            // Start observing DOM for dynamic content
            this.domObserver.start();
            this.isThemeActive = true;
            console.log('Sasuke Purple Theme: Theme applied successfully');
        }
        catch (error) {
            console.error('Sasuke Purple Theme: Error applying theme', error);
        }
    }
    /**
     * Remove the theme and restore original styling
     * Validates: Requirements 4.4
     */
    removeTheme() {
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
            this.isThemeActive = false;
            console.log('Sasuke Purple Theme: Theme removed successfully');
        }
        catch (error) {
            console.error('Sasuke Purple Theme: Error removing theme', error);
        }
    }
    /**
     * Toggle theme on/off for current domain
     * Validates: Requirements 4.2
     */
    toggleTheme() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const domain = this.getCurrentDomain();
                // Toggle state in storage
                const newState = yield this.stateManager.toggleState(domain);
                // Apply or remove theme based on new state
                if (newState) {
                    this.applyTheme();
                }
                else {
                    this.removeTheme();
                }
                // Send confirmation back to background script
                return;
            }
            catch (error) {
                console.error('Sasuke Purple Theme: Error toggling theme', error);
                throw error;
            }
        });
    }
    /**
     * Adjust contrast for all text elements on the page
     * Ensures WCAG AA compliance
     * Validates: Requirements 3.1
     */
    adjustContrastForAllText() {
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
    getCurrentDomain() {
        try {
            const hostname = window.location.hostname;
            // Remove www. prefix if present
            return hostname.replace(/^www\./, '');
        }
        catch (error) {
            console.error('Sasuke Purple Theme: Error getting domain', error);
            return 'unknown';
        }
    }
    /**
     * Set up message listener for background script communication
     * Validates: Requirements 4.2
     */
    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            var _a;
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
                const shouldBeActive = (_a = message.data) === null || _a === void 0 ? void 0 : _a.enabled;
                if (shouldBeActive && !this.isThemeActive) {
                    this.applyTheme();
                }
                else if (!shouldBeActive && this.isThemeActive) {
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
