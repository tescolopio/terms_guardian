/**
 * @file jest.config.js
 * @description Jest configuration for Terms Guardian extension
 */

module.exports = {
  // Basic Configuration
  testEnvironment: 'jsdom',
  verbose: true,
  clearMocks: true,

  // Coverage Configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],

  // Module Configuration
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sss|styl)$': 'identity-obj-proxy'
  },

  // Transform Configuration
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },

  // Test Configuration
  testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
  
  // Setup Files
  setupFiles: ['<rootDir>/tests/setupTests.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Transform Ignore Patterns
  transformIgnorePatterns: ['/node_modules/']
};