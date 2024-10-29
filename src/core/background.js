/**
 * @file background.js
 * @description This script handles background tasks for the Chrome extension, including processing Terms of Service (ToS) text, managing notifications, and updating the extension's side panel.
 * @contributors {tescolopio}
 * @version 1.1.0
 * @date 2024-09-27
 * 
 * @author Timmothy Escolopio
 * @company 3D Tech Solutions LLC
 * 
 * @changes
 *  - 2024-09-18 | tescolopio | Initial creation of the script.
 *  - 2024-09-21 | tescolopio | Moved functionality from background.js to utilities.js and content.js for better separation of concerns.
 *  - 2024-09-27 | tescolopio | Modified to work with Chrome extension background script environment.
 */

// Object to keep track of domains that have been notified 
const notifiedDomains = {};

// Load Cheerio
let cheerio;
importScripts('node_modules/cheerio/lib/cheerio.min.js');
cheerio = self.cheerio;

// Handle messages from content.js 
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  log(logLevels.DEBUG, 'Received message in background.js:', message);

  if (message.action === "showNotification" && message.agreementDetected) {
    handleShowNotification(message, sender);
  } else if (message.action === "checkNotification") { 
    handleCheckNotification(message, sender, sendResponse);
    return true; // Indicates that the response is sent asynchronously
  } else if (message.type === "tosDetected") {
    handleTosDetected(message, sender);
  } else if (message.type === "legalTextNotFound") {
    handleLegalTextNotFound();
  } else if (message.type === "sidepanelOpened") {
    handleSidepanelOpened();
  }
});

function handleCheckNotification(message, sender, sendResponse) { 
  log(logLevels.DEBUG, 'Received checkNotification message:', message);
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    log(logLevels.DEBUG, 'Active tabs:', tabs);
    if (tabs && tabs.length > 0) {
      const domain = extractDomain(tabs[0].url);
      log(logLevels.DEBUG, 'Checking notification for domain:', domain);
      sendResponse({shouldShow: notifiedDomains[domain] || false});
    } else {
      log(logLevels.ERROR, 'No active tab found');
      sendResponse({shouldShow: false, error: 'No active tab found'});
    }
  });
}

async function handleTosDetected(message, sender) {
  const tosText = message.text;
  log(logLevels.INFO, `ToS text detected: ${tosText.substring(0, 100)}...`);
  
  try {
    const $ = cheerio.load(tosText);
    
    const summary = summarizeTos($);
    log(logLevels.INFO, `ToS summary: ${summary.substring(0, 100)}...`);
  
    const readabilityGrades = calculateReadabilityGrade(tosText); 
    log(logLevels.INFO, `Readability grades: ${JSON.stringify(readabilityGrades)}`);
  
    const rightsAssessment = await analyzeContentWithTensorFlow(tosText); 
    log(logLevels.INFO, `Rights assessment: ${JSON.stringify(rightsAssessment)}`);
  
    const uncommonWords = identifyUncommonWords(tosText);
    log(logLevels.INFO, `Uncommon words: ${JSON.stringify(uncommonWords)}`);
  
    updateSidepanel({
      summary,
      readabilityGrades,
      rightsAssessment,
      uncommonWords
    });

    await chrome.storage.local.set({ [`analysisResults_${sender.tab.id}`]: {
      summary,
      readabilityGrades,
      rightsAssessment,
      uncommonWords
    }});
    
    updateExtensionIcon(true); 
  } catch (error) {
    log(logLevels.ERROR, `Error processing ToS text: ${error.message}`);
    updateSidepanel({ error: 'An error occurred while processing the text. Please try again.' });
  }
}

function handleLegalTextNotFound() {
  log(logLevels.INFO, "Legal text not found.");
  showNotification("Not enough legal text found.");
  updateExtensionIcon(false);
}

function handleSidepanelOpened() {
  log(logLevels.INFO, "Sidepanel opened. Updating sidepanel with prompt.");
  updateSidepanel("This page doesn't appear to be a legal agreement. Do you want to proceed with grading the text on the page?");
}

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

chrome.action.onClicked.addListener(async (tab) => {
  log(logLevels.INFO, 'Extension icon clicked');

  await chrome.sidePanel.open({ tabId: tab.id }); 

  const storedResults = await chrome.storage.local.get(`analysisResults_${tab.id}`);

  if (storedResults && storedResults[`analysisResults_${tab.id}`]) {
    updateSidepanel(storedResults[`analysisResults_${tab.id}`]);
  } else {
    const [legalTermCountResult] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const elements = document.querySelectorAll('a, p, h1, h2, h3, h4, h5, h6');
        let legalTermCount = 0;
        elements.forEach(element => {
          const text = element.textContent.toLowerCase();
          if (window.legalTerms.some(keyword => text.includes(keyword))) {
            legalTermCount++;
          }
        });
        return legalTermCount;
      }
    });

    if (legalTermCountResult.result < 10) {
      updateSidepanel({ state: 'informational' }); 
    } else {
      updateSidepanel({ error: 'No analysis has been performed yet. Please trigger the analysis from the notification or context menu.' }); 
    }
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "gradeThisText") {
    log(logLevels.INFO, "Context menu item 'gradeThisText' clicked.", { info, tab });
    
    chrome.tabs.sendMessage(tab.id, { type: "gradeText" }, (response) => {
      if (chrome.runtime.lastError) {
        log(logLevels.ERROR, "Error sending message to content script.", chrome.runtime.lastError);
      } else {
        log(logLevels.DEBUG, "Message sent to content script successfully.", response);
      }
    });
  }
});

// Initialize context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "gradeThisText",
    title: "Grade this text",
    contexts: ["selection"]
  });
});