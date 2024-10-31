/**
 * @file sidepanel.js
 * @description Manages the Terms Guardian analysis sidepanel UI
 * @version 2.0.0
 * @date 2024-10-29
 */

(function(global) {
  'use strict';

  function createSidepanel({ log, logLevels }) {
    const { SELECTORS, MESSAGES, CLASSES, DEBUG } = global.Constants;
    let currentContent = null;

    // Initialize debugging
    debug.startGroup(DEBUG.MODULES.SIDEPANEL);
    debug.startTimer('sidepanelInit');

    const state = {
      isLoading: false,
      isError: false,
      lastStatus: null
    };

    /**
     * DOM Element Cache
     */
    const elements = {
      content: document.getElementById('sidepanel-content'),
      termsUrl: document.getElementById('terms-url'),
      termsTitle: document.getElementById('terms-title'),
      readabilityGrade: document.getElementById('readability-grade'),
      userRightsIndex: document.getElementById('user-rights-index'),
      overallSummary: document.getElementById('overall-summary'),
      sectionSummaries: document.getElementById('section-summaries'),
      keyExcerptsList: document.getElementById('key-excerpts-list'),
      uncommonTermsList: document.getElementById('uncommon-terms-list'),
      statusMessage: document.getElementById('status-message'),
      loadingIndicator: document.querySelector('.loading-indicator')
    };

    /**
     * Message Handlers
     */
    const messageHandlers = {
      [MESSAGES.UPDATE_SIDEPANEL]: updateSidepanelContent,
      [MESSAGES.ANALYSIS_ERROR]: (error) => errorManager.handle(error, 'analysis'),
      [MESSAGES.CLEAR_PANEL]: clearPanel
    };

    /**
     * Loading State Management
     */
    const loadingManager = {
      start(message = 'Loading...') {
        debug.info('Starting loading state', { message });
        state.isLoading = true;
        elements.content.classList.add('loading');
        elements.loadingIndicator.textContent = message;
        elements.loadingIndicator.style.display = 'block';
      },

      update(message) {
        if (state.isLoading) {
          elements.loadingIndicator.textContent = message;
        }
      },

      end() {
        debug.info('Ending loading state');
        state.isLoading = false;
        elements.content.classList.remove('loading');
        elements.loadingIndicator.style.display = 'none';
      }
    };

    /**
     * Status Message Management
     */
    const statusManager = {
      show(message, type = 'info', duration = 5000) {
        debug.info('Showing status message', { message, type });
        
        state.lastStatus = { message, type };
        elements.statusMessage.textContent = message;
        elements.statusMessage.className = `status-message ${type}`;
        
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        
        this.timeout = setTimeout(() => {
          elements.statusMessage.className = 'status-message';
        }, duration);
      },

      clear() {
        elements.statusMessage.className = 'status-message';
        state.lastStatus = null;
      }
    };

    /**
     * Error Management
     */
    const errorManager = {
      handle(error, context = '') {
        debug.error(`Error in ${context}:`, error);
        
        state.isError = true;
        elements.content.classList.add('error');
        
        statusManager.show(
          error.message || 'An error occurred while processing your request',
          'error'
        );
        
        if (context) {
          const contextElement = document.querySelector(`.${context}`);
          if (contextElement) {
            contextElement.classList.add('error');
          }
        }
      },

      clear() {
        state.isError = false;
        elements.content.classList.remove('error');
        document.querySelectorAll('.error').forEach(el => {
          el.classList.remove('error');
        });
      }
    };

    /**
     * Content Update Functions
     */
    async function updateSection(sectionName, updateFn) {
      try {
        loadingManager.update(`Updating ${sectionName}...`);
        await updateFn();
      } catch (error) {
        errorManager.handle(error, sectionName);
      }
    }

    function updateDocumentInfo(info) {
      if (!info) return;
      elements.termsUrl.href = info.url;
      elements.termsUrl.textContent = info.url;
      elements.termsTitle.textContent = info.title;
    }

    function updateScores(scores) {
      if (!scores) return;
      elements.readabilityGrade.textContent = scores.readability?.grade || 'N/A';
      elements.userRightsIndex.textContent = scores.rights 
        ? `${(scores.rights * 100).toFixed(0)}%` 
        : 'N/A';
      
      updatePopupContent('readabilityPopup', scores.readability);
      updatePopupContent('rightsPopup', scores.rights);
    }

    function updateSummary(summary) {
      if (!summary) return;
      elements.overallSummary.textContent = summary;
    }

    function updateSections(sections) {
      elements.sectionSummaries.innerHTML = '';
      
      if (!sections?.length) {
        elements.sectionSummaries.innerHTML = "<p>No section summaries available.</p>";
        return;
      }

      sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.classList.add(CLASSES.SECTION_SUMMARY);
        sectionDiv.innerHTML = `
          <h3>${section.heading}</h3>
          <p>${section.summary}</p>
        `;
        elements.sectionSummaries.appendChild(sectionDiv);
      });
    }

    function updateExcerpts(excerpts) {
      elements.keyExcerptsList.innerHTML = '';
      
      if (!excerpts?.length) {
        elements.keyExcerptsList.innerHTML = "<p>No key excerpts found.</p>";
        return;
      }

      excerpts.forEach((excerpt, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `"${excerpt}"`;
        listItem.setAttribute('data-index', index + 1);
        elements.keyExcerptsList.appendChild(listItem);
      });
    }

    function updateTerms(terms) {
      elements.uncommonTermsList.innerHTML = '';
      
      if (!terms?.length) {
        elements.uncommonTermsList.innerHTML = "<p>No uncommon words found.</p>";
        return;
      }

      terms.forEach(item => {
        const termSpan = document.createElement('span');
        termSpan.textContent = item.word;
        termSpan.classList.add(CLASSES.UNCOMMON_TERM);
        termSpan.setAttribute('data-definition', item.definition);
        elements.uncommonTermsList.appendChild(termSpan);
      });
    }

    /**
     * Popup Management
     */
    function formatReadabilityPopup(data) {
      if (!data) return 'No readability data available';
      return `
        <p>Flesch Reading Ease: ${data.flesch.toFixed(1)}</p>
        <p>Flesch-Kincaid Grade Level: ${data.kincaid.toFixed(1)}</p>
        <p>Gunning Fog Index: ${data.fogIndex.toFixed(1)}</p>
      `;
    }

    function formatRightsPopup(data) {
      if (!data?.score) return 'No rights score available';
      const score = (data.score * 100).toFixed(0);
      return `
        <p>Rights Score: ${score}%</p>
        <p>This score indicates how well this document protects user rights and interests.</p>
      `;
    }

    function updatePopupContent(popupId, data) {
      const popup = document.getElementById(popupId);
      if (!popup) return;

      const content = popup.querySelector('.popup-content');
      if (!content) return;

      switch (popupId) {
        case 'readabilityPopup':
          content.innerHTML = formatReadabilityPopup(data);
          break;
        case 'rightsPopup':
          content.innerHTML = formatRightsPopup(data);
          break;
      }
    }

    function showPopup(popupId) {
      const popup = document.getElementById(popupId);
      if (popup) popup.style.display = 'block';
    }

    function hidePopup(popupId) {
      const popup = document.getElementById(popupId);
      if (popup) popup.style.display = 'none';
    }

    /**
     * Main Content Update
     */
    async function updateSidepanelContent(content) {
      debug.startTimer('updatePanel');
      
      try {
        loadingManager.start('Updating analysis...');
        errorManager.clear();
        elements.content.classList.add('updating');
        currentContent = content;

        await Promise.all([
          updateSection('documentInfo', () => updateDocumentInfo(content.documentInfo)),
          updateSection('scores', () => updateScores(content.scores)),
          updateSection('summary', () => updateSummary(content.summary)),
          updateSection('sections', () => updateSections(content.sections)),
          updateSection('excerpts', () => updateExcerpts(content.excerpts)),
          updateSection('terms', () => updateTerms(content.terms))
        ]);

        statusManager.show('Analysis complete', 'success');
        debug.info('Panel update complete');
      } catch (error) {
        errorManager.handle(error, 'panel-update');
      } finally {
        loadingManager.end();
        elements.content.classList.remove('updating');
        const duration = debug.endTimer('updatePanel');
        debug.info('Panel update duration', { duration });
      }
    }

    /**
     * Action Buttons Setup
     */
    function setupActionButtons() {
      const buttons = {
        contactBtn: () => window.open('mailto:support@termsguardian.com'),
        reportBtn: () => window.open('https://github.com/termsguardian/issues'),
        githubBtn: () => window.open('https://github.com/termsguardian'),
        feedbackBtn: () => window.open('https://termsguardian.com/feedback'),
        donateBtn: () => window.open('https://termsguardian.com/donate')
      };

      Object.entries(buttons).forEach(([id, handler]) => {
        const button = document.getElementById(id);
        if (button) {
          button.addEventListener('click', handler);
        }
      });
    }

    /**
     * Clear Panel
     */
    function clearPanel() {
      currentContent = null;
      elements.content.classList.remove('loading', 'updating', 'error');
      elements.sectionSummaries.innerHTML = '';
      elements.keyExcerptsList.innerHTML = '';
      elements.uncommonTermsList.innerHTML = '';
      statusManager.clear();
      errorManager.clear();
    }

    /**
     * Event Listeners Setup
     */
    function setupEventListeners() {
      // Popup handlers
      document.querySelectorAll('[data-popup]').forEach(element => {
        const popupId = element.dataset.popup;
        element.addEventListener('mouseenter', () => showPopup(popupId));
        element.addEventListener('mouseleave', () => hidePopup(popupId));
      });

      // Term and excerpt handlers
      document.addEventListener('mouseover', (event) => {
        const termSpan = event.target.closest(`.${CLASSES.UNCOMMON_TERM}`);
        if (termSpan) {
          const definition = termSpan.getAttribute('data-definition');
          showPopup(SELECTORS.POPUPS.TERMS);
          updatePopupContent(SELECTORS.POPUPS.TERMS, [{ word: termSpan.textContent, definition }]);
        }

        const excerptItem = event.target.closest(`#${SELECTORS.SIDEPANEL.KEY_EXCERPTS_LIST} li`);
        if (excerptItem) {
          const excerptIndex = excerptItem.getAttribute('data-index');
          showPopup(SELECTORS.POPUPS.EXCERPTS);
          updatePopupContent(SELECTORS.POPUPS.EXCERPTS, [currentContent.excerpts[excerptIndex - 1]]);
        }
      });

      document.addEventListener('mouseout', (event) => {
        const termSpan = event.target.closest(`.${CLASSES.UNCOMMON_TERM}`);
        if (termSpan) hidePopup(SELECTORS.POPUPS.TERMS);

        const excerptItem = event.target.closest(`#${SELECTORS.SIDEPANEL.KEY_EXCERPTS_LIST} li`);
        if (excerptItem) hidePopup(SELECTORS.POPUPS.EXCERPTS);
      });

      setupActionButtons();
    }

    // Initialize
    setupEventListeners();
    debug.endTimer('sidepanelInit');
    debug.endGroup();

    // Listen for messages
    chrome.runtime.onMessage.addListener((message) => {
      debug.info('Received message', { type: message.type });
      const handler = messageHandlers[message.type];
      if (handler) {
        handler(message.content);
      }
    });

    return {
      updateContent: updateSidepanelContent,
      loading: loadingManager,
      status: statusManager,
      error: errorManager,
      clearPanel,
      getState: () => ({ ...state, currentContent })
    };
  }

  // Export for Chrome extension environment
  if (typeof window !== 'undefined') {
    global.Sidepanel = {
      create: createSidepanel
    };
  }

})(typeof window !== 'undefined' ? window : global);

// Initialize the sidepanel
const sidepanel = global.Sidepanel.create({ 
  log: global.debug.log, 
  logLevels: global.debug.levels 
});