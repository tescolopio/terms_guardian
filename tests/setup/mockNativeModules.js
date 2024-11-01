// Mock native modules that might cause issues
jest.mock('canvas', () => ({
  createCanvas: jest.fn(() => ({
    getContext: jest.fn(),
    toBuffer: jest.fn()
  })),
  loadImage: jest.fn()
}));

// Mock other problematic native modules if needed
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
}));