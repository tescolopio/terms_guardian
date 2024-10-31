/**
 * @file content.js
 * @description This script is responsible for detecting legal terms on web pages, notifying the user, and updating the extension badge accordingly.
 * @contributors {tescolopio}
 * @version 1.1.0
 * @date 2024-09-26
 * 
 * @author Timmothy Escolopio
 * @company 3D Tech Solutions LLC
 * 
 * @changes
 *  - 2024-09-18 | tescolopio | Initial creation of the script.
 *  - 2024-09-21.01 | tescolopio | Moved functionality from background.js to content.js to update the extension badge based on the number of legal terms detected.
 *  - 2024-09-21.02 | tescolopio | Improved logging and error handling, updated code direction and sequence.
 *  - 2024-09-26 | tescolopio | Modified to work with Chrome extension content scripts and globally defined variables.
 */

(function(global) {
  'use strict';

  // Configuration
  class ContentController {
    constructor({ log, logLevels }) {
      const { DETECTION, MESSAGES, CLASSES } = global.Constants;
      this.DETECTION_INTERVAL = DETECTION.INTERVAL;
      this.THRESHOLDS = DETECTION.THRESHOLDS;
      this.MESSAGES = MESSAGES;
      this.HIGHLIGHT_CLASS = CLASSES.HIGHLIGHT;
      this.log = log;
      this.logLevels = logLevels;
      this.lastDetectionTime = 0;
      this.observer = null;
      
      // Initialize analyzers
      this.initializeAnalyzers();
    }

    /**
     * Initializes all analysis modules
     */
    initializeAnalyzers() {
      try {
        this.assessor = global.RightsAssessor.create({
          log: this.log,
          logLevels: this.logLevels,
          commonWords: global.commonWords,
          legalTermsDefinitions: global.legalTermsDefinitions
        });

        this.summarizer = global.TosSummarizer.create({
          compromise: global.compromise,
          cheerio: global.cheerio,
          log: this.log,
          logLevels: this.logLevels
        });

        this.extractor = global.TextExtractor.create({
          log: this.log,
          logLevels: this.logLevels,
          config: {
            highlightThreshold: 20,
            sectionThreshold: 10
          },
          legalTerms: global.legalTerms
        });

        this.identifier = global.UncommonWordsIdentifier.create({
          log: this.log,
          logLevels: this.logLevels,
          commonWords: global.commonWords,
          legalTermsDefinitions: global.legalTermsDefinitions,
          config: {
            minWordLength: 3,
            maxDefinitionRetries: 3
          }
        });

        this.log(this.logLevels.INFO, "All analyzers initialized successfully");
      } catch (error) {
        this.log(this.logLevels.ERROR, "Error initializing analyzers:", error);
        throw error;
      }
    }

    /**
     * Updates the extension icon
     * @param {boolean} showExclamation Whether to show the exclamation mark
     */
    updateExtensionIcon(showExclamation) {
      try {
        chrome.action.setBadgeText({ 
          text: showExclamation ? "!" : "" 
        });
        this.log(this.logLevels.INFO, `Extension badge ${showExclamation ? 'set' : 'cleared'}`);
      } catch (error) {
        this.log(this.logLevels.ERROR, "Error updating extension icon:", error);
      }
    }

    /**
     * Detects legal agreements in the document
     */
    async detectLegalAgreements() {
      if (Date.now() - this.lastDetectionTime < this.DETECTION_INTERVAL) {
        return;
      }
      this.lastDetectionTime = now;

      try {
        const extractionResult = await this.extractor.extractAndAnalyzePageText();
        
        if (extractionResult.error) {
          throw new Error(extractionResult.error);
        }

        const legalTermCount = extractionResult.metadata.legalTermCount;

        if (legalTermCount >= CONFIG.LEGAL_TERM_THRESHOLDS.AUTO_GRADE) {
          await this.handleHighLegalTermCount(extractionResult.text);
        } else if (legalTermCount > CONFIG.LEGAL_TERM_THRESHOLDS.NOTIFY) {
          this.handleModerateLegalTermCount();
        } else {
          this.updateExtensionIcon(false);
        }

        return legalTermCount >= CONFIG.LEGAL_TERM_THRESHOLDS.NOTIFY;
      } catch (error) {
        this.log(this.logLevels.ERROR, "Error detecting legal agreements:", error);
        return false;
      }
    }

    /**
     * Handles high legal term count detection
     * @param {string} text The extracted text
     */
    async handleHighLegalTermCount(text) {
      try {
        this.updateExtensionIcon(true);
        showNotification(this.NOTIFICATIONS.AUTO_GRADE);
        
        const analysis = await this.performFullAnalysis(text);
        chrome.runtime.sendMessage({ 
          type: "tosDetected", 
          text: text,
          analysis: analysis 
        });
      } catch (error) {
        this.log(this.logLevels.ERROR, "Error handling high legal term count:", error);
      }
    }

    /**
     * Handles moderate legal term count detection
     */
    handleModerateLegalTermCount() {
      this.updateExtensionIcon(true);
      showNotification(this.NOTIFICATIONS.SIGNIFICANT_TERMS);
    }

    /**
     * Performs full analysis of text
     * @param {string} text Text to analyze
     */
    async performFullAnalysis(text) {
      try {
        const [rightsAnalysis, uncommonWords] = await Promise.all([
          this.assessor.analyzeContent(text),
          this.identifier.identifyUncommonWords(text)
        ]);

        return {
          rights: rightsAnalysis,
          uncommonWords: uncommonWords,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        this.log(this.logLevels.ERROR, "Error performing full analysis:", error);
        throw error;
      }
    }

    /**
     * Initializes the content script
     */
    initialize() {
      this.detectLegalAgreements();

      this.observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            this.detectLegalAgreements();
          }
        });
      });

      this.observer.observe(document.body, { 
        childList: true, 
        subtree: true 
      });

      this.setupMessageListeners();
      this.log(this.logLevels.INFO, "Content script initialized");
    }

    /**
     * Sets up message listeners
     */
    setupMessageListeners() {
      chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
        if (request.type === "gradeText") {
          await this.handleGradeTextRequest();
        }
      });
    }

    /**
     * Handles grade text requests
     */
    async handleGradeTextRequest() {
      const selectedText = window.getSelection().toString();
      const hasEnoughLegalText = await this.detectLegalAgreements(selectedText);

      if (hasEnoughLegalText) {
        const analysis = await this.performFullAnalysis(selectedText);
        chrome.runtime.sendMessage({ 
          type: "tosDetected", 
          text: selectedText,
          analysis: analysis
        });
      } else {
        chrome.runtime.sendMessage({ type: "sidepanelOpened" });
      }
    }
  }

  // Initialize the content controller
  const controller = new ContentController({
    log: console.log,
    logLevels: {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => controller.initialize());
  } else {
    controller.initialize();
  }

})(typeof window !== 'undefined' ? window : global);