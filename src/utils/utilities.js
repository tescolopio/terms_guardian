/**
 * @file utilities.js
 * @description This script contains utility functions used by other scripts in the web browser extension.
 * @contributors {tescolopio}
 * @version 1.1.0
 * @date 2024-09-22
 * 
 * @author Timmothy Escolopio
 * @company 3D Tech Solutions LLC
 * 
 * @changes
 *  - 2024-09-18 | tescolopio | Initial creation of the script.
 *  - 2024-09-22 | tescolopio | Modified to work with Chrome extension content scripts.
 * 
 */

(function(global) {
  'use strict';

  function createUtilities({ log, logLevels, legalTerms }) {
    // Get constants
    const { 
      DETECTION, 
      MESSAGES, 
      EXTENSION,
      CLASSES,
      API
    } = global.Constants;

    /**
     * Shows a notification
     * @param {string} message Notification message
     * @param {Object} options Additional notification options
     */
    function showNotification(message, options = {}) {
      log(logLevels.INFO, `Showing notification: ${message}`);

      const notificationOptions = {
        type: "basic",
        title: EXTENSION.NAME,
        message: message,
        iconUrl: EXTENSION.ICON_PATHS.MEDIUM,
        ...options
      };

      chrome.notifications.create(notificationOptions, (notificationId) => {
        log(logLevels.INFO, `Notification created with ID: ${notificationId}`);
      });
    }

    /**
     * Legal term detection functions
     */
    function containsLegalTerm(text) {
      log(logLevels.DEBUG, `Checking for exact legal term match in text: ${text}`);
      const result = legalTerms.some(keyword => text.includes(keyword));
      log(logLevels.DEBUG, `Exact match result: ${result}`);
      return result;
    }

    function containsPartialMatch(text) {
      if (!text) {
        return false;
      }
    
      try {
        log(logLevels.DEBUG, `Checking for partial legal term match in text: ${text}`);
        const regex = new RegExp(legalTerms.join("|"), "i");
        const result = regex.test(text);
        log(logLevels.DEBUG, `Partial match result: ${result}`);
        return result;
      } catch (error) {
        log(logLevels.ERROR, "Error in partial match check:", error);
        return false;
      }
    }

    function containsProximityMatch(text) {
      try {
        log(logLevels.DEBUG, `Checking for proximity match in text`);
        
        if (!text || typeof text !== 'string') {
          return false;
        }
    
        // Split text into words for more accurate proximity checking
        const words = text.toLowerCase().split(/\s+/);
        
        for (let i = 0; i < words.length; i++) {
          for (const term1 of legalTerms) {
            const term1Words = term1.toLowerCase().split(/\s+/);
            
            // Check if first word of term1 matches
            if (words[i] === term1Words[0]) {
              // Check if rest of term1 matches
              const term1Matches = term1Words.every((word, index) => 
                words[i + index] === word
              );
              
              if (term1Matches) {
                // Check for other terms within proximity
                const proximityStart = Math.max(0, i - DETECTION.THRESHOLDS.PROXIMITY);
                const proximityEnd = Math.min(words.length, i + term1Words.length + DETECTION.THRESHOLDS.PROXIMITY);
                
                // Look for another term within proximity range
                for (let j = proximityStart; j < proximityEnd; j++) {
                  for (const term2 of legalTerms) {
                    if (term2 !== term1) {
                      const term2Words = term2.toLowerCase().split(/\s+/);
                      if (words[j] === term2Words[0]) {
                        const term2Matches = term2Words.every((word, index) => 
                          words[j + index] === word
                        );
                        if (term2Matches) {
                          log(logLevels.DEBUG, `Proximity match found between "${term1}" and "${term2}"`);
                          return true;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
    
        log(logLevels.DEBUG, "No proximity match found");
        return false;
      } catch (error) {
        log(logLevels.ERROR, "Error in proximity match check:", error);
        return false;
      }
    }

    /**
     * URL and domain handling
     */
    function extractDomain(url) {
      try {
        if (!url || typeof url !== 'string') {
          return null;
        }
    
        // Remove protocol and www if present
        let domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
        
        // Get everything before the first slash, question mark, or hash
        domain = domain.split(/[/?#]/)[0];
        
        // Validate domain format
        if (/^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/.test(domain)) {
          return domain.toLowerCase();
        }
        
        return null;
      } catch (error) {
        log(logLevels.ERROR, "Error extracting domain:", error);
        return null;
      }
    }

    /**
     * UI update functions
     */
    function updateExtensionIcon(showExclamation) {
      try {
        chrome.action.setBadgeText({ 
          text: showExclamation ? "!" : "" 
        });
        
        if (showExclamation) {
          chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
        }

        log(logLevels.INFO, `Extension badge ${showExclamation ? 'set' : 'cleared'}`);
      } catch (error) {
        log(logLevels.ERROR, "Error updating extension icon:", error);
      }
    }

    function updateSidepanel(content) {
      try {
        log(logLevels.INFO, 'Updating sidepanel with content');
        
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs?.length) {
            throw new Error('No active tab found');
          }

          const activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, { 
            type: "updateSidepanel", 
            content: content 
          });
        });
      } catch (error) {
        log(logLevels.ERROR, "Error updating sidepanel:", error);
        showNotification(MESSAGES.ERROR.GENERAL);
      }
    }

    /**
     * Text highlighting functions
     */
    function highlightLegalTerms(element) {
      try {
        if (!element || !(element instanceof Element)) {
          throw new Error('Invalid element provided');
        }
    
        let count = 0;
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
    
        const nodesToReplace = [];
        let node;
        
        // First pass: collect nodes to replace
        while (node = walker.nextNode()) {
          const text = node.nodeValue;
          let hasMatch = false;
          let html = text;
    
          for (const term of legalTerms) {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            if (regex.test(text)) {
              hasMatch = true;
              count++;
              html = html.replace(regex, `<span class="${CLASSES.HIGHLIGHT}">$&</span>`);
            }
          }
    
          if (hasMatch) {
            nodesToReplace.push({ node, html });
          }
        }
    
        // Second pass: replace nodes
        for (const { node, html } of nodesToReplace) {
          const span = document.createElement('span');
          span.innerHTML = html;
          node.parentNode.replaceChild(span, node);
        }
    
        log(logLevels.DEBUG, `Highlighted ${count} legal terms`);
        return count;
      } catch (error) {
        log(logLevels.ERROR, "Error highlighting legal terms:", error);
        return 0;
      }
    }
    
    /**
     * Enhanced notification system with support for user interaction
     * @param {Object} options Notification options
     * @param {Function} callback Callback for user interaction
     */
    function showNotification(options = {}, callback = null) {
      const defaultOptions = {
        type: "basic",
        title: EXTENSION.NAME,
        iconUrl: EXTENSION.ICON_PATHS.MEDIUM,
        requireInteraction: false,
        buttons: []
      };

      const notificationOptions = {
        ...defaultOptions,
        ...options
      };

      // If we have a callback, we need to handle button clicks
      if (callback && notificationOptions.buttons?.length) {
        const notificationId = `notification_${Date.now()}`;
        
        // Store callback for later use
        chrome.storage.local.set({
          [`${notificationId}_callback`]: true
        });

        // Listen for button clicks
        chrome.notifications.onButtonClicked.addListener((clickedId, buttonIndex) => {
          if (clickedId === notificationId) {
            chrome.storage.local.remove(`${notificationId}_callback`);
            callback(buttonIndex === 0); // Pass true if first button clicked
            chrome.notifications.clear(notificationId);
          }
        });

        // Handle notification closing without button click
        chrome.notifications.onClosed.addListener((closedId) => {
          if (closedId === notificationId) {
            chrome.storage.local.remove(`${notificationId}_callback`);
            callback(false);
          }
        });

        // Create the notification with the generated ID
        chrome.notifications.create(notificationId, notificationOptions, (createdId) => {
          log(logLevels.INFO, `Interactive notification created with ID: ${createdId}`);
        });
      } else {
        // Create a simple notification without interaction
        chrome.notifications.create(notificationOptions, (notificationId) => {
          log(logLevels.INFO, `Notification created with ID: ${notificationId}`);
        });
      }
    }

    /**
     * Shows a confirmation dialog in the side panel
     * @param {string} message Message to display
     * @param {Function} callback Callback for user response
     */
    function showSidePanelConfirmation(message, callback) {
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs?.length) {
            throw new Error('No active tab found');
          }

          const activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, { 
            type: "showConfirmation", 
            message: message 
          }, callback);
        });
      } catch (error) {
        log(logLevels.ERROR, "Error showing side panel confirmation:", error);
        callback(false);
      }
    }

    /**
     * API interaction functions
     */
    async function fetchWithTimeout(url, options = {}) {
      const timeout = options.timeout || API.TIMEOUT;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
    
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        return response;
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timed out after ${timeout}ms`);
        }
        throw error;
      } finally {
        clearTimeout(id);
      }
    }

    return {
      showNotification,
      containsLegalTerm,
      containsPartialMatch,
      containsProximityMatch,
      extractDomain,
      updateExtensionIcon,
      updateSidepanel,
      highlightLegalTerms,
      fetchWithTimeout
    };
  }

  // Export for both Chrome extension and test environments
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createUtilities };
  } else {
    const utils = createUtilities({
      log: global.log,
      logLevels: global.logLevels,
      legalTerms: global.legalTerms
    });
    
    // Expose utilities globally
    Object.assign(global, utils);
  }

})(typeof window !== 'undefined' ? window : global);