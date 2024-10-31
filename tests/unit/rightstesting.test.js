const { createRightsAssessor } = require('./rightsAssessor.js');

describe('Rights Assessor', () => {
  let assessor;
  
  beforeEach(() => {
    assessor = createRightsAssessor({
      log: jest.fn(),
      logLevels: {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
      }
    });
  });

  describe('chunkText', () => {
    it('should chunk text into smaller segments', () => {
        const text = 'This is a sentence. This is another sentence. This is yet another sentence.';
        const chunks = rightsAssessor.chunkText(text, 20);
        expect(chunks).toEqual([
            'This is a sentence.',
            'This is another sentence.',
            'This is yet another sentence.'
        ]);
    });

    it('should handle text shorter than chunk size', () => {
        const text = 'Short text.';
        const chunks = rightsAssessor.chunkText(text, 50);
        expect(chunks).toEqual(['Short text.']);
    });

    it('should log debug messages', () => {
        const text = 'This is a sentence.';
        rightsAssessor.chunkText(text, 20);
        expect(mockLog).toHaveBeenCalledWith(logLevels.DEBUG, 'Chunking text', { chunkSize: 20 });
        expect(mockLog).toHaveBeenCalledWith(logLevels.DEBUG, 'Created 1 chunks');
    });

    it('should log error messages on failure', () => {
        const text = null;
        rightsAssessor.chunkText(text, 20);
        expect(mockLog).toHaveBeenCalledWith(logLevels.ERROR, 'Error chunking text', expect.any(Object));
    });
});

describe('analyzeRightsPatterns', () => {
    it('should analyze rights patterns in text', () => {
        const text = 'You may use this. You are allowed to do that. You must not do this.';
        const score = rightsAssessor.analyzeRightsPatterns(text);
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(1);
    });

    it('should return 0.5 for text with no patterns', () => {
        const text = 'This text has no rights patterns.';
        const score = rightsAssessor.analyzeRightsPatterns(text);
        expect(score).toBe(0.5);
    });
});

describe('identifyUncommonWords', () => {
    it('should identify uncommon words in text', async () => {
        const text = 'This text contains the word waive.';
        const uncommonWords = await rightsAssessor.identifyUncommonWords(text);
        expect(uncommonWords).toEqual([{ word: 'waive', definition: 'to refrain from insisting on or using (a right or claim).' }]);
    });

    it('should return an empty array for text with no uncommon words', async () => {
        const text = 'This text contains only common words.';
        const uncommonWords = await rightsAssessor.identifyUncommonWords(text);
        expect(uncommonWords).toEqual([]);
    });

    it('should log debug messages', async () => {
        const text = 'This text contains the word waive.';
        await rightsAssessor.identifyUncommonWords(text);
        expect(mockLog).toHaveBeenCalledWith(logLevels.DEBUG, 'Identifying uncommon words');
        expect(mockLog).toHaveBeenCalledWith(logLevels.DEBUG, 'Found 1 uncommon words');
    });

    it('should log error messages on failure', async () => {
        const text = null;
        await rightsAssessor.identifyUncommonWords(text);
        expect(mockLog).toHaveBeenCalledWith(logLevels.ERROR, 'Error identifying uncommon words', expect.any(Object));
    });
});

describe('analyzeContent', () => {
    it('should analyze content and return results', async () => {
        const text = 'You may use this. You are allowed to do that. You must not do this.';
        const result = await rightsAssessor.analyzeContent(text);
        expect(result).toHaveProperty('rightsScore');
        expect(result).toHaveProperty('uncommonWords');
        expect(result).toHaveProperty('details');
    });

    it('should log info messages', async () => {
        const text = 'You may use this.';
        await rightsAssessor.analyzeContent(text);
        expect(mockLog).toHaveBeenCalledWith(logLevels.INFO, 'Starting rights analysis');
        expect(mockLog).toHaveBeenCalledWith(logLevels.INFO, 'Analysis complete', expect.any(Object));
    });

    it('should log error messages on failure', async () => {
        const text = null;
        await rightsAssessor.analyzeContent(text);
        expect(mockLog).toHaveBeenCalledWith(logLevels.ERROR, 'Error analyzing content', expect.any(Object));
    });
  });
});