const config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "babel",
  coverageReporters: ["json", "text", "lcov", "clover"],
  moduleFileExtensions: ["js", "mjs", "cjs", "jsx", "json", "node"],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sss|styl)$': '<rootDir>/node_modules/jest-css-modules'
  },
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  setupFilesAfterEnv: [
    '<rootDir>/tests/setupJest.js'
  ],
  testEnvironment: "jsdom",
  verbose: true,
  testMatch: ["**/tests/**/*.test.js"],
  roots: ["<rootDir>"],
  moduleDirectories: ["node_modules", "src"]
};

module.exports = config;