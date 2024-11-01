// Import Jest's globals
require('@jest/globals');

// Extend Chrome API mock from jest.setup.js
global.chrome = {
  ...global.chrome,  // Preserve any existing chrome mock properties
  tabs: {
    query: jest.fn().mockResolvedValue([{ 
      id: 1, 
      active: true, 
      currentWindow: true 
    }]),
    sendMessage: jest.fn()
  },
  runtime: {
    ...global.chrome?.runtime,
    getManifest: jest.fn().mockReturnValue({
      version: '1.0.0',
      name: 'Terms Guardian'
    })
  },
  storage: {
    local: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined)
    }
  }
};

// Set up test utilities
global.testUtils = {
  // Helper to create mock dictionary entries
  createMockDictionary: (terms) => {
    return terms.reduce((dict, { term, definition, source }) => {
      dict[term.toLowerCase()] = { definition, source };
      return dict;
    }, {});
  }
};

// Clean up between tests
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});