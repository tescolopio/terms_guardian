/**
 * @file uncommonWordsIdentifier.js
 * @description Enhanced word identification with dictionary integration
 * @version 3.0.0
 */

(function(global) {
  'use strict';

  const { createTextExtractor } = require('./textExtractor.js');
  const { createLegalDictionaryService } = require('../utils/legalDictionaryService.js');
  const { commonWords } = require('../data/commonWords.js');
  const { legalTerms } = require('../data/legalTerms.js');
  const { legalTermsDefinitions } = require('../data/legalTermsDefinitions.js');

  async function createUncommonWordsIdentifier({ 
    log, 
    logLevels, 
    commonWords: providedCommonWords = commonWords,
    legalTerms: providedLegalTerms = legalTerms,
    legalTermsDefinitions: providedLegalTermsDefinitions = legalTermsDefinitions,
    config = {}  
  }) {
    if (!Array.isArray(providedCommonWords) || !Array.isArray(providedLegalTerms)) {
      throw new Error('Invalid providedCommonWords or providedLegalTerms arrays');
    }

    const validCommonWords = Array.isArray(providedCommonWords) ? providedCommonWords : commonWords;
    const validLegalTerms = Array.isArray(providedLegalTerms) ? providedLegalTerms : legalTerms;
    const validLegalTermsDefinitions = providedLegalTermsDefinitions || legalTermsDefinitions;
    
    const textExtractor = createTextExtractor({ log, logLevels });
    const dictionaryService = await createLegalDictionaryService({ log, logLevels });

    const defaultConfig = {
      minWordLength: 3,
      definitionCacheTime: 24 * 60 * 60 * 1000,
      batchSize: 50,
      prioritizeLegalTerms: true,
      compoundTerms: true
    };

    config = { ...defaultConfig, ...config };
    const processedCache = new Map();

    function extractWords(text) {
      try {
        const words = textExtractor.splitIntoWords(text);
        
        const legalMatches = validLegalTerms.filter(term => 
          text.toLowerCase().includes(term.toLowerCase())
        );

        const uncommonWords = words.filter(word => 
          word.length >= config.minWordLength && 
          !validCommonWords.includes(word) &&
          !validLegalTerms.includes(word)
        );

        const compoundTerms = config.compoundTerms ? extractCompoundTerms(text) : [];
        const uniqueTerms = [...new Set([...legalMatches, ...uncommonWords, ...compoundTerms])];

        return uniqueTerms.sort((a, b) => {
          const aIsLegal = validLegalTerms.includes(a);
          const bIsLegal = validLegalTerms.includes(b);
          return aIsLegal && !bIsLegal ? -1 : 
                 !aIsLegal && bIsLegal ? 1 : 
                 a.localeCompare(b);
        });
      } catch (error) {
        log(logLevels.ERROR, 'Error extracting words:', error);
        return [];
      }
    }

    function extractCompoundTerms(text) {
      try {
        const words = textExtractor.splitIntoWords(text);
        const compoundTerms = new Set();
        
        for (let i = 0; i < words.length - 1; i++) {
          if (words[i].includes('-')) {
            compoundTerms.add(words[i]);
          }
          
          const twoWords = `${words[i]} ${words[i + 1]}`;
          if (validLegalTerms.includes(twoWords) || validLegalTermsDefinitions[twoWords]) {
            compoundTerms.add(twoWords);
          }
          
          if (i < words.length - 2) {
            const threeWords = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
            if (validLegalTerms.includes(threeWords) || validLegalTermsDefinitions[threeWords]) {
              compoundTerms.add(threeWords);
            }
          }
        }

        return Array.from(compoundTerms);
      } catch (error) {
        log(logLevels.ERROR, 'Error extracting compound terms:', error);
        return [];
      }
    }

    async function getDefinition(word) {
      if (!word || typeof word !== 'string') return null;

      if (processedCache.has(word)) {
        const cached = processedCache.get(word);
        if (Date.now() - cached.timestamp < config.definitionCacheTime) {
          return cached.definition;
        }
        processedCache.delete(word);
      }

      if (config.prioritizeLegalTerms && validLegalTermsDefinitions[word]) {
        return {
          definition: validLegalTermsDefinitions[word],
          source: 'Legal Terms Definitions'
        };
      }

      const dictDefinition = await dictionaryService.getDefinition(word);
      if (dictDefinition) {
        processedCache.set(word, {
          definition: dictDefinition,
          timestamp: Date.now()
        });
        return dictDefinition;
      }

      return null;
    }

    async function processBatch(words) {
      if (!Array.isArray(words)) return [];

      const results = [];
      for (let i = 0; i < words.length; i += config.batchSize) {
        const batch = words.slice(i, i + config.batchSize);
        const batchResults = await Promise.all(
          batch.map(async word => {
            const definition = await getDefinition(word);
            return definition ? { word, ...definition } : null;
          })
        );
        results.push(...batchResults.filter(Boolean));
      }
      return results;
    }

    async function identifyUncommonWords(text) {
      try {
        log(logLevels.INFO, 'Starting uncommon word identification');
        
        if (!text || typeof text !== 'string') {
          throw new Error('Invalid input text');
        }
    
        const words = extractWords(text);
        log(logLevels.DEBUG, `Found ${words.length} potential terms to analyze`);
    
        const uncommonWords = await processBatch(words);
        log(logLevels.INFO, `Identified ${uncommonWords.length} uncommon words`);
    
        return uncommonWords;
      } catch (error) {
        log(logLevels.ERROR, 'Error identifying uncommon words:', error);
        return [];
      }
    }

    function clearCache() {
      processedCache.clear();
      dictionaryService.clearCache();
      log(logLevels.INFO, 'All caches cleared');
    }

    return {
      identifyUncommonWords,
      clearCache,
      _test: {
        extractWords,
        extractCompoundTerms,
        getDefinition,
        processBatch,
        processedCache,
        dictionaryService,
        validCommonWords,
        validlegalTerms,
        validlegalTermsDefinitions
      }
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createUncommonWordsIdentifier };
  } else if (typeof window !== 'undefined') {
    global.UncommonWordsIdentifier = {
      create: createUncommonWordsIdentifier
    };
  }
})(typeof window !== 'undefined' ? window : global);