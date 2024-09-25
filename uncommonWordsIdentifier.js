/**
 * uncommonWordsIdentifier.js
 * Handles the identification and definition of uncommon words in legal texts.
 */

// Load a list of common English words (you'll need to provide this list)
import commonWords from './commonWords.js'; 

// You can also include a list of legal terms with their specific legal definitions
import legalTermsDefinitions from './legalTermsDefinitions.js'; 

/**
 * Identifies uncommon words in a text and provides their definitions
 * @param {string} text The text to analyze
 * @return {Array<object>} An array of objects, each containing an uncommon word and its definition
 */
export function identifyUncommonWords(text) {
  const words = text.split(/\s+/).map(word => word.toLowerCase().replace(/[^a-z]/g, '')); // Extract and normalize words
  const uncommonWords = [];

  for (const word of words) {
    if (!commonWords.includes(word)) {
      let definition = legalTermsDefinitions[word]; // Check for legal definition first

      if (!definition) {
        // If no legal definition, fetch definition from LexPredict API
        definition = await fetchDefinitionFromLexPredict(word); 
      }

      if (definition) { // Add to uncommonWords only if a definition was found
        uncommonWords.push({ word, definition });
      }
    }
  }

  return uncommonWords;
}

/**
 * Fetches a definition from the LexPredict API
 * @param {string} word The word to fetch the definition for
 * @return {Promise<string|null>} A promise that resolves to the definition or null if not found
 */
async function fetchDefinitionFromLexPredict(word) {
  const apiUrl = `https://api.lexpredict.com/v1/dictionary/legal/common-law/${word}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data && data.definitions && data.definitions.length > 0) {
      return data.definitions[0]; // Return the first definition 
    } else {
      return null; // No definition found
    }
  } catch (error) {
    console.error('Error fetching definition from LexPredict:', error);
    return null;
  }
}