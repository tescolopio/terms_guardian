const { createUncommonWordsIdentifier } = require('../../src/analysis/uncommonWordsIdentifier');
const { createTextExtractor } = require('../../src/analysis/textExtractor');
const { createLegalDictionaryService } = require('../../src/utils/legalDictionaryService');
const { commonWords } = require('../../src/data/commonWords');
const { legalTerms } = require('../../src/data/legalTerms');
const { legalTermsDefinitions } = require('../../src/data/legalTermsDefinitions');

jest.mock('../../src/analysis/textExtractor');
jest.mock('../../src/utils/legalDictionaryService');

describe('UncommonWordsIdentifier', () => {
  let log, logLevels, textExtractor, dictionaryService;

  beforeEach(() => {
    log = jest.fn();
    logLevels = {
      INFO: 'info',
      DEBUG: 'debug',
      ERROR: 'error'
    };

    textExtractor = {
      splitIntoWords: jest.fn()
    };
    createTextExtractor.mockReturnValue(textExtractor);

    dictionaryService = {
      getDefinition: jest.fn(),
      clearCache: jest.fn()
    };
    createLegalDictionaryService.mockResolvedValue(dictionaryService);
  });

  describe('extractWords', () => {
    it('should extract words and identify uncommon words', async () => {
      const identifier = await createUncommonWordsIdentifier({ log, logLevels });
      const text = 'This is a sample legal document with some uncommon-terms and legal terms like affidavit and subpoena.';
      textExtractor.splitIntoWords.mockReturnValue(['This', 'is', 'a', 'sample', 'legal', 'document', 'with', 'some', 'uncommon-terms', 'and', 'legal', 'terms', 'like', 'affidavit', 'and', 'subpoena']);

      const result = identifier._test.extractWords(text);

      expect(result).toEqual(expect.arrayContaining(['uncommon-terms', 'affidavit', 'subpoena']));
    });

    it('should handle errors gracefully', async () => {
      const identifier = await createUncommonWordsIdentifier({ log, logLevels });
      textExtractor.splitIntoWords.mockImplementation(() => { throw new Error('Test error'); });

      const result = identifier._test.extractWords('test text');

      expect(result).toEqual([]);
      expect(log).toHaveBeenCalledWith(logLevels.ERROR, 'Error extracting words:', expect.any(Error));
    });
  });

  describe('extractCompoundTerms', () => {
    it('should extract compound terms from text', async () => {
      const identifier = await createUncommonWordsIdentifier({ log, logLevels });
      const text = 'This is a sample legal-document with some compound-terms like non-disclosure agreement.';
      textExtractor.splitIntoWords.mockReturnValue(['This', 'is', 'a', 'sample', 'legal-document', 'with', 'some', 'compound-terms', 'like', 'non-disclosure', 'agreement']);

      const result = identifier._test.extractCompoundTerms(text);

      expect(result).toEqual(expect.arrayContaining(['legal-document', 'compound-terms', 'non-disclosure agreement']));
    });

    it('should handle errors gracefully', async () => {
      const identifier = await createUncommonWordsIdentifier({ log, logLevels });
      textExtractor.splitIntoWords.mockImplementation(() => { throw new Error('Test error'); });

      const result = identifier._test.extractCompoundTerms('test text');

      expect(result).toEqual([]);
      expect(log).toHaveBeenCalledWith(logLevels.ERROR, 'Error extracting compound terms:', expect.any(Error));
    });
  });

  describe('getDefinition', () => {
    it('should return definition from cache if available', async () => {
      const identifier = await createUncommonWordsIdentifier({ log, logLevels });
      const word = 'affidavit';
      const definition = { definition: 'A written statement confirmed by oath or affirmation.', source: 'Legal Terms Definitions' };
      identifier._test.processedCache.set(word, { definition, timestamp: Date.now() });

      const result = await identifier._test.getDefinition(word);

      expect(result).toEqual(definition);
    });

    it('should return definition from legal terms definitions if prioritized', async () => {
      const identifier = await createUncommonWordsIdentifier({ log, logLevels });
      const word = 'affidavit';
      const definition = { definition: 'A written statement confirmed by oath or affirmation.', source: 'Legal Terms Definitions' };

      const result = await identifier._test.getDefinition(word);

      expect(result).toEqual(definition);
    });

    it('should return definition from dictionary service if not in cache or legal terms definitions', async () => {
      const identifier = await createUncommonWordsIdentifier({ log, logLevels });
      const word = 'uncommon';
      const definition = 'Not common or usual; rare.';

      dictionaryService.getDefinition.mockResolvedValue(definition);

      const result = await identifier._test.getDefinition(word);

      expect(result).toEqual(definition);
    });

    it('should handle errors gracefully', async () => {
      const identifier = await createUncommonWordsIdentifier({ log, logLevels });
      dictionaryService.getDefinition.mockImplementation(() => { throw new Error('Test error'); });

      const result = await identifier._test.getDefinition('test');

      expect(result).toBeNull();
    });
  });

  describe('processBatch', () => {
    it('should process words in batches and return definitions', async () => {
      const identifier = await createUncommonWordsIdentifier({ log, logLevels });
      const words = ['affidavit', 'subpoena'];
      const definitions = [
        { word: 'affidavit', definition: 'A written statement confirmed by oath or affirmation.', source: 'Legal Terms Definitions' },
        { word: 'subpoena', definition: 'A writ ordering a person to attend a court.', source: 'Legal Terms Definitions' }
      ];

      dictionaryService.getDefinition.mockResolvedValueOnce(definitions[0].definition);
      dictionaryService.getDefinition.mockResolvedValueOnce(definitions[1].definition);

      const result = await identifier._test.processBatch(words);

      expect(result).toEqual(definitions);
    });

    it('should handle empty input gracefully', async () => {
      const identifier = await createUncommonWordsIdentifier({ log, logLevels });

      const result = await identifier._test.processBatch([]);

      expect(result).toEqual([]);
    });
  });

  describe('identifyUncommonWords', () => {
    it('should identify uncommon words and return their definitions', async () => {
      const identifier = await createUncommonWordsIdentifier({ log, logLevels });
      const text = 'This is a sample legal document with some uncommon-terms and legal terms like affidavit and subpoena.';
      const definitions = [
        { word: 'uncommon-terms', definition: 'Terms that are not common.', source: 'Dictionary' },
        { word: 'affidavit', definition: 'A written statement confirmed by oath or affirmation.', source: 'Legal Terms Definitions' },
        { word: 'subpoena', definition: 'A writ ordering a person to attend a court.', source: 'Legal Terms Definitions' }
      ];

      textExtractor.splitIntoWords.mockReturnValue(['This', 'is', 'a', 'sample', 'legal', 'document', 'with', 'some', 'uncommon-terms', 'and', 'legal', 'terms', 'like', 'affidavit', 'and', 'subpoena']);
      dictionaryService.getDefinition.mockResolvedValueOnce(definitions[0].definition);
      dictionaryService.getDefinition.mockResolvedValueOnce(definitions[1].definition);
      dictionaryService.getDefinition.mockResolvedValueOnce(definitions[2].definition);

      const result = await identifier.identifyUncommonWords(text);

      expect(result).toEqual(definitions);
    });

    it('should handle invalid input gracefully', async () => {
      const identifier = await createUncommonWordsIdentifier({ log, logLevels });

      const result = await identifier.identifyUncommonWords(null);

      expect(result).toEqual([]);
      expect(log).toHaveBeenCalledWith(logLevels.ERROR, 'Error identifying uncommon words:', expect.any(Error));
    });
  });

  describe('clearCache', () => {
    it('should clear all caches', async () => {
      const identifier = await createUncommonWordsIdentifier({ log, logLevels });

      identifier.clearCache();

      expect(identifier._test.processedCache.size).toBe(0);
      expect(dictionaryService.clearCache).toHaveBeenCalled();
      expect(log).toHaveBeenCalledWith(logLevels.INFO, 'All caches cleared');
    });
  });
});