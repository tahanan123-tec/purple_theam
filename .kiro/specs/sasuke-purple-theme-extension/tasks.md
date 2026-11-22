# Implementation Plan: Sasuke Purple Theme Extension

## Overview

This plan implements a Chrome Extension (Manifest V3) that transforms webpages into a purple-themed interface with a Sasuke Uchiha background image. The implementation follows a layered architecture with a background service worker for state management, content scripts for DOM manipulation, and a popup UI for user control.

The approach prioritizes core functionality first (theme engine, background layer), then adds robustness (contrast adjustment, dynamic content handling), and finally integrates everything with state management and user controls.

## Tasks

- [x] 1. Set up Chrome Extension project structure
  - Create manifest.json with Manifest V3 configuration
  - Define permissions: "activeTab", "storage", "scripting"
  - Specify content_scripts configuration for injection
  - Create directory structure: src/, icons/, tests/
  - Set up package.json with dependencies: fast-check, jest, @types/chrome
  - Configure TypeScript with tsconfig.json
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 2. Create extension icons and assets
  - Create 16x16, 48x48, 128x128 pixel icon files
  - Create Sasuke shadow image (SVG or PNG with transparency)
  - Ensure Sharingan and Rinnegan eyes are visible in background image
  - Add active/inactive state icons for browser action
  - _Requirements: 5.4, 2.1, 2.2, 2.3_

- [x] 3. Implement Theme Engine core functionality
  - [x] 3.1 Create ThemeEngine class with color conversion logic
    - Implement getPurpleShade() method to convert colors based on lightness
    - Define purple color palette (6 background shades, 6 foreground shades)
    - Implement color lightness extraction from RGB/HSL values
    - _Requirements: 1.2, 1.3_
  
  - [ ]* 3.2 Write property test for color conversion
    - **Property 1: Color Conversion to Purple**
    - **Validates: Requirements 1.2, 1.3**
  
  - [x] 3.3 Implement applyToElement() method
    - Extract computed styles from element
    - Apply purple transformations to background-color and color properties
    - Store original styles in data attributes for reversal
    - Preserve layout properties (position, width, height, margin, padding)
    - _Requirements: 1.2, 1.3, 1.5_
  
  - [ ]* 3.4 Write property test for layout preservation
    - **Property 2: Layout Preservation**
    - **Validates: Requirements 1.5**
  
  - [x] 3.5 Implement applyTheme() and removeTheme() methods
    - Walk through DOM tree and apply theme to all elements
    - Implement theme removal by restoring original styles from data attributes
    - _Requirements: 1.1, 4.4_
  
  - [ ]* 3.6 Write property test for theme removal restoration
    - **Property 9: Theme Removal Restoration**
    - **Validates: Requirements 4.4**

- [x] 4. Implement Contrast Adjuster for readability
  - [x] 4.1 Create ContrastAdjuster class with contrast calculation
    - Implement calculateContrast() using WCAG relative luminance formula
    - Implement meetsWCAG_AA() to check 4.5:1 ratio for normal text, 3:1 for large text
    - _Requirements: 3.1_
  
  - [x] 4.2 Implement text color adjustment algorithm
    - Implement adjustTextColor() to progressively lighten/darken text
    - Implement enhanceReadability() to apply text shadows or semi-transparent backgrounds
    - Handle edge cases where color adjustment alone is insufficient
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 4.3 Write property test for WCAG AA contrast compliance
    - **Property 5: WCAG AA Contrast Compliance**
    - **Validates: Requirements 3.1**
  
  - [x] 4.4 Implement link distinguishability
    - Ensure link elements have distinct styling (color, text-decoration)
    - Apply different purple shades for links vs regular text
    - _Requirements: 3.5_
  
  - [ ]* 4.5 Write property test for link distinguishability
    - **Property 6: Link Distinguishability**
    - **Validates: Requirements 3.5**

- [x] 5. Checkpoint - Verify core theme application works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Background Manager
  - [x] 6.1 Create BackgroundManager class
    - Implement createBackgroundLayer() to create fixed-position div
    - Set z-index: -1 for background layer
    - Apply Sasuke image with background-size: cover
    - Set background-attachment: fixed for scroll persistence
    - Set pointer-events: none to prevent interaction blocking
    - _Requirements: 2.1, 2.4, 2.5_
  
  - [ ]* 6.2 Write property test for fixed background positioning
    - **Property 3: Fixed Background Positioning**
    - **Validates: Requirements 2.4**
  
  - [ ]* 6.3 Write property test for z-index ordering
    - **Property 4: Z-Index Ordering**
    - **Validates: Requirements 2.5**
  
  - [x] 6.4 Implement removeBackgroundLayer() method
    - Remove background layer from DOM
    - _Requirements: 4.4_

- [x] 7. Implement DOM Observer for dynamic content
  - [x] 7.1 Create DOMObserver class with MutationObserver
    - Implement start() to begin observing childList, subtree, and attributes
    - Implement throttling to batch process mutations every 200ms
    - Filter out mutations from theme engine itself
    - _Requirements: 6.4, 6.5_
  
  - [x] 7.2 Implement onMutation() callback
    - Apply theme to newly added elements
    - Trigger contrast adjustment for new text elements
    - _Requirements: 6.4, 6.5_
  
  - [ ]* 7.3 Write property test for dynamic content styling
    - **Property 11: Dynamic Content Styling**
    - **Validates: Requirements 6.4, 6.5**

