const { createTextExtractor } = require('../../src/analysis/textExtractor');

describe('TextExtractor', () => {
  let textExtractor;
  let log;
  let logLevels;
  let utilities;

  beforeEach(() => {
    log = jest.fn();
    logLevels = {
      DEBUG: 'debug',
      ERROR: 'error'
    };
    utilities = {
      showNotification: jest.fn((config, callback) => callback(true))
    };

    textExtractor = createTextExtractor({ log, logLevels, utilities });
  });

  describe('preprocessText', () => {
    it('should preprocess text by normalizing whitespace and special characters', () => {
      const input = 'Hello,\nworld!\tThis is a test.\u00A0';
      const expectedOutput = 'Hello, world! This is a test.';
      const result = textExtractor.preprocessText(input);
      expect(result).toBe(expectedOutput);
    });

    it('should return an empty string if input is not a string', () => {
      const result = textExtractor.preprocessText(null);
      expect(result).toBe('');
    });
  });

  describe('extractFromHTML', () => {
    it('should extract text from valid HTML', async () => {
      const html = '<div>Hello, <strong>world!</strong></div>';
      const expectedOutput = 'Hello, world!';
      const result = await textExtractor.extractFromHTML(html);
      expect(result).toBe(expectedOutput);
    });

    it('should handle incomplete HTML and show notification', async () => {
      const html = '<div>Hello, <strong>world!';
      const expectedOutput = 'Hello, world!';
      utilities.showNotification.mockImplementation((config, callback) => callback(true));
      const result = await textExtractor.extractFromHTML(html);
      expect(result).toBe(expectedOutput);
      expect(utilities.showNotification).toHaveBeenCalled();
    });

    it('should handle malformed HTML and show notification', async () => {
      const html = '<div><strong>world!</div>';
      utilities.showNotification.mockImplementation((config) => {});
      const result = await textExtractor.extractFromHTML(html);
      expect(result).toBe('');
      expect(utilities.showNotification).toHaveBeenCalled();
    });
  });

  describe('extractFromPDF', () => {
    it('should extract text from PDF content', async () => {
      const pdfData = 'base64-pdf-data';
      const expectedOutput = 'Extracted text from PDF';
      global.pdfjsLib = {
        getDocument: jest.fn().mockReturnValue({
          promise: Promise.resolve({
            numPages: 1,
            getPage: jest.fn().mockReturnValue(Promise.resolve({
              getTextContent: jest.fn().mockReturnValue(Promise.resolve({
                items: [{ str: 'Extracted text from PDF' }]
              }))
            }))
          })
        })
      };
      const result = await textExtractor.extractFromPDF(pdfData);
      expect(result).toBe(expectedOutput);
    });

    it('should handle PDF extraction error and show notification', async () => {
      const pdfData = 'invalid-pdf-data';
      utilities.showNotification.mockImplementation((config) => {});
      global.pdfjsLib = {
        getDocument: jest.fn().mockReturnValue({
          promise: Promise.reject(new Error('PDF extraction error'))
        })
      };
      const result = await textExtractor.extractFromPDF(pdfData);
      expect(result).toBe('');
      expect(utilities.showNotification).toHaveBeenCalled();
    });
  });

  describe('extractFromDOCX', () => {
    it('should extract text from DOCX content', async () => {
      const docxData = 'base64-docx-data';
      const expectedOutput = 'Extracted text from DOCX';
      global.mammoth = {
        extractRawText: jest.fn().mockReturnValue(Promise.resolve({ value: 'Extracted text from DOCX' }))
      };
      const result = await textExtractor.extractFromDOCX(docxData);
      expect(result).toBe(expectedOutput);
    });

    it('should handle DOCX extraction error and show notification', async () => {
      const docxData = 'invalid-docx-data';
      utilities.showNotification.mockImplementation((config) => {});
      global.mammoth = {
        extractRawText: jest.fn().mockReturnValue(Promise.reject(new Error('DOCX extraction error')))
      };
      const result = await textExtractor.extractFromDOCX(docxData);
      expect(result).toBe('');
      expect(utilities.showNotification).toHaveBeenCalled();
    });
  });

  describe('extractFromText', () => {
    it('should extract text from plain text', () => {
      const text = 'Hello, world!';
      const result = textExtractor.extractFromText(text);
      expect(result).toBe(text);
    });
  });

  describe('splitIntoSentences', () => {
    it('should split text into sentences', () => {
      const text = 'Hello, world! This is a test. Another sentence.';
      const expectedOutput = ['Hello, world!', 'This is a test.', 'Another sentence.'];
      const result = textExtractor.splitIntoSentences(text);
      expect(result).toEqual(expectedOutput);
    });
  });

  describe('splitIntoWords', () => {
    it('should split text into words', () => {
      const text = 'Hello, world! This is a test.';
      const expectedOutput = ['Hello', 'world', 'This', 'is', 'a', 'test'];
      const result = textExtractor.splitIntoWords(text);
      expect(result).toEqual(expectedOutput);
    });
  });

  describe('extract', () => {
    it('should extract text based on type', async () => {
      const html = '<div>Hello, <strong>world!</strong></div>';
      const expectedOutput = 'Hello, world!';
      const result = await textExtractor.extract(html, 'html');
      expect(result).toBe(expectedOutput);
    });

    it('should handle invalid input type and show notification', async () => {
      const input = {};
      utilities.showNotification.mockImplementation((config) => {});
      const result = await textExtractor.extract(input, 'invalid');
      expect(result).toBe('');
      expect(utilities.showNotification).toHaveBeenCalled();
    });
  });
});