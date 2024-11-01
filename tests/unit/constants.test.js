const { constants } = require('../../src/utils/constants');
const { expect } = require('chai');

describe('Constants', () => {
  describe('EXTENSION', () => {
    it('should have correct NAME', () => {
      expect(constants.EXTENSION.NAME).to.equal('Terms Guardian');
    });

    it('should have correct VERSION', () => {
      expect(constants.EXTENSION.VERSION).to.equal('1.0.0');
    });

    it('should have correct ICON_PATHS', () => {
      expect(constants.EXTENSION.ICON_PATHS).to.deep.equal({
        SMALL: 'images/icon16.png',
        MEDIUM: 'images/icon48.png',
        LARGE: 'images/icon128.png'
      });
    });
  });

  describe('DETECTION', () => {
    it('should have correct INTERVAL', () => {
      expect(constants.DETECTION.INTERVAL).to.equal(5000);
    });

    it('should have correct THRESHOLDS', () => {
      expect(constants.DETECTION.THRESHOLDS).to.deep.equal({
        AUTO_GRADE: 30,
        NOTIFY: 10,
        HIGHLIGHT: 20,
        SECTION: 10,
        PROXIMITY: 5
      });
    });
  });

  describe('ANALYSIS', () => {
    it('should have correct PERFORMANCE_THRESHOLDS', () => {
      expect(constants.ANALYSIS.PERFORMANCE_THRESHOLDS).to.deep.equal({
        TEXT_PROCESSING: 100,
        API_CALL: 2000,
        GRADE_CALCULATION: 50,
        RIGHTS_ANALYSIS: 150,
        EXTRACTION: 200
      });
    });

    it('should have correct CHUNK_SIZE', () => {
      expect(constants.ANALYSIS.CHUNK_SIZE).to.equal(500);
    });

    it('should have correct MIN_WORD_LENGTH', () => {
      expect(constants.ANALYSIS.MIN_WORD_LENGTH).to.equal(3);
    });

    it('should have correct MAX_RETRIES', () => {
      expect(constants.ANALYSIS.MAX_RETRIES).to.equal(3);
    });

    it('should have correct CACHE_DURATION', () => {
      expect(constants.ANALYSIS.CACHE_DURATION).to.equal(86400000);
    });

    it('should have correct GRADES', () => {
      expect(constants.ANALYSIS.GRADES).to.deep.equal({
        A: { MIN: 90, LABEL: 'Excellent' },
        B: { MIN: 80, LABEL: 'Good' },
        C: { MIN: 70, LABEL: 'Fair' },
        D: { MIN: 60, LABEL: 'Poor' },
        F: { MIN: 0, LABEL: 'Very Poor' }
      });
    });
  });

  describe('MESSAGES', () => {
    it('should have correct AUTO_GRADE message', () => {
      expect(constants.MESSAGES.AUTO_GRADE).to.equal("Terms Guardian has detected a legal document and is currently grading it. Click the extension badge at the top of the browser to see the readability and how it affects your rights by agreeing to it. This is for educational purposes only and is not legal advice.");
    });

    it('should have correct SIGNIFICANT_TERMS message', () => {
      expect(constants.MESSAGES.SIGNIFICANT_TERMS).to.equal("A significant number of legal terms have been found on this page. Click the Terms Guardian Extension badge at the top of the screen to grade the text. If this is not a legal document like a Terms of Service you can still grade sections of text by selecting the text you want to grade and right clicking to bring up the context menu, then click 'grade this text' to learn more about it. This is for educational purposes only and is not legal advice.");
    });

    it('should have correct NO_LEGAL_TEXT message', () => {
      expect(constants.MESSAGES.NO_LEGAL_TEXT).to.equal("No legal text was found on this page.");
    });

    it('should have correct ERROR messages', () => {
      expect(constants.MESSAGES.ERROR).to.deep.equal({
        MODEL_LOAD: "Error loading analysis model",
        API_ERROR: "Error communicating with definition service",
        INVALID_TEXT: "Invalid or empty text provided",
        GENERAL: "An unexpected error occurred. Please try again later.",
        PERFORMANCE: "Operation took longer than expected",
        STORAGE_FULL: "Storage limit reached",
        NETWORK: "Network connection error"
      });
    });
  });

  describe('API', () => {
    it('should have correct LEXPREDICT settings', () => {
      expect(constants.API.LEXPREDICT).to.deep.equal({
        BASE_URL: 'https://api.lexpredict.com/v1',
        ENDPOINTS: {
          DEFINITIONS: '/dictionary/legal/common-law'
        },
        TIMEOUT: 5000,
        RETRY_DELAYS: [1000, 2000, 4000]
      });
    });
  });

  describe('DEBUG', () => {
    it('should have correct LEVELS', () => {
      expect(constants.DEBUG.LEVELS).to.deep.equal({
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3,
        TRACE: 4
      });
    });

    it('should have correct DEFAULT_LEVEL', () => {
      expect(constants.DEBUG.DEFAULT_LEVEL).to.equal(2);
    });

    it('should have correct STORAGE settings', () => {
      expect(constants.DEBUG.STORAGE).to.deep.equal({
        KEY: 'debugLogs',
        MAX_ENTRIES: 1000,
        EXPORT_FORMAT: 'json',
        ROTATION_SIZE: 500
      });
    });

    it('should have correct PERFORMANCE settings', () => {
      expect(constants.DEBUG.PERFORMANCE).to.deep.equal({
        ENABLED: true,
        THRESHOLD_WARNING: 100,
        THRESHOLD_ERROR: 1000,
        SAMPLE_RATE: 0.1
      });
    });

    it('should have correct MODULES', () => {
      expect(constants.DEBUG.MODULES).to.deep.equal({
        CONTENT: 'content',
        RIGHTS: 'rights',
        READABILITY: 'readability',
        EXTRACTION: 'extraction',
        API: 'api',
        STORAGE: 'storage'
      });
    });
  });

  describe('CLASSES', () => {
    it('should have correct HIGHLIGHT class', () => {
      expect(constants.CLASSES.HIGHLIGHT).to.equal('legal-term-highlight');
    });

    it('should have correct SECTION class', () => {
      expect(constants.CLASSES.SECTION).to.equal('legal-text-section');
    });

    it('should have correct IMPORTANT class', () => {
      expect(constants.CLASSES.IMPORTANT).to.equal('important-term');
    });
  });

  describe('SELECTORS', () => {
    it('should have correct LEGAL_SECTIONS', () => {
      expect(constants.SELECTORS.LEGAL_SECTIONS).to.deep.equal([
        'main',
        'article',
        'section',
        'div[class*="terms"]',
        'div[id*="terms"]',
        'div[class*="legal"]',
        'div[id*="legal"]'
      ]);
    });

    it('should have correct EXCLUDE_ELEMENTS', () => {
      expect(constants.SELECTORS.EXCLUDE_ELEMENTS).to.deep.equal([
        'nav',
        'header',
        'footer',
        'script',
        'style',
        'iframe',
        'object',
        'embed',
        'noscript'
      ]);
    });

    it('should have correct POPUPS', () => {
      expect(constants.SELECTORS.POPUPS).to.deep.equal({
        READABILITY: '#readabilityPopup',
        RIGHTS: '#rightsPopup',
        EXCERPTS: '#excerptsPopup',
        TERMS: '#termsPopup'
      });
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should have correct LAST_WORD key', () => {
      expect(constants.STORAGE_KEYS.LAST_WORD).to.equal('lastWord');
    });

    it('should have correct ANALYSIS_RESULTS key', () => {
      expect(constants.STORAGE_KEYS.ANALYSIS_RESULTS).to.equal('analysisResults');
    });

    it('should have correct CACHE_PREFIX key', () => {
      expect(constants.STORAGE_KEYS.CACHE_PREFIX).to.equal('termsDef_');
    });

    it('should have correct SETTINGS key', () => {
      expect(constants.STORAGE_KEYS.SETTINGS).to.equal('guardianSettings');
    });

    it('should have correct DEBUG_LOGS key', () => {
      expect(constants.STORAGE_KEYS.DEBUG_LOGS).to.equal('debugLogs');
    });

    it('should have correct PERFORMANCE_METRICS key', () => {
      expect(constants.STORAGE_KEYS.PERFORMANCE_METRICS).to.equal('perfMetrics');
    });
  });

  describe('CONTEXT_MENU', () => {
    it('should have correct GRADE_TEXT item', () => {
      expect(constants.CONTEXT_MENU.GRADE_TEXT).to.deep.equal({
        id: 'gradeThisText',
        title: 'Grade this text',
        contexts: ['selection']
      });
    });
  });
});