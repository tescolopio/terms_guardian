/**
 * @file legalDictionaryService.js
 * @description Local legal dictionary service using Open Legal Dictionary data
 */

(function(global) {
    'use strict';
  
    async function createLegalDictionaryService({ log, logLevels }) {
      let blacksLawDictionary = null;
      let usCourtsDictionary = null;
      const dictionaryCache = new Map();
  
    /**
    * Load dictionary data based on environment
    */
    async function loadDictionaries() {
      try {
        if (typeof window !== 'undefined' && chrome?.runtime?.getURL) {
          // Chrome extension environment
          const [blawResponse, uscResponse] = await Promise.all([
            fetch(chrome.runtime.getURL('data/dictionaries/bld.json')),
            fetch(chrome.runtime.getURL('data/dictionaries/usc.json'))
          ]);
          blacksLawDictionary = await blawResponse.json();
          usCourtsDictionary = await uscResponse.json();
        } else {
          // Test or Node.js environment
          try {
            blacksLawDictionary = require('../data/dictionaries/bld.json');
            usCourtsDictionary = require('../data/dictionaries/usc.json');
          } catch (error) {
            // Fallback to mock data for testing
            blacksLawDictionary = {};
            usCourtsDictionary = {};
          }
        }

        log(logLevels.INFO, 'Dictionaries loaded successfully', {
          blacksLawCount: Object.keys(blacksLawDictionary).length,
          usCourtsCount: Object.keys(usCourtsDictionary).length
        });
      } catch (error) {
        log(logLevels.ERROR, 'Error loading dictionaries:', error);
        throw error;
      }
    }
  
    /**
     * Get definition from loaded dictionaries
     */
    function getDefinition(term) {
      if (!term) {
        return null;
      }
      
      // Check cache first
      if (dictionaryCache.has(term)) {
        return dictionaryCache.get(term);
      }

      // Normalize term
      const normalizedTerm = term.toLowerCase().trim();
      
      // Try US Courts Glossary first (more current)
      const usDefinition = usCourtsDictionary[normalizedTerm];
      if (usDefinition) {
        dictionaryCache.set(term, {
          definition: usDefinition,
          source: 'US Courts Glossary'
        });
        return dictionaryCache.get(term);
      }

      // Then try Black's Law Dictionary
      const blDefinition = blacksLawDictionary[normalizedTerm];
      if (blDefinition) {
        dictionaryCache.set(term, {
          definition: blDefinition,
          source: "Black's Law Dictionary"
        });
        return dictionaryCache.get(term);
      }

      return null;
    }
  
    // Initialize by loading dictionaries
    await loadDictionaries();
  
    return {
      getDefinition,
      clearCache: () => dictionaryCache.clear(),
      getDictionaryStats: () => ({
        blacksLawCount: blacksLawDictionary ? Object.keys(blacksLawDictionary).length : 0,
        usCourtsCount: usCourtsDictionary ? Object.keys(usCourtsDictionary).length : 0,
        cacheSize: dictionaryCache.size
      })
    };
  }
  
  // Export for both environments
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createLegalDictionaryService };
  } else if (typeof window !== 'undefined') {
    global.LegalDictionaryService = {
      create: createLegalDictionaryService
    };
  }
  
})(typeof window !== 'undefined' ? window : global);