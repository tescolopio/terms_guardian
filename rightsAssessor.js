/**
 * rightsAssessor.js
 * Implements the rights assessment logic using a TensorFlow.js model.
 */

// Load your pre-trained TensorFlow.js model 
// (Assuming you have a model named 'rightsAssessmentModel' saved somewhere accessible)
import * as tf from '@tensorflow/tfjs'; // Import TensorFlow.js if not already imported

// Load your pre-trained TensorFlow.js model (replace with actual path later)
const model = await tf.loadLayersModel('path/to/your/rightsAssessmentModel.json');

/**
 * Chunks a given text into smaller segments for easier processing.
 * @param {string} text The text to be chunked.
 * @param {number} chunkSize The desired size of each chunk (in characters).
 * @return {Array<string>} An array of text chunks.
 */
function chunkText(text, chunkSize = 500) { 
    try {
      console.log("Chunking text with chunk size:", chunkSize);
  
      const chunks = [];
      for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
      }
  
      console.log("Number of chunks created:", chunks.length);
      // You could optionally log a few sample chunks here if needed for debugging
  
      return chunks;
    } catch (error) {
      console.error("Error in chunkText:", error);
      // Handle the error gracefully, perhaps by returning an empty array or a single chunk with the whole text
      return [text]; 
    }
}

/**
 * Preprocesses text before feeding it to the model, potentially splitting into paragraphs first.
 * @param {string} text The text to preprocess.
 * @param {boolean} splitIntoParagraphs Whether to split the text into paragraphs before processing.
 * @return {tf.Tensor[]} An array of TensorFlow.js tensors, each representing a preprocessed text chunk (paragraph or whole text).
 */
function preprocessText(text, splitIntoParagraphs = true) {
    try {
      const textChunks = splitIntoParagraphs ? text.split('\n\n') : [text];
      console.log("Preprocessing", textChunks.length, "text chunks.");
  
      const preprocessedChunks = textChunks.map(chunk => {
        console.log("Processing chunk:", chunk); 
  
        const tokens = tokenizer.tokenize(chunk);
        console.log("Tokens:", tokens);
  
        const encoded = tokens.map(token => {
          const embedding = wordEmbeddings.lookup(token);
          return embedding ? embedding.arraySync() : [0]; 
        }).flat();
        console.log("Encoded tokens:", encoded);
  
        const padded = encoded.length > maxLength 
          ? encoded.slice(0, maxLength) 
          : [...encoded, ...Array(maxLength - encoded.length).fill(0)];
        console.log("Padded tokens:", padded);
  
        return tf.tensor2d([padded], [1, maxLength]); 
      });
  
      return preprocessedChunks;
    } catch (error) {
      console.error("Error in preprocessText:", error);
      // Handle the error gracefully, perhaps by returning an empty array or a single tensor with the whole text preprocessed
      return [preprocessText(text, false)]; // Fall back to not splitting into paragraphs
    }
}

/**
 * Identifies uncommon words in a text chunk and adds them to an array for definition lookup
 * @param {string} textChunk The text chunk to analyze
 * @param {Array<string>} uncommonWords An array to store the identified uncommon words
 */
function identifyUncommonWordsInChunk(textChunk, uncommonWords) {
    try {
      console.log("Identifying uncommon words in chunk:", textChunk);
  
      const words = textChunk.split(/\s+/).map(word => word.toLowerCase().replace(/[^a-z]/g, '')); 
  
      for (const word of words) {
        if (!commonWords.includes(word) && !uncommonWords.includes(word)) { 
          console.log("Uncommon word found:", word);
          uncommonWords.push(word);
        }
      }
    } catch (error) {
      console.error("Error in identifyUncommonWordsInChunk:", error);
      // You might not need specific error handling here, as it's unlikely to fail critically
    }
  }

/**
 * Identifies uncommon words in a text and provides their definitions
 * @param {string} text The text to analyze
 * @return {Promise<Array<object>>} A promise that resolves to an array of objects, each containing an uncommon word and its definition
 */
