/**
 * @file service-worker.js
 * @description Service worker for the Chrome extension, handling context menu setup, side panel operations, and message passing.
 * @version 1.1.0
 * @date 2024-09-28
 */

// Setup context menu
function setupContextMenu() {
  chrome.contextMenus.create({
    id: "gradeThisText",
    title: "Grade this Text",
    contexts: ["selection", "page"]
  });
}

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();
  window.log(window.logLevels.INFO, "Extension installed. Context menu set up.");
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((data, tab) => {
  window.log(window.logLevels.INFO, "Context menu clicked. Selection:", data.selectionText);

  // Store the selected text in chrome.storage.local
  chrome.storage.local.set({ lastWord: data.selectionText }, () => {
    if (chrome.runtime.lastError) {
      window.log(window.logLevels.ERROR, "Error setting lastWord:", chrome.runtime.lastError);
    } else {
      window.log(window.logLevels.INFO, "Last word stored successfully");
    }
  });

  // Open the side panel
  chrome.sidePanel.open({ tabId: tab.id }, () => {
    if (chrome.runtime.lastError) {
      window.log(window.logLevels.ERROR, "Error opening side panel:", chrome.runtime.lastError);
    } else {
      window.log(window.logLevels.INFO, "Side panel opened successfully");
    }
  });
});

// Consolidated message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  window.log(window.logLevels.INFO, "Message received:", request);

  if (request.action === "getWord") {
    chrome.storage.local.get("lastWord", (result) => {
      if (chrome.runtime.lastError) {
        window.log(window.logLevels.ERROR, "Error getting lastWord from local storage:", chrome.runtime.lastError);
        sendResponse({ error: "Failed to retrieve lastWord" });
      } else {
        window.log(window.logLevels.INFO, "Retrieved lastWord:", result.lastWord);
        sendResponse({ lastWord: result.lastWord });
      }
    });
    return true; // Keep the message channel open for sendResponse
  }
});

// Log any unhandled errors
self.addEventListener('error', function(event) {
  window.log(window.logLevels.ERROR, 'Uncaught error:', event.error);
});

window.log(window.logLevels.INFO, "Service worker initialized");