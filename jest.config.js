module.exports = {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/tests/setupTests.js"],
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  }
};