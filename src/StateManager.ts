// StateManager class - Theme state persistence and management
// Manages theme state using chrome.storage.sync for cross-device synchronization

/**
 * Storage schema:
 * {
 *   domainStates: {
 *     "example.com": true,
 *     "github.com": false
 *   },
 *   globalEnabled: true
 * }
 */

interface StorageData {
  domainStates: { [domain: string]: boolean };
  globalEnabled: boolean;
}

export class StateManager {
  private static readonly STORAGE_KEY = 'themeState';
  private static readonly DEFAULT_GLOBAL_ENABLED = true;
  
  // In-memory fallback storage when chrome.storage is unavailable
  private inMemoryStorage: StorageData = {
    domainStates: {},
    globalEnabled: StateManager.DEFAULT_GLOBAL_ENABLED
  };
  
  // Track which storage backend we're using
  private storageBackend: 'sync' | 'local' | 'memory' = 'sync';

  /**
   * Get theme state for a specific domain
   * @param domain - The domain to check (e.g., "example.com")
   * @returns Promise resolving to true if theme is enabled for the domain, false otherwise
   */
  async getState(domain: string): Promise<boolean> {
    try {
      const data = await this.getStorageData();
      
      // Check if domain has a specific state set
      if (domain in data.domainStates) {
        return data.domainStates[domain];
      }
      
      // Fall back to global enabled state
      return data.globalEnabled;
    } catch (error) {
      console.error('StateManager: Error getting state for domain', domain, error);
      // Default to enabled on error
      return StateManager.DEFAULT_GLOBAL_ENABLED;
    }
  }

  /**
   * Set theme state for a specific domain
   * @param domain - The domain to set state for
   * @param enabled - Whether the theme should be enabled
   */
  async setState(domain: string, enabled: boolean): Promise<void> {
    try {
      const data = await this.getStorageData();
      
      // Update domain-specific state
      data.domainStates[domain] = enabled;
      
      // Save back to storage
      await this.setStorageData(data);
    } catch (error) {
      console.error('StateManager: Error setting state for domain', domain, error);
      throw error;
    }
  }

  /**
   * Toggle theme state for a specific domain
   * Inverts the current state (on -> off, off -> on)
   * @param domain - The domain to toggle state for
   * @returns Promise resolving to the new state after toggling
   */
  async toggleState(domain: string): Promise<boolean> {
    try {
      const currentState = await this.getState(domain);
      const newState = !currentState;
      await this.setState(domain, newState);
      return newState;
    } catch (error) {
      console.error('StateManager: Error toggling state for domain', domain, error);
      throw error;
    }
  }

  /**
   * Get the global enabled state
   * @returns Promise resolving to the global theme enabled state
   */
  async getGlobalState(): Promise<boolean> {
    try {
      const data = await this.getStorageData();
      return data.globalEnabled;
    } catch (error) {
      console.error('StateManager: Error getting global state', error);
      return StateManager.DEFAULT_GLOBAL_ENABLED;
    }
  }

  /**
   * Set the global enabled state
   * @param enabled - Whether theme should be globally enabled
   */
  async setGlobalState(enabled: boolean): Promise<void> {
    try {
      const data = await this.getStorageData();
      data.globalEnabled = enabled;
      await this.setStorageData(data);
    } catch (error) {
      console.error('StateManager: Error setting global state', error);
      throw error;
    }
  }

  /**
   * Get all storage data with defaults if not present
   * Implements fallback hierarchy: sync -> local -> memory
   * @private
   */
  private async getStorageData(): Promise<StorageData> {
    // Try chrome.storage.sync first
    if (this.storageBackend === 'sync') {
      try {
        return await this.getFromChromeStorage('sync');
      } catch (error) {
        console.warn('StateManager: chrome.storage.sync failed, falling back to local', error);
        this.storageBackend = 'local';
      }
    }
    
    // Fall back to chrome.storage.local
    if (this.storageBackend === 'local') {
      try {
        return await this.getFromChromeStorage('local');
      } catch (error) {
        console.warn('StateManager: chrome.storage.local failed, falling back to memory', error);
        this.storageBackend = 'memory';
      }
    }
    
    // Final fallback: in-memory storage
    return this.inMemoryStorage;
  }
  
  /**
   * Get data from chrome.storage (sync or local)
   * @private
   */
  private async getFromChromeStorage(type: 'sync' | 'local'): Promise<StorageData> {
    return new Promise((resolve, reject) => {
      try {
        const storage = type === 'sync' ? chrome.storage.sync : chrome.storage.local;
        
        storage.get(StateManager.STORAGE_KEY, (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }

          const data: StorageData = result[StateManager.STORAGE_KEY] || {
            domainStates: {},
            globalEnabled: StateManager.DEFAULT_GLOBAL_ENABLED
          };

          resolve(data);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Save storage data to chrome.storage with fallback hierarchy
   * Implements fallback: sync -> local -> memory
   * @private
   */
  private async setStorageData(data: StorageData): Promise<void> {
    // Try chrome.storage.sync first
    if (this.storageBackend === 'sync') {
      try {
        await this.setToChromeStorage('sync', data);
        return;
      } catch (error: any) {
        // Check if it's a quota exceeded error
        if (this.isQuotaExceededError(error)) {
          console.warn('StateManager: chrome.storage.sync quota exceeded, falling back to local');
          this.storageBackend = 'local';
        } else {
          console.warn('StateManager: chrome.storage.sync failed, falling back to local', error);
          this.storageBackend = 'local';
        }
      }
    }
    
    // Fall back to chrome.storage.local
    if (this.storageBackend === 'local') {
      try {
        await this.setToChromeStorage('local', data);
        return;
      } catch (error) {
        console.warn('StateManager: chrome.storage.local failed, falling back to memory', error);
        this.storageBackend = 'memory';
      }
    }
    
    // Final fallback: in-memory storage
    this.inMemoryStorage = data;
  }
  
  /**
   * Set data to chrome.storage (sync or local)
   * @private
   */
  private async setToChromeStorage(type: 'sync' | 'local', data: StorageData): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const storage = type === 'sync' ? chrome.storage.sync : chrome.storage.local;
        
        storage.set(
          { [StateManager.STORAGE_KEY]: data },
          () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
              return;
            }
            resolve();
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Check if an error is a quota exceeded error
   * @private
   */
  private isQuotaExceededError(error: any): boolean {
    const message = error?.message || '';
    return message.includes('QUOTA_BYTES') || 
           message.includes('quota exceeded') || 
           message.includes('QuotaExceededError');
  }
}
