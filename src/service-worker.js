function setupContextMenu() {
  chrome.contextMenus.create({
    id: "gradeThisText",
    title: "Grade this Text",
    contexts: ["selection", "page"]
  });
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
  // Store the last word in chrome.storage.session.
  chrome.storage.session.set({ lastWord: data.selectionText }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error setting lastWord:", chrome.runtime.lastError);
    }
  });

  // Make sure the side panel is open.
  chrome.sidePanel.open({ tabId: tab.id }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error opening side panel:", chrome.runtime.lastError);
    }
  });
});

// Consolidate message listeners
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getWord") {
    chrome.storage.session.get("lastWord", (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error getting lastWord:", chrome.runtime.lastError);
        sendResponse(null);
      } else {
        sendResponse(result.lastWord);
      }
    });
    return true; // Keep the message channel open for sendResponse
  }
});

// Handle the content script message.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getWord") {
    chrome.tabs.sendMessage(sender.tab.id, { action: "getWord" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message to tab:", chrome.runtime.lastError);
        sendResponse(null);
      } else {
        sendResponse(response);
      }
    });
    return true; // Keep the message channel open for sendResponse
  }
});

// Handle the background script message.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getWord") {
    chrome.storage.local.get("lastWord", (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error getting lastWord from local storage:", chrome.runtime.lastError);
        sendResponse(null);
      } else {
        sendResponse(result.lastWord);
      }
    });
    return true; // Keep the message channel open for sendResponse
  }
});