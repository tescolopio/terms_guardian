/**
 * @file utilities.js
 * @description This script contains utility functions used by other scripts in the web browser extension.
 * @contributors {tescolopio}
 * @version 1.0.0
 * @date 2024-09-21
 * 
 * @author Timmothy Escolopio
 * @company 3D Tech Solutions LLC
 * 
 * @changes
 *  - 2024-09-18 | tescolopio | Initial creation of the script.
 * 
 */

import { log, logLevels } from './debugger.js';
import legalTerms from './legalTerms.js';

// Function to show a notification
export function showNotification(message) {
    log(logLevels.INFO, `Showing notification: ${message}`);
  
    const notificationOptions = {
      type: "basic",
      title: "Terms Guardian",
      message: message,
      iconUrl: "images/icon48.png"
    };
    chrome.notifications.create(notificationOptions, (notificationId) => {
      log(logLevels.INFO, `Notification created with ID: ${notificationId}`);
    });
}

// Function to check if the text contains any legal term
export function containsLegalTerm(text) {
    log(logLevels.DEBUG, `Checking for exact legal term match in text: ${text}`);
    const result = legalTerms.some(keyword => text.includes(keyword));
    log(logLevels.DEBUG, `Exact match result: ${result}`);
    return result;
  }
  
// Function to check if the text contains a partial match using regular expressions
export function containsPartialMatch(text) {
    log(logLevels.DEBUG, `Checking for partial legal term match in text: ${text}`);
    const regex = new RegExp(legalTerms.join("|"), "i"); // Case-insensitive
    const result = regex.test(text);
    log(logLevels.DEBUG, `Partial match result: ${result}`);
    return result;
  }
  
// Function to check if the text contains a proximity match of keywords
export function containsProximityMatch(text) {
    log(logLevels.DEBUG, `Checking for proximity match in text: ${text}`);
    const proximityThreshold = 5; // Adjust based on desired word distance
  
    for (let i = 0; i < legalTerms.length - 1; i++) {
      const keyword1 = legalTerms[i];
      const keyword1Index = text.indexOf(keyword1);
  
      if (keyword1Index !== -1) { // Only proceed if the first keyword is found
        for (let j = i + 1; j < legalTerms.length; j++) {
          const keyword2 = legalTerms[j];
          const keyword2Index = text.indexOf(keyword2);
  
          if (keyword2Index !== -1) {
            const distance = Math.abs(keyword1Index - keyword2Index);
  
            if (distance <= proximityThreshold) {
              log(logLevels.DEBUG, `Proximity match found between "<span class="math-inline">\{keyword1\}" and "</span>{keyword2}" with distance ${distance}`);
              return true;
            }
          }
        }
      }
    }
  
    log(logLevels.DEBUG, "No proximity match found.");
    return false;
}

// Function to extract the domain from a URL 
export function extractDomain(url) {
  const domainMatch = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im);
  return domainMatch && domainMatch[1];
}

// Function to update the extension badge
export function updateExtensionIcon(showExclamation) {
  if (showExclamation) {
    log(logLevels.INFO, "Setting badge text to '!'.");
    chrome.action.setBadgeText({ text: "!" });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000" }); // Optional: Set badge background color
  } else {
    log(logLevels.INFO, "Clearing badge text.");
    chrome.action.setBadgeText({ text: "" });
  }
}

// Function to update the sidepanel
export function updateSidepanel(content) {
  log(logLevels.INFO, `Updating sidepanel with content: ${JSON.stringify(content)}`);
  // Get the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    // Send a message to the content script to update the sidepanel
    chrome.tabs.sendMessage(activeTab.id, { type: "updateSidepanel", content: content });
  });
}