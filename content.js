/**
 * @file content.js
 * @description This script is responsible for detecting legal terms on web pages, notifying the user, and updating the extension badge accordingly.
 * @contributors {tescolopio}
 * @version 1.0.0
 * @date 2024-09-21
 * 
 * @author Timmothy Escolopio
 * @company 3D Tech Solutions LLC
 * 
 * @changes
 *  - 2024-09-18 | tescolopio | Initial creation of the script.
 *  - 2024-09-21.01 | tescolopio |Moved functionality from background.js to content.js to update the extension badge based on the number of legal terms detected.
 *  - 2024-09-21.02 | tescolopio | Improved logging and error handling, updated code direction and sequence.
 * 
 */

// Imports and Constants
import { log, logLevels } from './debugger.js';
import legalTerms from './legalTerms.js';
import { sendMessageToBackground, showNotification } from './background.js';
import { isLegalText } from './legalTextChecker.js';
import { sendMessageToBackground, showNotification, containsLegalTerm, containsPartialMatch, containsProximityMatch } from './utilities.js';

const DETECTION_INTERVAL = 5000; // 5 seconds interval
let lastDetectionTime = 0;

// Function to update the extension badge
function updateExtensionIcon(showExclamation) { //2024-09-21.01
  if (showExclamation) {
    log(logLevels.INFO, "Setting badge text to '!'.");
    chrome.action.setBadgeText({ text: "!" });
  } else {
    log(logLevels.INFO, "Clearing badge text.");
    chrome.action.setBadgeText({ text: "" });
  }
}

//Detection Function
/**
 * Detect legal agreements on the page
 */
function detectLegalAgreements() {
  const now = Date.now();
  log(logLevels.DEBUG, `Current time: ${now}, Last detection time: ${lastDetectionTime}`);

  if (now - lastDetectionTime < DETECTION_INTERVAL) {
    log(logLevels.DEBUG, 'Skipping detection due to interval');
    return; 
  }
  lastDetectionTime = now;

  const elements = document.querySelectorAll('a, p, h1, h2, h3, h4, h5, h6');
  log(logLevels.DEBUG, `Found ${elements.length} elements to check for legal terms`);

  let legalTermCount = 0;

  elements.forEach(element => {
    const text = element.textContent.toLowerCase();
    log(logLevels.DEBUG, `Checking element text: ${text}`);

    // Check for legal terms using all three functions
    if (containsLegalTerm(text) || containsPartialMatch(text) || containsProximityMatch(text)) {
      legalTermCount++;
      highlightLegalTerms(element);
    }
  });

  log(logLevels.INFO, `Total legal terms found: ${legalTermCount}`);

  if (legalTermCount >= 30) { 
    // Automatically grade and show notification
    log(logLevels.INFO, 'High number of legal terms detected, automatically grading and showing notification');
    const allText = document.body.innerText;
    sendMessageToBackground({ type: "tosDetected", text: allText });
    updateExtensionIcon(true);
    showNotification("Terms Guardian has detected a legal document and is currently grading it. Click the extension badge at the top of the browser to see the readability and how it effects your rights by agreeing to it. This is for educational purposes only and is not legal advice.");
  } else if (legalTermCount > 10 && legalTermCount < 30) { 
    // Notify user about significant number of legal terms
    log(logLevels.INFO, 'Significant number of legal terms detected, prompting user to grade or select text');
    showNotification("A significant number of legal terms have been found on this page, click the Terms Guardian Extension badge at the top of the screen to grade the text. If this is not a legal document like a Terms of Service you can still grade sections of text by selecting the text you want to grade and right clicking to bring up the context menu, then click 'grade this text' to learn more about it. This is for educational purposes only and is not legal advice."); 
    updateExtensionIcon(true);
  } else {
    log(logLevels.DEBUG, 'Not enough legal terms detected to trigger notification');
    updateExtensionIcon(false);
  }
}

// Initialization Function
// Initialize content script
function initContentScript() {
  log(logLevels.INFO, 'Initializing content script');
  
  detectLegalAgreements();
  log(logLevels.INFO, "Initial ToS detection completed.");

  // Observe DOM changes to detect dynamically loaded content
  const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
              try {
                  detectLegalAgreements();
              } catch (error) {
                  log(logLevels.ERROR, `Error detecting legal agreements: ${error.message}`, error.stack);
              }
          }
      });
  });

  try {
      observer.observe(document.body, { childList: true, subtree: true });
      log(logLevels.INFO, "MutationObserver set up to detect DOM changes.");
  } catch (error) {
      log(logLevels.ERROR, `Error observing DOM changes: ${error.message}`, error.stack);
  }
}

// Initialize the content script when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentScript);
} else {
  initContentScript();
}

// Highlighting Functions
/**
 * Highlights legal terms within a given element
 * @param {HTMLElement} element The element to search for and highlight legal terms within
 */
function highlightLegalTerms(element) {
  try {
    log(logLevels.DEBUG, `Highlighting legal terms in element: ${element.outerHTML}`);

    const text = element.textContent;
    log(logLevels.DEBUG, `Element text content: ${text}`);

    const regex = new RegExp(legalTerms.join('|'), 'gi'); // Case-insensitive, global search
    log(logLevels.DEBUG, `Regex for legal terms: ${regex}`);

    // Create a new element to hold the modified content
    const newContent = document.createElement('span');
    log(logLevels.DEBUG, 'Created new span element for modified content');

    // Split the text into parts, highlighting the matching legal terms
    text.split(regex).forEach(part => {
      log(logLevels.DEBUG, `Processing text part: ${part}`);
      if (legalTerms.includes(part.toLowerCase())) {
        log(logLevels.DEBUG, `Legal term found: ${part}`);
        const highlightSpan = document.createElement('span');
        highlightSpan.classList.add('legal-term-highlight');
        highlightSpan.textContent = part;
        newContent.appendChild(highlightSpan);
        log(logLevels.DEBUG, `Appended highlighted span for term: ${part}`);
      } else {
        newContent.appendChild(document.createTextNode(part));
        log(logLevels.DEBUG, `Appended text node for part: ${part}`);
      }
    });

    // Replace the original content with the highlighted version
    element.innerHTML = newContent.innerHTML;
    log(logLevels.DEBUG, `Replaced original element content with highlighted version`);
  } catch (error) {
    log(logLevels.ERROR, `Error highlighting legal terms in element: ${error.message}`);
  }
}

//Event Listeners
// Listen for messages from the background.js script
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  log(logLevels.DEBUG, "Received message from background.js:", request);
  if (request.type === "gradeText") {

    const selectedText = window.getSelection().toString();
    log(logLevels.DEBUG, "Selected text for grading:", selectedText);

    const hasEnoughLegalText = isLegalText(selectedText); // Store the result

    if (hasEnoughLegalText) {
      log(logLevels.INFO, "Enough legal text found in selection.");
      chrome.runtime.sendMessage({ type: "tosDetected", text: selectedText }); 
    } else {
      log(logLevels.INFO, "Not enough legal text found in selection.");

      // Check if the entire page has enough legal terms
      if (isLegalText(document.body.innerText)) { 
        log(logLevels.INFO, "Enough legal text found on the page. Asking user to confirm full-page grading.");
        showNotification("Terms Guardian has detected legal/contractual words on the page. Do you want to grade the entire page or just the selected text?", true, selectedText);
      } else {
        log(logLevels.INFO, "Not enough legal text found on the page either. Showing proceed prompt.");
        chrome.runtime.sendMessage({ type: "sidepanelOpened" }); 
      }
    }
  }
});