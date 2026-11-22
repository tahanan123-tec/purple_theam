// BackgroundManager class - Sasuke background image layer management
// Validates: Requirements 2.1, 2.4, 2.5

export class BackgroundManager {
  constructor() {
    this.backgroundLayer = null;
    this.BACKGROUND_LAYER_ID = 'sasuke-purple-theme-background';
    this.SASUKE_IMAGE_URL = chrome.runtime.getURL('icons/sasuke-shadow.png');
  }

  /**
   * Create and inject the fixed-position background layer with Sasuke image
   * Requirements: 2.1, 2.4, 2.5
   */
  createBackgroundLayer() {
    // Prevent duplicate background layers
    if (this.backgroundLayer && document.body.contains(this.backgroundLayer)) {
      return;
    }

    // Remove any existing background layer (cleanup from previous calls)
    this.removeBackgroundLayer();

    // Create the background layer div
    const layer = document.createElement('div');
    layer.id = this.BACKGROUND_LAYER_ID;
    
    // Apply styles for fixed positioning and background image
    layer.style.position = 'fixed';
    layer.style.top = '0';
    layer.style.left = '0';
    layer.style.width = '100vw';
    layer.style.height = '100vh';
    layer.style.zIndex = '-1'; // Behind all content (Requirement 2.5)
    layer.style.pointerEvents = 'none'; // Prevent interaction blocking
    layer.style.backgroundImage = `url('${this.SASUKE_IMAGE_URL}')`;
    layer.style.backgroundSize = 'cover'; // Cover entire viewport
    layer.style.backgroundPosition = 'center';
    layer.style.backgroundRepeat = 'no-repeat';
    layer.style.backgroundAttachment = 'fixed'; // Fixed during scroll (Requirement 2.4)

    // Insert the layer at the beginning of body
    if (document.body) {
      document.body.insertBefore(layer, document.body.firstChild);
      this.backgroundLayer = layer;
    }
  }

  /**
   * Remove the background layer from the DOM
   * Requirement: 4.4 (theme removal)
   */
  removeBackgroundLayer() {
    if (this.backgroundLayer && this.backgroundLayer.parentNode) {
      this.backgroundLayer.parentNode.removeChild(this.backgroundLayer);
    }
    
    // Also check for any orphaned layers by ID
    const existingLayer = document.getElementById(this.BACKGROUND_LAYER_ID);
    if (existingLayer && existingLayer.parentNode) {
      existingLayer.parentNode.removeChild(existingLayer);
    }
    
    this.backgroundLayer = null;
  }

  /**
   * Update background position (for future enhancements)
   * Currently the background is fixed, but this method allows for dynamic positioning
   */
  updatePosition() {
    if (this.backgroundLayer) {
      // Re-apply fixed positioning to ensure it stays consistent
      this.backgroundLayer.style.position = 'fixed';
      this.backgroundLayer.style.backgroundAttachment = 'fixed';
    }
  }
}
