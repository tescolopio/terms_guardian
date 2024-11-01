// Mock PDF.js
jest.mock('pdfjs-dist', () => ({
  getDocument: jest.fn(() => ({
    promise: Promise.resolve({
      numPages: 2,
      getPage: jest.fn(() => Promise.resolve({
        getTextContent: jest.fn(() => Promise.resolve({
          items: [{ str: 'Test content' }]
        }))
      })),
      getMetadata: jest.fn(() => Promise.resolve({
        info: { Title: 'Test PDF' },
        metadata: null
      })),
      destroy: jest.fn()
    })
  })),
  GlobalWorkerOptions: {
    workerSrc: null
  }
}));

// Ensure globals are available
global.URL = {
  createObjectURL: jest.fn(),
  revokeObjectURL: jest.fn()
};

global.Blob = class Blob {
  constructor(content, options) {
    this.content = content;
    this.options = options;
  }
};

// Mock FileReader
global.FileReader = class FileReader {
  readAsArrayBuffer() {
    this.onload && this.onload({ target: { result: new ArrayBuffer(8) } });
  }
};