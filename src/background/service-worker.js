/**
 * @file service-worker.js
 * @description Service worker for the Chrome extension, handling all background operations
 * @version 1.2.0
 * @date 2024-09-28
 */

(function(global) {
  'use strict';

  function createServiceWorker({ log, logLevels }) {
    // Get constants
    const { 
      STORAGE_KEYS, 
      CONTEXT_MENU, 
      MESSAGES, 
      DETECTION,
      EXTENSION 
    } = global.Constants;

    // State management
    const state = {
      notifiedDomains: new Map(),
      analysisInProgress: new Set(),
      initialized: false
    };

    /**
     * Sets up the context menu
     */
    function setupContextMenu() {
      try {
        chrome.contextMenus.create(CONTEXT_MENU.GRADE_TEXT);
        log(logLevels.INFO, "Context menu created successfully");
      } catch (error) {
        log(logLevels.ERROR, "Error creating context menu:", error);
      }
    }

    /**
     * Shows a notification to the user
     * @param {string} message Notification message
     */
    function showNotification(message) {
      const notificationOptions = {
        type: "basic",
        title: EXTENSION.NAME,
        message: message,
        iconUrl: EXTENSION.ICON_PATHS.MEDIUM
      };

      chrome.notifications.create(notificationOptions, (notificationId) => {
        log(logLevels.INFO, `Notification created with ID: ${notificationId}`);
      });
    }

    /**
     * Handles context menu clicks
     * @param {Object} data Click data
     * @param {Object} tab Current tab
     */
    async function handleContextMenuClick(data, tab) {
      try {
        log(logLevels.INFO, "Context menu clicked", { 
          selection: data.selectionText?.substring(0, 100),
          tabId: tab.id 
        });

        // Store selection and open side panel in parallel
        await Promise.all([
          storeAnalysisData(STORAGE_KEYS.LAST_WORD, data.selectionText),
          openSidePanel(tab.id)
        ]);

        log(logLevels.INFO, "Context menu actions completed successfully");
      } catch (error) {
        log(logLevels.ERROR, "Error handling context menu click:", error);
        showNotification(MESSAGES.ERROR.GENERAL);
      }
    }

    /**
     * Stores analysis data
     * @param {string} key Storage key
     * @param {any} data Data to store
     */
    async function storeAnalysisData(key, data) {
      try {
        await chrome.storage.local.set({ [key]: data });
        log(logLevels.INFO, `Data stored successfully for key: ${key}`);
      } catch (error) {
        log(logLevels.ERROR, "Error storing data:", error);
        throw error;
      }
    }

    /**
     * Opens the side panel
     * @param {number} tabId Tab ID
     */
    async function openSidePanel(tabId) {
      try {
        await chrome.sidePanel.open({ tabId });
        log(logLevels.INFO, "Side panel opened successfully");
      } catch (error) {
        log(logLevels.ERROR, "Error opening side panel:", error);
        throw error;
      }
    }

    /**
     * Handles message routing
     * @param {Object} message Message object
     * @param {Object} sender Sender information
     * @param {Function} sendResponse Response callback
     */
    async function handleMessage(message, sender, sendResponse) {
      log(logLevels.DEBUG, "Message received:", message);

      try {
        switch (message.action) {
          case 'getWord':
            const result = await chrome.storage.local.get(STORAGE_KEYS.LAST_WORD);
            sendResponse({ lastWord: result[STORAGE_KEYS.LAST_WORD] });
            break;

          case 'tosDetected':
            await handleTosDetected(message, sender);
            sendResponse({ success: true });
            break;

          case 'checkNotification':
            const response = await handleCheckNotification(sender.tab);
            sendResponse(response);
            break;

          default:
            log(logLevels.WARN, "Unknown message action:", message.action);
            sendResponse({ error: MESSAGES.ERROR.UNKNOWN_ACTION });
        }
      } catch (error) {
        log(logLevels.ERROR, "Error handling message:", error);
        sendResponse({ error: error.message });
      }
    }

    /**
     * Handles ToS detection
     * @param {Object} message Message containing ToS data
     * @param {Object} sender Sender information
     */
    async function handleTosDetected(message, sender) {
      const tabId = sender.tab.id;
      
      if (state.analysisInProgress.has(tabId)) {
        log(logLevels.INFO, "Analysis already in progress for tab:", tabId);
        return;
      }

      try {
        state.analysisInProgress.add(tabId);
        
        const results = await analyzeContent(message.text);
        
        // Store results
        await storeAnalysisData(
          `${STORAGE_KEYS.ANALYSIS_RESULTS}_${tabId}`,
          {
            ...results,
            timestamp: new Date().toISOString()
          }
        );

        // Show notification
        showNotification(MESSAGES.AUTO_GRADE);
        
        log(logLevels.INFO, "ToS analysis completed successfully");
      } catch (error) {
        log(logLevels.ERROR, "Error analyzing ToS:", error);
        showNotification(MESSAGES.ERROR.ANALYSIS_FAILED);
        throw error;
      } finally {
        state.analysisInProgress.delete(tabId);
      }
    }

    /**
     * Handles check notification requests
     * @param {Object} tab Tab information
     * @returns {Object} Notification status
     */
    async function handleCheckNotification(tab) {
      try {
        const domain = new URL(tab.url).hostname;
        return {
          shouldShow: state.notifiedDomains.has(domain),
          domain: domain
        };
      } catch (error) {
        log(logLevels.ERROR, "Error checking notification status:", error);
        return { shouldShow: false, error: error.message };
      }
    }

    /**
     * Analyzes content using available analyzers
     * @param {string} text Text to analyze
     */
    async function analyzeContent(text) {
      try {
        const [readability, rights, summary, uncommonWords] = await Promise.all([
          global.ReadabilityGrader.create({ log, logLevels }).calculateReadabilityGrade(text),
          global.RightsAssessor.create({ log, logLevels }).analyzeContent(text),
          global.TosSummarizer.create({ log, logLevels }).summarizeTos(text),
          global.UncommonWordsIdentifier.create({ log, logLevels }).identifyUncommonWords(text)
        ]);

        return {
          readability,
          rights,
          summary,
          uncommonWords
        };
      } catch (error) {
        log(logLevels.ERROR, "Error in content analysis:", error);
        throw error;
      }
    }

    /**
     * Initializes the service worker
     */
    function initialize() {
      if (state.initialized) {
        log(logLevels.WARN, "Service worker already initialized");
        return;
      }

      // Set up error handling
      self.addEventListener('error', (event) => {
        log(logLevels.ERROR, 'Uncaught error:', event.error);
      });

      // Set up event listeners
      chrome.runtime.onInstalled.addListener(() => {
        setupContextMenu();
        log(logLevels.INFO, "Extension installed successfully");
      });

      chrome.contextMenus.onClicked.addListener(handleContextMenuClick);
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        handleMessage(message, sender, sendResponse);
        return true; // Keep message channel open
      });

      state.initialized = true;
      log(logLevels.INFO, "Service worker initialized successfully");
    }

    return {
      initialize,
      // Expose for testing
      _test: {
        handleMessage,
        handleContextMenuClick,
        handleTosDetected,
        analyzeContent
      }
    };
  }

  // Make it available globally
  global.ServiceWorker = {
    create: createServiceWorker
  };

})(typeof self !== 'undefined' ? self : global);

// Initialize the service worker
const serviceWorker = self.ServiceWorker.create({
  log: console.log,
  logLevels: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  }
});

serviceWorker.initialize();