// tests/unit/legalDictionaryService.test.js

const { createLegalDictionaryService } = require('../../src/utils/legalDictionaryService');

describe('LegalDictionaryService', () => {
  let dictionaryService;
  const logMock = jest.fn();
  
  // Mock dictionary data
  const mockBlawDictionary = {
    'arbitration': 'A method of resolving disputes outside of court.',
    'tort': 'A civil wrong that causes harm or loss.'
  };
  
  const mockUscDictionary = {
    'jurisdiction': 'The legal authority of a court.',
    'appeal': 'To request that a higher court review a lower court\'s decision.'
  };

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup fetch mock responses
    global.fetch.mockImplementation((url) => {
      if (url.includes('bld.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBlawDictionary)
        });
      }
      if (url.includes('usc.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUscDictionary)
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    dictionaryService = await createLegalDictionaryService({
      log: logMock,
      logLevels: { DEBUG: 0, INFO: 1, ERROR: 2 }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Dictionary Loading', () => {
    test('should load dictionaries successfully', async () => {
      const stats = dictionaryService.getDictionaryStats();
      expect(stats.blacksLawCount).toBe(2);
      expect(stats.usCourtsCount).toBe(2);
      expect(stats.cacheSize).toBe(0);
      expect(logMock).toHaveBeenCalledWith(
        1, // INFO level
        'Dictionaries loaded successfully',
        expect.any(Object)
      );
    });

    test('should handle dictionary load failure', async () => {
      // Mock fetch to fail
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(createLegalDictionaryService({
        log: logMock,
        logLevels: { DEBUG: 0, INFO: 1, ERROR: 2 }
      })).rejects.toThrow();

      expect(logMock).toHaveBeenCalledWith(
        2, // ERROR level
        'Error loading dictionaries:',
        expect.any(Error)
      );
    });
  });

  describe('Definition Lookup', () => {
    test('should get definition from US Courts Glossary', () => {
      const result = dictionaryService.getDefinition('jurisdiction');
      expect(result).toEqual({
        definition: 'The legal authority of a court.',
        source: 'US Courts Glossary'
      });
    });

    test('should get definition from Black\'s Law Dictionary', () => {
      const result = dictionaryService.getDefinition('arbitration');
      expect(result).toEqual({
        definition: 'A method of resolving disputes outside of court.',
        source: 'Black\'s Law Dictionary'
      });
    });

    test('should handle case-insensitive lookups', () => {
      const result1 = dictionaryService.getDefinition('JURISDICTION');
      const result2 = dictionaryService.getDefinition('jurisdiction');
      expect(result1).toEqual(result2);
    });

    test('should return null for unknown terms', () => {
      const result = dictionaryService.getDefinition('nonexistentterm');
      expect(result).toBeNull();
    });

    test('should handle undefined or null input', () => {
      expect(dictionaryService.getDefinition(undefined)).toBeNull();
      expect(dictionaryService.getDefinition(null)).toBeNull();
    });
  });

  describe('Cache Management', () => {
    test('should cache definitions', () => {
      const term = 'jurisdiction';
      
      // First lookup - should hit dictionary
      const result1 = dictionaryService.getDefinition(term);
      expect(result1.source).toBe('US Courts Glossary');
      
      // Modify mock data to ensure we're getting cached version
      global.fetch.mockImplementation(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ [term]: 'Modified definition' })
      }));
      
      // Second lookup - should hit cache
      const result2 = dictionaryService.getDefinition(term);
      expect(result2).toEqual(result1);
      
      const stats = dictionaryService.getDictionaryStats();
      expect(stats.cacheSize).toBe(1);
    });

    test('should clear cache', () => {
      // Add some terms to cache
      dictionaryService.getDefinition('jurisdiction');
      dictionaryService.getDefinition('arbitration');
      
      let stats = dictionaryService.getDictionaryStats();
      expect(stats.cacheSize).toBe(2);
      
      dictionaryService.clearCache();
      
      stats = dictionaryService.getDictionaryStats();
      expect(stats.cacheSize).toBe(0);
    });
  });

  describe('Statistics', () => {
    test('should return accurate dictionary stats', () => {
      // Add some terms to cache
      dictionaryService.getDefinition('jurisdiction');
      dictionaryService.getDefinition('arbitration');
      
      const stats = dictionaryService.getDictionaryStats();
      expect(stats).toEqual({
        blacksLawCount: 2,
        usCourtsCount: 2,
        cacheSize: 2
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed dictionary data', async () => {
      global.fetch.mockImplementation(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(null)
      }));

      await expect(createLegalDictionaryService({
        log: logMock,
        logLevels: { DEBUG: 0, INFO: 1, ERROR: 2 }
      })).rejects.toThrow();
    });

    test('should handle network errors', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(createLegalDictionaryService({
        log: logMock,
        logLevels: { DEBUG: 0, INFO: 1, ERROR: 2 }
      })).rejects.toThrow('Network error');
    });
  });
});