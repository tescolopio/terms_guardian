/**
 * @file readabilityGrader.js
 * @description This script contains functions to calculate the readability grade of a text based on various algorithms.
 * @contributors {tescolopio}
 * @version 1.0.0
 * @date 2024-09-21
 * 
 * @author Timmothy Escolopio
 * @company 3D Tech Solutions LLC
 * 
 * @changes
 *  - 2024-09-18 | tescolopio | Initial creation of the script.
 *  - 2024-09-21.01 | tescolopio | added imports and exports for modularity, added error handling and logging.
 */

import { log, logLevels } from './debugger.js';
import legalTerms from './legalTerms.js';
import { sendMessageToBackground, showNotification } from './background.js';
import { isLegalText } from './legalTextChecker.js';
import { sendMessageToBackground, showNotification, containsLegalTerm, containsPartialMatch, containsProximityMatch } from './utilities.js';


/**
 * Extracts words from a text, handling punctuation and special characters.
 * @param {string} text The text to extract words from.
 * @return {Array<string>} An array of extracted words.
 */
function extractWords(text) {
  // Remove punctuation and special characters, then split into words
  const words = text.replace(/[^\w\s]|_/g, "").toLowerCase().split(/\s+/);

  // Filter out empty strings (in case of multiple spaces or leading/trailing spaces)
  const filteredWords = words.filter(word => word !== "");

  return filteredWords;
}

/**
 * Counts the number of complex words in a text (words with 3 or more syllables).
 * @param {string} text The text to analyze.
 * @return {number} The number of complex words.
 */
function countComplexWords(text) {
  try {
    log(logLevels.DEBUG, "Counting complex words in text.");

    const words = extractWords(text); // Extract words using the provided function

    let complexWordCount = 0;
    for (const word of words) {
      const syllableCount = countSyllablesInWord(word);
      if (syllableCount >= 3) {
        complexWordCount++;
        log(logLevels.DEBUG, `Complex word found: ${word} (Syllables: ${syllableCount})`);
      }
    }

    log(logLevels.DEBUG, "Total Complex Words:", complexWordCount);
    return complexWordCount;
  } catch (error) {
    log(logLevels.ERROR, "Error counting complex words:", error);
    return 0; // Or another default value or throw an error
  }
}
  
/**
 * Counts the number of syllables in a text.
 * @param {string} text The text to count syllables in
 * @return {number} The total number of syllables
 */
function countSyllables(text) {
  try {
    const words = extractWords(text);
    let syllableCount = 0;

    for (const word of words) {
      syllableCount += countSyllablesInWord(word);
    }

    log(logLevels.DEBUG, "Total Syllables:", syllableCount);
    return syllableCount;
  } catch (error) {
    log(logLevels.ERROR, "Error counting syllables:", error);
    return 0; 
  }
}
  
/**
 * Counts the number of syllables in a single word
 * @param {string} word The word to count syllables in
 * @return {number} The number of syllables in the word
 */
function countSyllablesInWord(word) {
  try {
    log(logLevels.DEBUG, "Counting syllables in word:", word);
    word = word.toLowerCase();
    if (word.length <= 3) {
      log(logLevels.DEBUG, "Word length <= 3, returning 1 syllable");
      return 1;
    }
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const syllableMatches = word.match(/[aeiouy]{1,2}/g);
    const syllableCount = syllableMatches ? syllableMatches.length : 0;
    log(logLevels.DEBUG, "Syllable matches:", syllableMatches);
    log(logLevels.DEBUG, "Syllable count:", syllableCount);
    return syllableCount;
  } catch (error) {
    log(logLevels.ERROR, "Error counting syllables in word:", word, error);
    return 0; 
  }
}

/**
 * Calculates the Flesch Reading Ease score of a text.
 * @param {string} text The text to calculate the score for.
 * @return {number} The Flesch Reading Ease score.
 */
