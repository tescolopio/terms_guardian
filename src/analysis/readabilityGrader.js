/**
 * @file readabilityGrader.js
 * @description This script contains functions to calculate the readability grade of a text based on various algorithms.
 * @contributors {tescolopio}
 * @version 1.1.0
 * @date 2024-09-29
 * 
 * @changes
 *  - 2024-09-18 | tescolopio | Initial creation of the script.
 *  - 2024-09-21.01 | tescolopio | added imports and exports for modularity, added error handling and logging.
 *  - 2024-09-25 | tescolopio | updated the readability grade ranges.
 *  - 2024-10-5 | tescolopio | Modified to work with Chrome extension environment.
 *  - 2024-10-5.01 | tescolopio | Fixed syllable counting and punctuation handling for more accurate results.
 */
(function(global) {
  'use strict';

  function createReadabilityGrader({ log, logLevels }) {
    
    const { ANALYSIS } = global.Constants;
    const { GRADES } = ANALYSIS;

    // Regex patterns for syllable counting
    const SYLLABLE_PATTERNS = {
      SUBTRACT: [/cial/, /tia/, /cius/, /cious/, /giu/, /ion/, /iou/, /sia$/, /.ely$/, /sed$/],
      ADD: [/ia/, /riet/, /dien/, /iu/, /io/, /ii/, /[aeiouym]bl$/, /[aeiou]{3}/, /^mc/, /ism$/, 
            /([^aeiouy])\1l$/, /[^l]lien/, /^coa[dglx]./, /[^gq]ua[^auieo]/, /dnt$/]
    };

    function splitIntoSentences(text) {
      return text.split(/[.!?]+/).filter(sentence => sentence.trim() !== "");
    }
    
    function splitIntoWords(text) {
      return text.split(/\s+/).filter(word => word.trim() !== "");
    }
    
    /**
     * Extracts words from a text, handling punctuation, special characters, contractions, and hyphenated words.
     * @param {string} text The text to extract words from.
     * @return {Array<string>} An array of extracted words.
     */
    function extractWords(text) {
      const words = text.toLowerCase().match(/\b[\w']+(?:-[\w']+)*\b/g) || [];
      return words.filter(word => word.length >= ANALYSIS.MIN_WORD_LENGTH);
    }

    /**
     * Counts the number of syllables in a single word.
     * @param {string} word The word to count syllables in.
     * @return {number} The number of syllables in the word.
     */
    function countSyllablesInWord(word) {
      if (!word || word.length < ANALYSIS.MIN_WORD_LENGTH) return 1;

      const xx = word.toLowerCase().replace(/'/g, '').replace(/e\b/g, '');
      const scrugg = xx.split(/[^aeiouy]+/).filter(Boolean);

      const subtractCount = SYLLABLE_PATTERNS.SUBTRACT
        .reduce((count, pattern) => count + (xx.match(pattern) || []).length, 0);

      const addCount = SYLLABLE_PATTERNS.ADD
        .reduce((count, pattern) => count + (xx.match(pattern) || []).length, 0);

      const baseCount = scrugg.length - (scrugg.length > 0 && '' === scrugg ? 1 : 0);
      const consonantCount = xx.split(/\b/)
        .map(x => x.trim())
        .filter(Boolean)
        .filter(x => !x.match(/[.,'!?]/g))
        .reduce((count, x) => count + (x.match(/[aeiouy]/) ? 0 : 1), 0);

      return Math.max(1, baseCount - subtractCount + addCount + consonantCount);
    }

    /**
     * Counts the number of syllables in a text.
     * @param {string} text The text to count syllables in.
     * @return {number} The total number of syllables.
     */
    function countSyllables(text) {
      return extractWords(text)
        .reduce((count, word) => count + countSyllablesInWord(word), 0);
    }

    /**
     * Counts the number of complex words in a text (words with 3 or more syllables).
     * @param {string} text The text to analyze.
     * @return {number} The number of complex words.
     */
    function countComplexWords(text) {
      return extractWords(text)
        .reduce((count, word) => count + (countSyllablesInWord(word) >= 3 ? 1 : 0), 0);
    }

    /**
     * Calculates the Flesch Reading Ease score.
     * Higher scores indicate easier readability.
     * @param {string} text The text to analyze.
     * @return {number} The Flesch Reading Ease score.
     */
    function fleschReadingEase(text) {
      const sentences = splitIntoSentences(text);
      const words = splitIntoWords(text);
      const syllables = countSyllables(text);
      
      if (sentences.length === 0 || words.length === 0) return 0;
      
      return 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
    }

    /**
     * Calculates the Flesch-Kincaid Grade Level.
     * Higher scores indicate more difficult readability.
     * @param {string} text The text to analyze.
     * @return {number} The Flesch-Kincaid Grade Level.
     */
    function fleschKincaidGradeLevel(text) {
      const sentences = splitIntoSentences(text);
      const words = splitIntoWords(text);
      const syllables = countSyllables(text);
      
      if (sentences.length === 0 || words.length === 0) return 0;
      
      return 0.39 * (words.length / sentences.length) + 11.8 * (syllables / words.length) - 15.59;
    }

    /**
     * Calculates the Gunning Fog Index.
     * Higher scores indicate more difficult readability.
     * @param {string} text The text to analyze.
     * @return {number} The Gunning Fog Index.
     */
    function gunningFogIndex(text) {
      const sentences = splitIntoSentences(text);
      const words = splitIntoWords(text);
      const complexWords = countComplexWords(text);
      
      if (sentences.length === 0 || words.length === 0) return 0;
      
      return 0.4 * ((words.length / sentences.length) + 100 * (complexWords / words.length));
    }

    function calculateNormalizedScores(fleschScore, kincaidScore, fogIndexScore) {
      return {
        flesch: Math.max(0, Math.min((120 - fleschScore) / 120, 1)),
        kincaid: Math.min(kincaidScore / 18, 1),
        fog: Math.min(fogIndexScore / 18, 1)
      };
    }

    function determineGrade(averageScore, kincaidScore, fogIndexScore) {
      let grade;
      
      if (averageScore <= GRADES.A.MIN) grade = "A";
      else if (averageScore <= GRADES.B.MIN) grade = "B";
      else if (averageScore <= GRADES.C.MIN) grade = "C";
      else if (averageScore <= GRADES.D.MIN) grade = "D";
      else grade = "F";

      // Fine-tune based on other scores
      if (kincaidScore > 12 || fogIndexScore > 12) {
        grade = String.fromCharCode(grade.charCodeAt(0) + 1);
      }
      if (grade > "F") grade = "F";

      return grade;
    }

    /**
     * Calculates the readability grade of a text using multiple algorithms and returns an average.
     * @param {string} text The text to calculate the grade for.
     * @return {object} An object containing the individual readability scores and the average grade.
     */
    function calculateReadabilityGrade(text) {
      try {
        if (typeof text !== 'string' || text.trim() === "") {
          throw new Error("Invalid input text for readability analysis.");
        }

        const words = extractWords(text);
        if (words.length === 0) {
          return { flesch: 0, kincaid: 0, fogIndex: 0, averageGrade: "N/A" };
        }

        // Calculate base scores
        const fleschScore = fleschReadingEase(text);
        const kincaidScore = fleschKincaidGradeLevel(text);
        const fogIndexScore = gunningFogIndex(text);

        // Log metrics
        log(logLevels.DEBUG, {
          text: text.substring(0, 100) + '...',
          wordCount: words.length,
          sentenceCount: splitIntoSentences(text).length,
          syllableCount: countSyllables(text),
          complexWordCount: countComplexWords(text),
          scores: { fleschScore, kincaidScore, fogIndexScore }
        });

        // Calculate normalized scores
        const normalized = calculateNormalizedScores(fleschScore, kincaidScore, fogIndexScore);
        const averageScore = (normalized.flesch * 0.4 + normalized.kincaid * 0.3 + normalized.fog * 0.3) * 100;

        // Determine final grade
        const grade = determineGrade(averageScore, kincaidScore, fogIndexScore);

        const result = {
          flesch: fleschScore,
          kincaid: kincaidScore,
          fogIndex: fogIndexScore,
          averageGrade: grade,
          normalizedScore: averageScore,
          confidence: Math.min(1, words.length / 100) // Simple confidence metric
        };

        log(logLevels.INFO, "Final readability analysis:", result);
        return result;

      } catch (error) {
        log(logLevels.ERROR, "Error calculating readability grade:", error);
        return {
          flesch: 0,
          kincaid: 0,
          fogIndex: 0,
          averageGrade: "N/A",
          error: error.message
        };
      }
    }

    // Return the calculateReadabilityGrade function
    return {
      calculateReadabilityGrade,
      // Expose for testing
      _test: {
        countSyllablesInWord,
        extractWords,
        calculateNormalizedScores
      }
    };
  }

  // Export for both Chrome extension and test environments
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createReadabilityGrader };
  } else {
    global.ReadabilityGrader = {
      create: createReadabilityGrader
    };
  }

})(typeof window !== 'undefined' ? window : global);