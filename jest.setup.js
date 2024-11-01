const { TextEncoder, TextDecoder } = require('util');
const { JSDOM } = require('jsdom');

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = { userAgent: 'node.js' };
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Chrome Extension API base
global.chrome = {
  runtime: {
    getURL: jest.fn(path => `chrome-extension://mock-extension-id/${path}`),
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    }
  }
};

// Mock Constants for global access
global.Constants = {
  EXTENSION: {
    NAME: 'Terms Guardian',
    VERSION: '1.0.0',
    ICON_PATHS: {
      SMALL: 'images/icon16.png',
      MEDIUM: 'images/icon48.png',
      LARGE: 'images/icon128.png'
    }
  },
  DETECTION: {
    INTERVAL: 5000,
    THRESHOLDS: {
      AUTO_GRADE: 30,
      NOTIFY: 10,
      HIGHLIGHT: 20,
      SECTION: 10,
      PROXIMITY: 5
    }
  },
  ANALYSIS: {
    GRADES: {
      A: { MIN: 90, LABEL: 'Excellent' },
      B: { MIN: 80, LABEL: 'Good' },
      C: { MIN: 70, LABEL: 'Fair' },
      D: { MIN: 60, LABEL: 'Poor' },
      F: { MIN: 0, LABEL: 'Very Poor' }
    },
    PERFORMANCE_THRESHOLDS: {
      TEXT_PROCESSING: 100,
      API_CALL: 2000,
      GRADE_CALCULATION: 50
    }
  },
  DEBUG: {
    LEVELS: {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      TRACE: 4
    },
    STORAGE: {
      KEY: 'debugLogs',
      MAX_ENTRIES: 1000,
      EXPORT_FORMAT: 'json'
    }
  }
};