- [x] 8. Implement State Manager
  - [x] 8.1 Create StateManager class with chrome.storage.sync integration
    - Implement getState() to retrieve domain-specific theme state
    - Implement setState() to persist theme state for domain
    - Implement toggleState() to invert current state
    - Define storage schema: { domainStates: {}, globalEnabled: true }
    - _Requirements: 4.5_
  
  - [ ]* 8.2 Write property test for state persistence
    - **Property 10: State Persistence Round-Trip**
    - **Validates: Requirements 4.5**
  
  - [ ]* 8.3 Write property test for toggle inversion
    - **Property 7: Toggle Inversion**
    - **Validates: Requirements 4.2**
  
  - [x] 8.4 Implement error handling for storage
    - Add fallback to chrome.storage.local on quota exceeded
    - Add in-memory state fallback if storage unavailable
    - _Requirements: 4.5_

- [x] 9. Checkpoint - Verify state management and dynamic content work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement content script main file
  - [ ] 10.1 Create content.js/content.ts entry point
    - Initialize ThemeEngine, ContrastAdjuster, BackgroundManager, DOMObserver
    - Wait for DOMContentLoaded before applying theme
    - Check theme state from StateManager and apply if enabled
    - Set up message listener for background script communication
    - _Requirements: 1.1, 1.4_
  
  - [-] 10.2 Implement error handling for content script
    - Add validation for document structure (html, body elements exist)
    - Add retry logic with exponential backoff (up to 3 attempts)
    - Add CSP fallback: use injected stylesheet if inline styles blocked
    - _Requirements: 6.1, 6.3_

- [ ] 11. Implement background service worker
  - [ ] 11.1 Create background.js with service worker setup
    - Initialize StateManager
    - Set up browser action button click handler
    - Implement message passing to content scripts
    - Handle theme toggle messages from popup
    - _Requirements: 4.1, 4.2_
  
  - [ ] 11.2 Implement icon state updates
    - Update browser action icon based on theme state (active/inactive)
    - Add badge text or icon swap to indicate current state
    - _Requirements: 4.3_
  
  - [ ]* 11.3 Write property test for icon state reflection
    - **Property 8: Icon State Reflection**
    - **Validates: Requirements 4.3**
  
  - [ ] 11.4 Implement message retry and timeout handling
    - Add exponential backoff for message retries (max 3 attempts)
    - Add 5-second timeout for message responses
    - Handle service worker suspension gracefully
    - _Requirements: 6.1_

- [ ] 12. Implement popup UI
  - [ ] 12.1 Create popup.html with toggle interface
    - Add toggle button with visual feedback
    - Display current theme state (on/off)
    - Add minimal styling for popup appearance
    - _Requirements: 4.1_
  
  - [ ] 12.2 Create popup.js for user interaction
    - Send toggle message to background script on button click
    - Update popup UI based on current state from background
    - _Requirements: 4.2_

- [ ] 13. Integration and wiring
  - [ ] 13.1 Wire all components together in content script
    - Connect DOMObserver to ThemeEngine
    - Connect ThemeEngine to ContrastAdjuster
    - Connect content script to BackgroundManager
    - Ensure message passing works between all components
    - _Requirements: 1.1, 4.2_
  
  - [ ] 13.2 Test extension loading and activation
    - Load extension in Chrome with chrome://extensions/
    - Test theme application on HTTP and HTTPS pages
    - Verify background image displays correctly
    - Test toggle functionality from popup and browser action
    - _Requirements: 5.5, 6.2_
  
  - [ ]* 13.3 Write unit tests for manifest validation
    - Test manifest.json is valid JSON
    - Test Manifest V3 required fields present
    - Test icon files exist at specified paths
    - _Requirements: 5.1, 5.4_
  
  - [ ]* 13.4 Write integration tests for protected pages
    - Test that extension skips chrome:// and chrome-extension:// URLs
    - Test browser action button is disabled on protected pages
    - _Requirements: 6.1_

- [ ] 14. Performance optimization
  - [ ] 14.1 Optimize theme application performance
    - Batch DOM style updates to minimize reflows
    - Use CSS class injection instead of inline styles where possible
    - Ensure theme applies within 500ms requirement
    - _Requirements: 1.1, 6.1_
  
  - [ ] 14.2 Add performance monitoring
    - Log memory usage to verify <50MB per tab constraint
    - Add timing logs for theme application duration
    - _Requirements: 6.6_

- [ ] 15. Final checkpoint and manual testing
  - Ensure all tests pass, ask the user if questions arise.
  - Verify Sasuke image displays correctly with visible eyes
  - Test text readability on real websites (GitHub, Wikipedia, Reddit, Twitter, News sites)
  - Verify background image blends aesthetically with purple theme
  - Verify smooth scrolling performance
  - Verify no visual glitches during page load

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with minimum 100 iterations
- Unit tests use Jest with Chrome extension mocking
- All 11 correctness properties from the design are covered by property tests
- Checkpoints ensure incremental validation throughout implementation
- TypeScript is used for type safety and better IDE support
- Manual testing is required for visual validation due to aesthetic nature of extension
