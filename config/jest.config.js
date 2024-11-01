const config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "babel",
  coverageReporters: ["json", "text", "lcov", "clover"],
   // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // Disable Haste
  haste: {
    enableSymlinks: false,
    forceNodeFilesystemAPI: true,
  },
   // An array of file extensions your modules use
  moduleFileExtensions: [
    "js",
    "mjs",
    "cjs",
    "jsx",
    "ts",
    "tsx",
    "json",
    "node"
  ],
  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sss|styl)$': 'identity-obj-proxy'
  },
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  moduleDirectories: ['node_modules', 'src'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  setupFiles: ['<rootDir>/tests/setupTests.js'],
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
  ],
  testEnvironment: "jsdom",
  // Important: Explicitly ignore problematic directories
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/packages/'
  ],
  // Module Path Ignore Patterns
  modulePathIgnorePatterns: [
    '<rootDir>/packages/'
  ],
  verbose: true,
  // Watch Plugin Configuration
  watchPathIgnorePatterns: [
    '<rootDir>/packages/'
  ],
  testMatch: ['<rootDir>/tests/unit/**/*.test.js']
  // roots: ["<rootDir>"],
  // moduleDirectories: ["node_modules", "src"]
};

module.exports = config;