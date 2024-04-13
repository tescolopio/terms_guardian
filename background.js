/**
 * Logs a message to the console.
 * @param {string} message The message to log.
 */
function log(message) {
  console.log(message);
}

/**
 * Calculates the Flesch Reading Ease score of a text.
 * @param {string} text The text to calculate the score for.
 * @return {number} The Flesch Reading Ease score.
 */
function fleschReadingEase(text) {
  const sentenceLength = text.split(".").length;
  const wordCount = text.split(" ").length;
  const syllableCount = text.split(" ").reduce((total, word) => {
    return total + (word.match(/[aeiouy]/gi)? word.match(/[aeiouy]/gi).length : 0);
  }, 0);
  return 206.835 - 1.015 * (wordCount / sentenceLength) - 84.6 * (syllableCount / wordCount);
}

/**
 * Calculates the Flesch-Kincaid Grade Level of a text.
 * @param {string} text The text to calculate the score for.
 * @return {number} The Flesch-Kincaid Grade Level.
 */
function fleschKincaidGradeLevel(text) {
  const sentenceLength = text.split(".").length;
  const wordCount = text.split(" ").length;
  const syllableCount = text.split(" ").reduce((total, word) => {
    return total + (word.match(/[aeiouy]/gi)? word.match(/[aeiouy]/gi).length : 0);
  }, 0);
  return 0.39 * (wordCount / sentenceLength) + 11.8 * (syllableCount / wordCount) - 15.59;
}

/**
 * Calculates the Gunning Fog Index of a text.
 * @param {string} text The text to calculate the score for.
 * @return {number} The Gunning Fog Index.
 */
function gunningFogIndex(text) {
  const sentenceLength = text.split(".").length;
  const wordCount = text.split(" ").length;
  const complexWordCount = text.split(" ").reduce((total, word) => {
    return total + (word.match(/[aeiouy]/gi) && word.match(/[aeiouy]/gi).length >= 3? 1 : 0);
  }, 0);
  return 0.4 * ((wordCount / sentenceLength) + 100 * (complexWordCount / wordCount));
}

/**
 * Calculates the readability grade of a text.
 * @param {string} text The text to calculate the grade for.
 * @return {string} The readability grade.
 */
function calculateReadabilityGrade(text) {
  const fleschScore = fleschReadingEase(text);
  const kincaidScore = fleschKincaidGradeLevel(text);
  const fogIndexScore = gunningFogIndex(text);

  const averageScore = (fleschScore + kincaidScore + fogIndexScore) / 3;

  // This is a simple mapping to convert score to grade, needs refining
  if (averageScore > 90) return "A";
  else if (averageScore > 70) return "B";
  else if (averageScore > 50) return "C";
  else if (averageScore > 30) return "D";
  else return "F";
}

/**
 * Analyzes text using a TensorFlow.js model.
 * @param {string} text The text to analyze.
 * @return {string} The content grade.
 */
async function analyzeContentWithTensorFlow(text) {
  console.log("Analyzing content with TensorFlow.js...");
  const contentGrade = await modelHandler.analyzeText(text);
  return contentGrade;
}

/**
 * Stores analysis results in memory.
 * @param {object} results The analysis results.
 */
function storeAnalysisResults(results) {
  analysisResults = results;
}

/**
 * Retrieves analysis results from memory.
 * @return {object} The analysis results.
 */
function retrieveAnalysisResults() {
  return analysisResults;
}

/**
 * Creates a context menu item for grading a selected text.
 */
function createContextMenu() {
  chrome.contextMenus.create({
    id: "gradeAgreement",
    title: "Grade this Agreement",
    contexts: ["selection"]
  }, function() {
    if (chrome.runtime.lastError) {
      console.error("Error creating context menu:", chrome.runtime.lastError.message);
    } else {
      console.log("Context menu created successfully.");
    }
  });
}

/**
 * Listens for messages from other scripts or pages.
 * @param {object} request The message data.
 * @param {function} sendResponse A function for sending a response.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "analyzeText") {
    console.log("Received text for analysis.");
    if (!request.text) {
      console.error("No text provided for analysis.");
      sendResponse({ error: "No text provided for analysis." });
      return;
    }
    try {
      const textToAnalyze = request.text;
      const readabilityGrade = calculateReadabilityGrade(textToAnalyze);
      const contentGrade = await analyzeContentWithTensorFlow(textToAnalyze);
      const keyExcerpts = "This is a key excerpt from the agreement.";
      const reasons = "The agreement has clear terms and favors user rights.";

      const results = {
        clarityGrade: readabilityGrade,
        contentGrade: contentGrade,
        keyExcerpts: keyExcerpts,
        reasons: reasons
      };

      storeAnalysisResults(results);
      console.log("Analysis results stored.");
      sendResponse(results);
    } catch (error) {
      console.error("Error analyzing text:", error.message, error.stack);
      sendResponse({ error: "Error analyzing text. Please check the console for more details." });
    }
  } else if (request.action === "requestAnalysisResults") {
    console.log("Received request for analysis results.");

    if (Object.keys(analysisResults).length!== 0) {
      sendResponse(analysisResults);
      console.log("Analysis results sent from storage.");
    } else {
      sendResponse({
        error: "No analysis results available."
      });
      console.log("No stored analysis results found.");
    }
  }
  return true; // Indicates asynchronous response
});

/**
 * Listens for context menu clicks.
 * @param {object} info The click information.
 * @param {object} tab The active tab.
 */
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "gradeAgreement") {
    chrome.tabs.executeScript({
      code: "window.getSelection().toString();"
    }, function(selection) {
      const selectedText = selection[0];
      if (selectedText) {
        console.log("User agreement text selected.");
        chrome.runtime.sendMessage({ action: "analyzeText", text: selectedText });
      } else {
        console.log("No text selected.");
      }
    });
  }
});