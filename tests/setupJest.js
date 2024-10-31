// Set up TextEncoder/TextDecoder first
const { TextEncoder, TextDecoder } = require('node:util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Then set up JSDOM
const { JSDOM } = require('jsdom');
const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;

global.window = window;
global.document = window.document;

global.fetch = jest.fn();

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

const Constants = {
  ANALYSIS: {
    GRADES: {
      A: { MIN: 90, LABEL: 'Excellent' },
      B: { MIN: 80, LABEL: 'Good' },
      C: { MIN: 70, LABEL: 'Fair' },
      D: { MIN: 60, LABEL: 'Poor' },
      F: { MIN: 0, LABEL: 'Very Poor' }
    },
    CHUNK_SIZE: 500,
    MIN_WORD_LENGTH: 3,
    MAX_RETRIES: 3,
    CACHE_DURATION: 86400000,
    PERFORMANCE_THRESHOLDS: {
      TEXT_PROCESSING: 100,
      API_CALL: 2000,
      GRADE_CALCULATION: 50,
      RIGHTS_ANALYSIS: 150,
      EXTRACTION: 200
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
  CLASSES: {
    HIGHLIGHT: 'legal-term-highlight',
    SECTION: 'legal-text-section',
    IMPORTANT: 'important-term'
  },
  MESSAGES: {
    AUTO_GRADE: "Terms Guardian has detected a legal document...",
    ERROR: {
      GENERAL: "An unexpected error occurred"
    }
  },
  SELECTORS: {
    LEGAL_SECTIONS: ['main', 'article', 'section'],
    EXCLUDE_ELEMENTS: ['nav', 'header', 'footer', 'script']
  }
};

global.Constants = Constants;

global.chrome = {
  runtime: {
    getURL: (path) => `mock:///${path}`,
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    }
  },
  storage: {
    local: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined)
    }
  },
  tabs: {
    query: jest.fn().mockResolvedValue([{ id: 1, active: true }]),
    sendMessage: jest.fn()
  },
  notifications: {
    create: jest.fn()
  }
};
// Add this to your existing setup
const mockDictionaries = {
  blacksLaw: {
    'contract': 'A legal agreement between parties',
    'agreement': 'A mutual understanding between parties'
  },
  usCourts: {
    'jurisdiction': 'Legal authority of a court',
    'appeal': 'Request for review by higher court'
  }
};

// Mock the legal dictionary service
jest.mock('../src/utils/legalDictionaryService', () => ({
  createLegalDictionaryService: jest.fn().mockImplementation(() => ({
    getDefinition: jest.fn(word => {
      return Promise.resolve({
        definition: mockDictionaries.blacksLaw[word] || mockDictionaries.usCourts[word] || 'A sample definition',
        source: mockDictionaries.blacksLaw[word] ? "Black's Law Dictionary" : 'US Courts Glossary'
      });
    }),
    clearCache: jest.fn()
  }))
}));

global.self = {
  ServiceWorker: {
    create: jest.fn()
  }
};

afterEach(() => {
  jest.clearAllMocks();
});