export async function identifyUncommonWords(text) {
    try {
      const words = text.split(/\s+/).map(word => word.toLowerCase().replace(/[^a-z]/g, ''));
      console.log("Extracted and normalized words:", words); // Log the extracted words
  
      const uncommonWords = [];
  
      for (const word of words) {
        if (!commonWords.includes(word)) {
          console.log("Uncommon word found:", word); // Log each uncommon word
  
          let definition = legalTermsDefinitions[word];
  
          if (!definition) {
            console.log("Fetching definition from LexPredict for:", word); // Log the word being looked up
            definition = await fetchDefinitionFromLexPredict(word);
          }
  
          if (definition) {
            console.log("Definition found:", definition); // Log the found definition
            uncommonWords.push({ word, definition });
          } else {
            console.warn("No definition found for:", word); // Log a warning if no definition is found
          }
        }
      }
  
      console.log("Uncommon words with definitions:", uncommonWords); // Log the final result
  
      return uncommonWords;
    } catch (error) {
      console.error("Error in identifyUncommonWords:", error); // Log any errors that occur
      // You might want to handle the error more gracefully here,
      // e.g., by returning an empty array or showing an error message to the user
      return []; 
    }
}

/**
 * Analyzes text using a placeholder logic and identifies uncommon words
 * @param {string} text The text to analyze.
 * @return {Promise<object>} A promise that resolves to an object containing a placeholder rights retention score and uncommon words
 */
export async function analyzeContentWithTensorFlow(text) {
    try {
      const uncommonWords = [];
  
      // Preprocess the text, potentially splitting into paragraphs
      const preprocessedChunks = preprocessText(text, true); 
  
      // Placeholder for accumulating scores from each chunk
      let totalScore = 0;
  
      // Iterate over the preprocessed chunks (paragraphs or whole text)
      for (const chunkTensor of preprocessedChunks) {
        // Identify uncommon words in the chunk (before preprocessing)
        const originalChunkText = chunkTensor.dataSync().join(' ');
        console.log("Analyzing chunk:", originalChunkText); // Log the chunk being analyzed
        identifyUncommonWordsInChunk(originalChunkText, uncommonWords); 
  
        // Placeholder rights score calculation for each chunk 
        const chunkScore = Math.random(); 
        console.log("Chunk score:", chunkScore); // Log the calculated score for the chunk
        totalScore += chunkScore;
      }
  
      const averageScore = totalScore / preprocessedChunks.length;
      console.log("Average rights score:", averageScore); // Log the final average score
  
      // Fetch definitions for the uncommon words 
      const uncommonWordsWithDefinitions = await Promise.all(
        uncommonWords.map(async word => {
          console.log("Fetching definition for:", word); // Log the word being looked up
          const definition = await fetchDefinitionFromLexPredict(word);
          return { word, definition };
        })
      );
  
      console.log("Uncommon words with definitions:", uncommonWordsWithDefinitions); // Log the results
  
      return {
        rightsScore: averageScore, 
        uncommonWords: uncommonWordsWithDefinitions.filter(item => item.definition !== null) 
      };
    } catch (error) {
      console.error("Error in analyzeContentWithTensorFlow:", error); // Log any errors that occur
      // You might want to handle the error more gracefully here, 
      // e.g., by returning a default value or showing an error message to the user
      return {
        rightsScore: 0.5, // Default score in case of error
        uncommonWords: []
      };
    }
  }

/**
 * Fetches a definition from the LexPredict API
 * @param {string} word The word to fetch the definition for
 * @return {Promise<string|null>} A promise that resolves to the definition or null if not found
 */
async function fetchDefinitionFromLexPredict(word) {
    const apiUrl = `https://api.lexpredict.com/v1/dictionary/legal/common-law/${word}`;
  
    try {
      console.log(`Fetching definition for '${word}' from LexPredict...`); // Log the word being fetched
  
      const response = await fetch(apiUrl);
  
      if (!response.ok) { // Check if the response status is OK (200-299)
        console.error(`LexPredict API returned an error: ${response.status} ${response.statusText}`);
        throw new Error(`LexPredict API returned an error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("LexPredict API response data:", data); // Log the raw API response data
  
      if (data && data.definitions && data.definitions.length > 0) {
        const definition = data.definitions[0];
        console.log(`Definition found for '${word}':`, definition); // Log the found definition
        return definition; 
      } else {
        console.warn(`No definition found for '${word}' in LexPredict.`); // Log a warning if no definition is found
        return null; 
      }
    } catch (error) {
      console.error('Error fetching definition from LexPredict:', error);
      // You might want to handle specific error types here, e.g., network errors or JSON parsing errors
      return null;
    }
  }