function fleschReadingEase(text) {
  try {
    const totalSentences = text.split(/[.!?]+/).filter(sentence => sentence.trim() !== "").length;
    const totalWords = text.split(/\s+/).filter(word => word.trim() !== "").length;
    const totalSyllables = countSyllables(text);

    log(logLevels.DEBUG, "Flesch Reading Ease - Total Sentences:", totalSentences);
    log(logLevels.DEBUG, "Flesch Reading Ease - Total Words:", totalWords);
    log(logLevels.DEBUG, "Flesch Reading Ease - Total Syllables:", totalSyllables);

    const score = 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords);
    log(logLevels.INFO, "Flesch Reading Ease Score:", score);
    return score;
  } catch (error) {
    log(logLevels.ERROR, "Error calculating Flesch Reading Ease:", error);
    return 0; // Return a default value in case of error
  }
}
  
/**
 * Calculates the Flesch-Kincaid Grade Level of a text.
 * @param {string} text The text to calculate the score for.
 * @return {number} The Flesch-Kincaid Grade Level.
 */
function fleschKincaidGradeLevel(text) {
  try {
    const totalSentences = text.split(/[.!?]+/).filter(sentence => sentence.trim() !== "").length;
    const totalWords = text.split(/\s+/).filter(word => word.trim() !== "").length;
    const totalSyllables = countSyllables(text);

    log(logLevels.DEBUG, "Flesch-Kincaid - Total Sentences:", totalSentences);
    log(logLevels.DEBUG, "Flesch-Kincaid - Total Words:", totalWords);
    log(logLevels.DEBUG, "Flesch-Kincaid - Total Syllables:", totalSyllables);

    const score = 0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59;
    log(logLevels.INFO, "Flesch-Kincaid Grade Level:", score);
    return score;
  } catch (error) {
    log(logLevels.ERROR, "Error calculating Flesch-Kincaid Grade Level:", error);
    return 0; // Return a default value in case of error
  }
}
  
/**
 * Calculates the Gunning Fog Index of a text.
 * @param {string} text The text to calculate the score for.
 * @return {number} The Gunning Fog Index.
 */
function gunningFogIndex(text) {
  try {
    const totalSentences = text.split(/[.!?]+/).filter(sentence => sentence.trim() !== "").length;
    const totalWords = text.split(/\s+/).filter(word => word.trim() !== "").length;
    const complexWordCount = countComplexWords(text);

    log(logLevels.DEBUG, "Gunning Fog - Total Sentences:", totalSentences);
    log(logLevels.DEBUG, "Gunning Fog - Total Words:", totalWords);
    log(logLevels.DEBUG, "Gunning Fog - Complex Word Count:", complexWordCount);

    const score = 0.4 * ((totalWords / totalSentences) + 100 * (complexWordCount / totalWords));
    log(logLevels.INFO, "Gunning Fog Index:", score);
    return score;
  } catch (error) {
    log(logLevels.ERROR, "Error calculating Gunning Fog Index:", error);
    return 0; // Return a default value in case of error
  }
}

/**
 * Calculates the readability grade of a text using multiple algorithms and returns an average.
 * @param {string} text The text to calculate the grade for.
 * @return {object} An object containing the individual readability scores and the average grade
 */
export function calculateReadabilityGrade(text) {
  try {
    if (typeof text !== 'string' || text.trim() === "") {
      throw new Error("Invalid input text for readability analysis.");
    }

    const fleschScore = fleschReadingEase(text);
    const kincaidScore = fleschKincaidGradeLevel(text);
    const fogIndexScore = gunningFogIndex(text);

    const averageScore = (fleschScore / 10 + kincaidScore + fogIndexScore) / 3;

    let grade;
    if (averageScore >= 17) grade = "A"; 
    else if (averageScore >= 13) grade = "B"; 
    else if (averageScore >= 10) grade = "C"; 
    else if (averageScore >= 8) grade = "D"; 
    else if (averageScore >= 6) grade = "E"; 
    else grade = "F"; 

    log(logLevels.INFO, "Readability Grades:", {
      flesch: fleschScore,
      kincaid: kincaidScore,
      fogIndex: fogIndexScore,
      averageGrade: grade
    });

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