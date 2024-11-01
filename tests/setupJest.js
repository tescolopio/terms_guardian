const { TextEncoder, TextDecoder } = require('util');

// Polyfill TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock DOM environment
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Disable Haste module system
jest.disableAutomock();

// Mock chrome API
global.chrome = {
  runtime: {
    getURL: jest.fn(path => `mock:///${path}`),
    sendMessage: jest.fn()
  },
  storage: {
    local: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined)
    }
  },
  tabs: {
    query: jest.fn().mockResolvedValue([{ id: 1, active: true }])
  }
};

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Reset mocks before each test
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});