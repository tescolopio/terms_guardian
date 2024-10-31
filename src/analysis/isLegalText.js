/**
 * @file isLegalText.js
 */
(function(global) {
    'use strict';
  
    const { createTextExtractor } = require('./textExtractor');
  
    function createLegalTextAnalyzer({ log, logLevels, legalTerms = [], config = {} }) {
      const textExtractor = createTextExtractor({ log, logLevels });
  
      const defaultConfig = {
        sectionThreshold: 10,
        proximityThreshold: 5
      };
  
      config = { ...defaultConfig, ...config };
  
      function isLegalText(text) {
        try {
          const words = textExtractor.splitIntoWords(text);
          const legalTermCount = words.filter(word => legalTerms.includes(word)).length;
          return legalTermCount >= config.sectionThreshold;
        } catch (error) {
          log(logLevels.ERROR, 'Error analyzing legal text', error);
          return false;
        }
      }
  
      function getLegalTermDensity(text) {
        const words = textExtractor.splitIntoWords(text);
        return words.length > 0 ? 
          (words.filter(word => legalTerms.includes(word)).length / words.length) : 0;
      }
  
      return {
        isLegalText,
        getLegalTermDensity
      };
    }
  
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = { createLegalTextAnalyzer };
    } else {
      global.LegalTextAnalyzer = { create: createLegalTextAnalyzer };
    }
  
  })(typeof window !== 'undefined' ? window : global);