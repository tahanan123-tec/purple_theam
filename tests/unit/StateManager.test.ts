import { StateManager } from '../../src/StateManager';

// Mock chrome.storage.sync API
const mockStorageData: { [key: string]: any } = {};

const mockChromeStorageSync = {
  get: jest.fn((key: string, callback: (result: any) => void) => {
    const result = mockStorageData[key] ? { [key]: mockStorageData[key] } : {};
    callback(result);
  }),
  set: jest.fn((items: { [key: string]: any }, callback?: () => void) => {
    Object.assign(mockStorageData, items);
    if (callback) callback();
  })
};

const mockChromeStorageLocal = {
  get: jest.fn((key: string, callback: (result: any) => void) => {
    const result = mockStorageData[key] ? { [key]: mockStorageData[key] } : {};
    callback(result);
  }),
  set: jest.fn((items: { [key: string]: any }, callback?: () => void) => {
    Object.assign(mockStorageData, items);
    if (callback) callback();
  })
};

Object.defineProperty(window, 'chrome', {
  writable: true,
  value: {
    storage: {
      sync: mockChromeStorageSync,
      local: mockChromeStorageLocal
    },
    runtime: {
      lastError: undefined
    }
  }
});

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    // Clear mock storage before each test
    Object.keys(mockStorageData).forEach(key => delete mockStorageData[key]);
    
    // Reset mock call counts
    mockChromeStorageSync.get.mockClear();
    mockChromeStorageSync.set.mockClear();
    mockChromeStorageLocal.get.mockClear();
    mockChromeStorageLocal.set.mockClear();
    
    // Restore original mock implementations
    mockChromeStorageSync.get.mockImplementation((key: string, callback: (result: any) => void) => {
      const result = mockStorageData[key] ? { [key]: mockStorageData[key] } : {};
      callback(result);
    });
    
    mockChromeStorageSync.set.mockImplementation((items: { [key: string]: any }, callback?: () => void) => {
      Object.assign(mockStorageData, items);
      if (callback) callback();
    });
    
    mockChromeStorageLocal.get.mockImplementation((key: string, callback: (result: any) => void) => {
      const result = mockStorageData[key] ? { [key]: mockStorageData[key] } : {};
      callback(result);
    });
    
    mockChromeStorageLocal.set.mockImplementation((items: { [key: string]: any }, callback?: () => void) => {
      Object.assign(mockStorageData, items);
      if (callback) callback();
    });
    
    // Reset lastError
    chrome.runtime.lastError = undefined;
    
    stateManager = new StateManager();
  });

  describe('getState', () => {
    it('should return domain-specific state when it exists', async () => {
      // Setup storage with domain-specific state
      mockStorageData['themeState'] = {
        domainStates: {
          'example.com': true,
          'github.com': false
        },
        globalEnabled: false
      };

      const state = await stateManager.getState('example.com');
      expect(state).toBe(true);
    });

    it('should return global enabled state when domain-specific state does not exist', async () => {
      // Setup storage with only global state
      mockStorageData['themeState'] = {
        domainStates: {},
        globalEnabled: true
      };

      const state = await stateManager.getState('newdomain.com');
      expect(state).toBe(true);
    });

    it('should return default global enabled state when storage is empty', async () => {
      // Empty storage
      const state = await stateManager.getState('example.com');
      expect(state).toBe(true); // DEFAULT_GLOBAL_ENABLED is true
    });

    it('should retrieve state for different domains', async () => {
      mockStorageData['themeState'] = {
        domainStates: {
          'example.com': true,
          'github.com': false,
          'stackoverflow.com': true
        },
        globalEnabled: false
      };

      expect(await stateManager.getState('example.com')).toBe(true);
      expect(await stateManager.getState('github.com')).toBe(false);
      expect(await stateManager.getState('stackoverflow.com')).toBe(true);
    });

    it('should return default state on storage error', async () => {
      // Mock storage error
      chrome.runtime.lastError = { message: 'Storage error' };

      const state = await stateManager.getState('example.com');
      expect(state).toBe(true); // Should return DEFAULT_GLOBAL_ENABLED
    });
  });

  describe('setState', () => {
    it('should set domain-specific theme state', async () => {
      await stateManager.setState('example.com', true);

      expect(mockStorageData['themeState']).toBeDefined();
      expect(mockStorageData['themeState'].domainStates['example.com']).toBe(true);
    });

    it('should update existing domain state', async () => {
      mockStorageData['themeState'] = {
        domainStates: {
          'example.com': false
        },
        globalEnabled: true
      };

      await stateManager.setState('example.com', true);
      expect(mockStorageData['themeState'].domainStates['example.com']).toBe(true);
    });

    it('should preserve other domain states when setting one domain', async () => {
      mockStorageData['themeState'] = {
        domainStates: {
          'example.com': true,
          'github.com': false
        },
        globalEnabled: true
      };

      await stateManager.setState('stackoverflow.com', true);

      expect(mockStorageData['themeState'].domainStates['example.com']).toBe(true);
      expect(mockStorageData['themeState'].domainStates['github.com']).toBe(false);
      expect(mockStorageData['themeState'].domainStates['stackoverflow.com']).toBe(true);
    });

    it('should initialize storage if it does not exist', async () => {
      // Start with empty storage
      await stateManager.setState('example.com', true);

      expect(mockStorageData['themeState']).toBeDefined();
      expect(mockStorageData['themeState'].domainStates).toBeDefined();
      expect(mockStorageData['themeState'].globalEnabled).toBe(true);
    });

    it('should fall back to local storage on storage failure instead of throwing', async () => {
      // Mock storage set error
      mockChromeStorageSync.set.mockImplementationOnce(
        (_items: any, callback?: () => void) => {
          chrome.runtime.lastError = { message: 'Storage quota exceeded' };
          if (callback) callback();
        }
      );

      // Should not throw, but should fall back gracefully
      await expect(stateManager.setState('example.com', true)).resolves.not.toThrow();
      
      // Verify local storage was used as fallback
      expect(mockChromeStorageLocal.set).toHaveBeenCalled();
    });
  });

  describe('toggleState', () => {
    it('should toggle state from true to false', async () => {
      mockStorageData['themeState'] = {
        domainStates: {
          'example.com': true
        },
        globalEnabled: true
      };

      const newState = await stateManager.toggleState('example.com');

      expect(newState).toBe(false);
      expect(mockStorageData['themeState'].domainStates['example.com']).toBe(false);
    });

    it('should toggle state from false to true', async () => {
      mockStorageData['themeState'] = {
        domainStates: {
          'example.com': false
        },
        globalEnabled: true
      };

      const newState = await stateManager.toggleState('example.com');

      expect(newState).toBe(true);
      expect(mockStorageData['themeState'].domainStates['example.com']).toBe(true);
    });

    it('should toggle global state when domain state does not exist', async () => {
      mockStorageData['themeState'] = {
        domainStates: {},
        globalEnabled: true
      };

      // First toggle: should set domain state to false (opposite of global true)
      const newState = await stateManager.toggleState('newdomain.com');

      expect(newState).toBe(false);
      expect(mockStorageData['themeState'].domainStates['newdomain.com']).toBe(false);
    });

    it('should perform double toggle and return to original state', async () => {
      mockStorageData['themeState'] = {
        domainStates: {
          'example.com': true
        },
        globalEnabled: true
      };

      // First toggle
      let newState = await stateManager.toggleState('example.com');
      expect(newState).toBe(false);

      // Second toggle
      newState = await stateManager.toggleState('example.com');
      expect(newState).toBe(true);
    });

    it('should fall back to local storage on storage failure during toggle', async () => {
      mockStorageData['themeState'] = {
        domainStates: {
          'example.com': true
        },
        globalEnabled: true
      };

      // Mock storage set error
      mockChromeStorageSync.set.mockImplementationOnce(
        (_items: any, callback?: () => void) => {
          chrome.runtime.lastError = { message: 'Storage error' };
          if (callback) callback();
        }
      );

      // Should not throw, but should fall back gracefully
      await expect(stateManager.toggleState('example.com')).resolves.not.toThrow();
      
      // Verify local storage was used as fallback
      expect(mockChromeStorageLocal.set).toHaveBeenCalled();
    });
  });

  describe('getGlobalState', () => {
    it('should return global enabled state when it exists', async () => {
      mockStorageData['themeState'] = {
        domainStates: {},
        globalEnabled: false
      };

      const state = await stateManager.getGlobalState();
      expect(state).toBe(false);
    });

    it('should return default global enabled state when storage is empty', async () => {
      const state = await stateManager.getGlobalState();
      expect(state).toBe(true); // DEFAULT_GLOBAL_ENABLED
    });

    it('should return default state on storage error', async () => {
      chrome.runtime.lastError = { message: 'Storage error' };

      const state = await stateManager.getGlobalState();
      expect(state).toBe(true);
    });
  });

  describe('setGlobalState', () => {
    it('should set global enabled state', async () => {
      await stateManager.setGlobalState(false);

      expect(mockStorageData['themeState']).toBeDefined();
      expect(mockStorageData['themeState'].globalEnabled).toBe(false);
    });

    it('should preserve domain states when setting global state', async () => {
      mockStorageData['themeState'] = {
        domainStates: {
          'example.com': true,
          'github.com': false
        },
        globalEnabled: true
      };

      await stateManager.setGlobalState(false);

      expect(mockStorageData['themeState'].domainStates['example.com']).toBe(true);
      expect(mockStorageData['themeState'].domainStates['github.com']).toBe(false);
      expect(mockStorageData['themeState'].globalEnabled).toBe(false);
    });

    it('should initialize storage if it does not exist', async () => {
      await stateManager.setGlobalState(false);

      expect(mockStorageData['themeState']).toBeDefined();
      expect(mockStorageData['themeState'].globalEnabled).toBe(false);
    });

    it('should fall back to local storage on storage failure', async () => {
      mockChromeStorageSync.set.mockImplementationOnce(
        (_items: any, callback?: () => void) => {
          chrome.runtime.lastError = { message: 'Storage error' };
          if (callback) callback();
        }
      );

      // Should not throw, but should fall back gracefully
      await expect(stateManager.setGlobalState(false)).resolves.not.toThrow();
      
      // Verify local storage was used as fallback
      expect(mockChromeStorageLocal.set).toHaveBeenCalled();
    });
  });

  describe('Storage schema validation (Requirement 4.5)', () => {
    it('should use correct storage schema structure', async () => {
      await stateManager.setState('example.com', true);
      await stateManager.setGlobalState(true);

      const storedData = mockStorageData['themeState'];
      
      expect(storedData).toHaveProperty('domainStates');
      expect(storedData).toHaveProperty('globalEnabled');
      expect(typeof storedData.domainStates).toBe('object');
      expect(typeof storedData.globalEnabled).toBe('boolean');
    });

    it('should store domain states as object with domain keys', async () => {
      await stateManager.setState('example.com', true);
      await stateManager.setState('github.com', false);

      const storedData = mockStorageData['themeState'];
      
      expect('example.com' in storedData.domainStates).toBe(true);
      expect('github.com' in storedData.domainStates).toBe(true);
      expect(storedData.domainStates['example.com']).toBe(true);
      expect(storedData.domainStates['github.com']).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty domain string', async () => {
      await stateManager.setState('', true);
      const state = await stateManager.getState('');
      expect(state).toBe(true);
    });

    it('should handle special characters in domain names', async () => {
      const specialDomain = 'sub-domain.example.co.uk';
      await stateManager.setState(specialDomain, true);
      const state = await stateManager.getState(specialDomain);
      expect(state).toBe(true);
    });

    it('should handle rapid consecutive state changes', async () => {
      await stateManager.setState('example.com', true);
      await stateManager.setState('example.com', false);
      await stateManager.setState('example.com', true);

      const state = await stateManager.getState('example.com');
      expect(state).toBe(true);
    });

    it('should handle large number of domains', async () => {
      const domains = Array.from({ length: 100 }, (_, i) => `domain${i}.com`);
      
      for (let i = 0; i < domains.length; i++) {
        await stateManager.setState(domains[i], i % 2 === 0);
      }

      // Verify a few samples
      expect(await stateManager.getState('domain0.com')).toBe(true);
      expect(await stateManager.getState('domain1.com')).toBe(false);
      expect(await stateManager.getState('domain99.com')).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should maintain state across multiple operations', async () => {
      // Set up initial state
      await stateManager.setState('example.com', true);
      await stateManager.setState('github.com', false);
      await stateManager.setGlobalState(true);

      // Verify all states
      expect(await stateManager.getState('example.com')).toBe(true);
      expect(await stateManager.getState('github.com')).toBe(false);
      expect(await stateManager.getGlobalState()).toBe(true);

      // Toggle one domain
      await stateManager.toggleState('example.com');
      expect(await stateManager.getState('example.com')).toBe(false);

      // Other states should remain unchanged
      expect(await stateManager.getState('github.com')).toBe(false);
      expect(await stateManager.getGlobalState()).toBe(true);
    });

    it('should support typical user workflow', async () => {
      // User visits new domain - should use global default
      expect(await stateManager.getState('newsite.com')).toBe(true);

      // User toggles theme off for this domain
      await stateManager.toggleState('newsite.com');
      expect(await stateManager.getState('newsite.com')).toBe(false);

      // User visits another new domain - should use global default
      expect(await stateManager.getState('anothersite.com')).toBe(true);

      // User toggles theme on again for first domain
      await stateManager.toggleState('newsite.com');
      expect(await stateManager.getState('newsite.com')).toBe(true);
    });
  });

  describe('Storage fallback mechanisms (Requirement 4.5)', () => {
    it('should fall back to chrome.storage.local when sync quota is exceeded', async () => {
      // Mock quota exceeded error on sync storage
      mockChromeStorageSync.set.mockImplementationOnce(
        (_items: any, callback?: () => void) => {
          chrome.runtime.lastError = { message: 'QUOTA_BYTES quota exceeded' };
          if (callback) callback();
        }
      );

      // Try to set state - should fail on sync and succeed on local
      await stateManager.setState('example.com', true);

      // Verify that local storage was used
      expect(mockChromeStorageLocal.set).toHaveBeenCalled();
      
      // Verify state was persisted
      const state = await stateManager.getState('example.com');
      expect(state).toBe(true);
    });

    it('should fall back to in-memory storage when both chrome.storage.sync and local fail', async () => {
      // Mock failure on sync storage
      mockChromeStorageSync.set.mockImplementation(
        (_items: any, callback?: () => void) => {
          chrome.runtime.lastError = { message: 'Storage error' };
          if (callback) callback();
        }
      );

      // Mock failure on local storage
      mockChromeStorageLocal.set.mockImplementation(
        (_items: any, callback?: () => void) => {
          chrome.runtime.lastError = { message: 'Storage error' };
          if (callback) callback();
        }
      );

      // Set state - should fall back to memory
      await stateManager.setState('example.com', true);

      // Verify state is maintained in memory
      const state = await stateManager.getState('example.com');
      expect(state).toBe(true);
    });

    it('should handle quota exceeded during setState', async () => {
      // Mock quota exceeded error
      mockChromeStorageSync.set.mockImplementationOnce(
        (_items: any, callback?: () => void) => {
          chrome.runtime.lastError = { message: 'quota exceeded' };
          if (callback) callback();
        }
      );

      // Should not throw, but should fall back
      await expect(stateManager.setState('example.com', true)).resolves.not.toThrow();
      
      // Verify local storage was used as fallback
      expect(mockChromeStorageLocal.set).toHaveBeenCalled();
    });

    it('should handle QuotaExceededError', async () => {
      // Mock quota exceeded error with different message format
      mockChromeStorageSync.set.mockImplementationOnce(
        (_items: any, callback?: () => void) => {
          chrome.runtime.lastError = { message: 'QuotaExceededError: Quota exceeded' };
          if (callback) callback();
        }
      );

      await stateManager.setState('example.com', true);
      
      // Should fall back to local storage
      expect(mockChromeStorageLocal.set).toHaveBeenCalled();
    });

    it('should maintain state across fallback transitions', async () => {
      // Set initial state successfully on sync
      await stateManager.setState('site1.com', true);
      
      // Mock sync failure to trigger fallback
      mockChromeStorageSync.set.mockImplementation(
        (_items: any, callback?: () => void) => {
          chrome.runtime.lastError = { message: 'Storage error' };
          if (callback) callback();
        }
      );

      // Set another state - should fall back to local
      await stateManager.setState('site2.com', false);
      
      // Both states should be retrievable
      expect(await stateManager.getState('site1.com')).toBe(true);
      expect(await stateManager.getState('site2.com')).toBe(false);
    });

    it('should persist multiple domain states in memory fallback', async () => {
      // Mock both storage backends to fail
      mockChromeStorageSync.get.mockImplementation(
        (_key: any, callback: (result: any) => void) => {
          chrome.runtime.lastError = { message: 'Storage unavailable' };
          callback({});
        }
      );
      
      mockChromeStorageLocal.get.mockImplementation(
        (_key: any, callback: (result: any) => void) => {
          chrome.runtime.lastError = { message: 'Storage unavailable' };
          callback({});
        }
      );

      // Set multiple states - should use memory
      await stateManager.setState('domain1.com', true);
      await stateManager.setState('domain2.com', false);
      await stateManager.setState('domain3.com', true);

      // All states should be maintained in memory
      expect(await stateManager.getState('domain1.com')).toBe(true);
      expect(await stateManager.getState('domain2.com')).toBe(false);
      expect(await stateManager.getState('domain3.com')).toBe(true);
    });

    it('should handle toggle with storage fallback', async () => {
      // Create a fresh StateManager instance for this test
      const freshStateManager = new StateManager();
      
      // Reset mocks to clear any previous test implementations
      mockChromeStorageSync.set.mockClear();
      mockChromeStorageLocal.set.mockClear();
      
      // Set initial state
      mockStorageData['themeState'] = {
        domainStates: { 'example.com': true },
        globalEnabled: true
      };
      
      // Reset lastError
      chrome.runtime.lastError = undefined;

      // Mock sync storage.set to fail
      mockChromeStorageSync.set.mockImplementationOnce(
        (_items: any, callback?: () => void) => {
          chrome.runtime.lastError = { message: 'Storage error' };
          if (callback) callback();
        }
      );
      
      // Mock local storage.set to succeed
      mockChromeStorageLocal.set.mockImplementationOnce(
        (items: any, callback?: () => void) => {
          Object.assign(mockStorageData, items);
          chrome.runtime.lastError = undefined;
          if (callback) callback();
        }
      );

      // Toggle should work with fallback
      const newState = await freshStateManager.toggleState('example.com');
      expect(newState).toBe(false);
      
      // Verify local storage was used
      expect(mockChromeStorageLocal.set).toHaveBeenCalled();
    });

    it('should handle global state with storage fallback', async () => {
      // Create a fresh StateManager instance for this test
      const freshStateManager = new StateManager();
      
      // Reset mocks to clear any previous test implementations
      mockChromeStorageSync.set.mockClear();
      mockChromeStorageLocal.set.mockClear();
      
      // Reset lastError
      chrome.runtime.lastError = undefined;

      // Mock sync storage to fail
      mockChromeStorageSync.set.mockImplementationOnce(
        (_items: any, callback?: () => void) => {
          chrome.runtime.lastError = { message: 'QUOTA_BYTES exceeded' };
          if (callback) callback();
        }
      );
      
      // Mock local storage to succeed
      mockChromeStorageLocal.set.mockImplementationOnce(
        (items: any, callback?: () => void) => {
          Object.assign(mockStorageData, items);
          chrome.runtime.lastError = undefined;
          if (callback) callback();
        }
      );

      // Set global state - should fall back
      await freshStateManager.setGlobalState(false);
      
      // Verify local storage was used
      expect(mockChromeStorageLocal.set).toHaveBeenCalled();
      
      // Verify state is retrievable
      expect(await freshStateManager.getGlobalState()).toBe(false);
    });

    it('should log warnings when falling back to different storage backends', async () => {
      // Create a fresh StateManager instance for this test
      const freshStateManager = new StateManager();
      
      // Reset mocks
      mockChromeStorageSync.set.mockClear();
      mockChromeStorageLocal.set.mockClear();
      
      // Reset lastError
      chrome.runtime.lastError = undefined;
      
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Mock sync storage to fail with quota exceeded
      mockChromeStorageSync.set.mockImplementationOnce(
        (_items: any, callback?: () => void) => {
          chrome.runtime.lastError = { message: 'QUOTA_BYTES quota exceeded' };
          if (callback) callback();
        }
      );
      
      // Mock local storage to succeed
      mockChromeStorageLocal.set.mockImplementationOnce(
        (items: any, callback?: () => void) => {
          Object.assign(mockStorageData, items);
          chrome.runtime.lastError = undefined;
          if (callback) callback();
        }
      );

      await freshStateManager.setState('example.com', true);
      
      // Should log warning about quota exceeded fallback
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('quota exceeded')
      );

      consoleWarnSpy.mockRestore();
    });
  });
});
