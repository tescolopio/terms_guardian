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

function createReadabilityGrader({ log, logLevels }) {
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
    // This regex matches words, including those with apostrophes and hyphens
    const words = text.toLowerCase().match(/\b[\w']+(?:-[\w']+)*\b/g) || [];
    return words.filter(word => word !== "");
  }

  /**
   * Counts the number of syllables in a single word.
   * @param {string} word The word to count syllables in.
   * @return {number} The number of syllables in the word.
   */
  function countSyllablesInWord(word) {
    const subSyl = [/cial/, /tia/, /cius/, /cious/, /giu/, /ion/, /iou/, /sia$/, /.ely$/, /sed$/];
    const addSyl = [/ia/, /riet/, /dien/, /iu/, /io/, /ii/, /[aeiouym]bl$/, /[aeiou]{3}/, /^mc/, /ism$/, /([^aeiouy])\1l$/, /[^l]lien/, /^coa[dglx]./, /[^gq]ua[^auieo]/, /dnt$/];

    const xx = word.toLowerCase().replace(/'/g, '').replace(/e\b/g, '');
    const scrugg = xx.split(/[^aeiouy]+/).filter(Boolean);

    return undefined === word || null === word || '' === word ? 0 : 1 === xx.length ? 1 : subSyl.map(r => (xx.match(r) || []).length).reduce((a, b) => a - b, 0) + addSyl.map(r => (xx.match(r) || []).length).reduce((a, b) => a + b, 0) + scrugg.length - (scrugg.length > 0 && '' === scrugg ? 1 : 0) + xx.split(/\b/).map(x => x.trim()).filter(Boolean).filter(x => !x.match(/[.,'!?]/g)).map(x => x.match(/[aeiouy]/) ? 0 : 1).reduce((a, b) => a + b, 0);
  }

  /**
   * Counts the number of syllables in a text.
   * @param {string} text The text to count syllables in.
   * @return {number} The total number of syllables.
   */
  function countSyllables(text) {
    const words = extractWords(text);
    return words.reduce((count, word) => count + countSyllablesInWord(word), 0);
  }

  /**
   * Counts the number of complex words in a text (words with 3 or more syllables).
   * @param {string} text The text to analyze.
   * @return {number} The number of complex words.
   */
  function countComplexWords(text) {
    const words = extractWords(text);
    return words.reduce((count, word) => count + (countSyllablesInWord(word) >= 3 ? 1 : 0), 0);
  }

  /**
   * Calculates the Flesch Reading Ease score.
   * Higher scores indicate easier readability.
   * @param {string} text The text to analyze.
   * @return {number} The Flesch Reading Ease score.
   */
  function fleschReadingEase(text) {
    const totalSentences = splitIntoSentences(text).length;
    const totalWords = splitIntoWords(text).length;
    const totalSyllables = countSyllables(text);
  
    if (totalSentences === 0 || totalWords === 0) {
      return 0;
    }
  
    return 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords);
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
      if (extractWords(text).length === 0) {
        return { flesch: 0, kincaid: 0, fogIndex: 0, averageGrade: "N/A" };
      }
  
      // Handle texts with only punctuation or special characters
      const words = splitIntoWords(text);
      if (words.length === 0) {
        throw new Error("Text contains no valid words for readability analysis.");
      }
      const fleschScore = fleschReadingEase(text);
      const kincaidScore = fleschKincaidGradeLevel(text);
      const fogIndexScore = gunningFogIndex(text);
  
      // Log individual readability scores before calculating the average
      log(logLevels.DEBUG, "Text:", text);
      log(logLevels.DEBUG, "Word count:", splitIntoWords(text).length);
      log(logLevels.DEBUG, "Sentence count:", splitIntoSentences(text).length);
      log(logLevels.DEBUG, "Syllable count:", countSyllables(text));
      log(logLevels.DEBUG, "Complex word count:", countComplexWords(text));
      log(logLevels.DEBUG, "Flesch Reading Ease Score:", fleschScore);
      log(logLevels.DEBUG, "Flesch-Kincaid Grade Level:", kincaidScore);
      log(logLevels.DEBUG, "Gunning Fog Index:", fogIndexScore);
  
      // Normalize scores
      const normalizedFlesch = Math.max(0, Math.min((120 - fleschScore) / 120, 1));
      const normalizedKincaid = Math.min(kincaidScore / 18, 1);
      const normalizedFog = Math.min(fogIndexScore / 18, 1);
      
       // Calculate weighted average
       const averageScore = (normalizedFlesch * 0.4 + normalizedKincaid * 0.3 + normalizedFog * 0.3) * 100;

      log(logLevels.DEBUG, "Normalized Average Score:", averageScore);
  
      // Determine the readability grade based on the average score
      let grade;
      switch (true) { // Using a switch statement for clarity
        case averageScore <= 30:
          grade = "A";
          break;
        case averageScore >=31 && averageScore <= 50:
          grade = "B";
          break;
        case averageScore >= 51 && averageScore <= 70:
          grade = "C";
          break;
        case averageScore >= 71 && averageScore <= 90:
          grade = "D";
          break;
        default:
          grade = "F";
      }
      // Fine-tune based on other scores
      if (kincaidScore > 12 || fogIndexScore > 12) {
        grade = String.fromCharCode(grade.charCodeAt(0) + 1);
      }
      if (grade > "F") grade = "F";
  
      log(logLevels.INFO, "Calculated Readability Grades:", {
        flesch: fleschScore,
        kincaid: kincaidScore,
        fogIndex: fogIndexScore,
        averageGrade: grade
      });
      
      log(logLevels.INFO, "Final grade:", grade);
      return {
        flesch: fleschScore,
        kincaid: kincaidScore,
        fogIndex: fogIndexScore,
        averageGrade: grade
      };
    } catch (error) {
      log(logLevels.ERROR, "Error calculating readability grade:", error);
      return {
        flesch: 0,
        kincaid: 0,
        fogIndex: 0,
        averageGrade: "N/A"
      };
    }
  }

  // Return the calculateReadabilityGrade function
  return {
    calculateReadabilityGrade
  };
}
// Export the createReadabilityGrader function
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createReadabilityGrader }; 
} else {
  window.createReadabilityGrader = createReadabilityGrader;
}