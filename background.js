/**
 * @file background.js
 * @description This script handles background tasks for the Chrome extension, including processing Terms of Service (ToS) text, managing notifications, and updating the extension's side panel. It listens for messages from content scripts, processes ToS text using various analysis functions, and updates the extension badge and side panel based on the analysis results. Additionally, it manages the state of notifications for different domains and handles user interactions with the extension's icon and context menu.
 * @contributors {tescolopio}
 * @version 1.0.0
 * @date 2024-09-21
 * 
 * @author Timmothy Escolopio
 * @company 3D Tech Solutions LLC
 * 
 * @changes
 *  - 2024-09-18 | tescolopio | Initial creation of the script.
 *  - 2024-09-21 | tescolopio | Moved functionality from background.js to utilities.js and content.js for better separation of concerns.
 */

// Import necessary modules
import { calculateReadabilityGrade } from './readabilityGrader.js'; 
import { analyzeContentWithTensorFlow } from './rightsAssessor.js'; 
import { summarizeTos } from './summarizeTos.js';
import { load } from './node_modules/cheerio/lib/cheerio.min.js';
import { log, logLevels } from './debugger.js';
import { identifyUncommonWords } from './uncommonWordsIdentifier.js';
import { updateSidepanel } from './sidepanel.js';
import { showNotification, updateExtensionIcon, extractDomain } from './utilities.js';
import { legalTerms } from './legalTerms.js';

// Object to keep track of domains that have been notified 
const notifiedDomains = {};

// Handle messages from content.js 
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  log(logLevels.DEBUG, 'Received message in background.js:', message); // Log all incoming messages

  if (message.action === "showNotification" && message.agreementDetected) {
    handleShowNotification(message, sender);
  } else if (message.action === "checkNotification") { 
    handleCheckNotification(message, sender, sendResponse);
  } else if (message.type === "tosDetected") {
    handleTosDetected(message);
  } else if (message.type === "legalTextNotFound") { // Use 'message' instead of 'request'
    handleLegalTextNotFound();
  } else if (message.type === "sidepanelOpened") {
    handleSidepanelOpened();
  }
});

// Function to handle checkNotification messages
function handleCheckNotification(message, sender, sendResponse) { 
  log(logLevels.DEBUG, 'Received checkNotification message:', message);
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    log(logLevels.DEBUG, 'Active tabs:', tabs);
    if (tabs && tabs.length > 0) {
      const domain = extractDomain(tabs[0].url);
      log(logLevels.DEBUG, 'Checking notification for domain:', domain);
      sendResponse({shouldShow: notifiedDomains[domain] || false});
    } else {
      log(logLevels.ERROR, 'No active tab found'); // Use logLevels.ERROR for error logging
      sendResponse({shouldShow: false, error: 'No active tab found'});
    }
  });
  return true; 
}

// ToS text processing 
async function handleTosDetected(message) {
  const tosText = message.text;
  log(logLevels.INFO, `ToS text detected: ${tosText}`);
  
  // Load Cheerio and then proceed with the analysis
  load(tosText).then(async $ => {  // Use await inside the .then callback
    // 1. Summarize the ToS text using Cheerio for section identification
    const summary = summarizeTos($);
    log(logLevels.INFO, `ToS summary: ${summary}`);
  
    // 2. Calculate readability grades 
    const readabilityGrades = calculateReadabilityGrade(tosText); 
    log(logLevels.INFO, `Readability grades: ${JSON.stringify(readabilityGrades)}`);
  
    // 3. Assess rights retention (assuming analyzeContentWithTensorFlow is async)
    const rightsAssessment = await analyzeContentWithTensorFlow(tosText); 
    log(logLevels.INFO, `Rights assessment: ${JSON.stringify(rightsAssessment)}`);
  
    // 4. Identify and define uncommon words
    const uncommonWords = identifyUncommonWords(tosText);
    log(logLevels.INFO, `Uncommon words: ${JSON.stringify(uncommonWords)}`);
  
    // 5. Update the sidepanel with the processed information
    updateSidepanel({
      summary,
      readabilityGrades,
      rightsAssessment,
      uncommonWords
    });

    // Store the analysis results in local storage
    await chrome.storage.local.set({ [`analysisResults_${sender.tab.id}`]: {
    summary,
    readabilityGrades,
    rightsAssessment,
    uncommonWords
  }});
  })
  .catch(error => {
    log(logLevels.ERROR, `Error loading or parsing ToS text with Cheerio: ${error}`);
    // Handle the error gracefully
  });
  
  updateExtensionIcon(true); 
}

// Function to handle legal text not found
function handleLegalTextNotFound() {
  log(logLevels.INFO, "Legal text not found.");
  showNotification("Not enough legal text found.");
  updateExtensionIcon(false);
}

// Function to handle sidepanel opened
function handleSidepanelOpened() {
  log(logLevels.INFO, "Sidepanel opened. Updating sidepanel with prompt.");
  updateSidepanel("This page doesn't appear to be a legal agreement. Do you want to proceed with grading the text on the page?");
}

// Clear notifications when tabs are closed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  chrome.tabs.query({}, (tabs) => {
    const activeDomains = new Set(tabs.map(tab => extractDomain(tab.url)));
    Object.keys(notifiedDomains).forEach(domain => {
      if (!activeDomains.has(domain)) {
        delete notifiedDomains[domain];
        log(logLevels.INFO, `Cleared notification status for domain: ${domain}`);
      }
    });
  });
});

// Handle extension icon clicks 
chrome.action.onClicked.addListener(async (tab) => {
  log(logLevels.INFO, 'Extension icon clicked');

  // Open the side panel
  await chrome.sidePanel.open({ tabId: tab.id }); 

  // Check if we have analysis results stored for the current tab
  const storedResults = await chrome.storage.local.get(`analysisResults_${tab.id}`);

  if (storedResults && storedResults[`analysisResults_${tab.id}`]) {
    // If we have stored results, display them in the side panel
    updateSidepanel(storedResults[`analysisResults_${tab.id}`]);
  } else {
    // Check if fewer than 10 legal terms were detected
    const legalTermCount = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const elements = document.querySelectorAll('a, p, h1, h2, h3, h4, h5, h6');
        let legalTermCount = 0;
        elements.forEach(element => {
          const text = element.textContent.toLowerCase();
          if (legalTerms.some(keyword => text.includes(keyword))) {
            legalTermCount++;
          }
        });
        return legalTermCount;
      }
    });

    if (legalTermCount[0].result < 10) {
      // If fewer than 10 terms, display the informational state
      updateSidepanel({ state: 'informational' }); 
    } else {
      // If 10 or more terms, but no analysis yet, display a prompt
      updateSidepanel({ error: 'No analysis has been performed yet. Please trigger the analysis from the notification or context menu.' }); 
    }
  }
});

// Listener for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "gradeThisText") {
    log(logLevels.INFO, "Context menu item 'gradeThisText' clicked.", { info, tab });
    
    // Send message to content.js to initiate detection
    chrome.tabs.sendMessage(tab.id, { type: "gradeText" }, (response) => {
      if (chrome.runtime.lastError) {
        log(logLevels.ERROR, "Error sending message to content script.", chrome.runtime.lastError);
      } else {
        log(logLevels.DEBUG, "Message sent to content script successfully.", response);
      }
    });
  }
});