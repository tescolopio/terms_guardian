// summarizeTos.js

import { getAnalysisResults } from './content.js';
import { log, logLevels } from './debugger.js';

// Assuming `content` is the analysis results object, you might need to import or define it
import content from './content.js'; // Adjust the import path as necessary

// Assuming `sidepanelContent` is a reference to a DOM element, you might need to define it
const sidepanelContent = document.getElementById('sidepanel-content'); // Adjust the element ID as necessary

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message) => {
  log(logLevels.INFO, `Received message: ${JSON.stringify(message)}`);
  if (message.type === "updateSidepanel") {
    updateSidepanelContent(message.content);
  }
});

/**
 * Updates the side panel content with the analysis results.
 * @param {object} content The analysis results object.
 */
function updateSidepanelContent(content) {
  log(logLevels.INFO, `Updating sidepanel content: ${JSON.stringify(content)}`);
  try {
    // Get references to DOM elements 
    const overallSummaryElement = document.getElementById('overall-summary');
    const readabilityGradeElement = document.getElementById('readability-grade');
    const userRightsIndexElement = document.getElementById('user-rights-index');
    const sectionSummariesElement = document.getElementById('section-summaries');
    const keyExcerptsList = document.getElementById('key-excerpts-list');
    const uncommonTermsList = document.getElementById('uncommon-terms-list');

    // Update Overall Summary
    overallSummaryElement.textContent = content.summary || "No summary available.";

    // Update Readability Grade and User Rights Index
    readabilityGradeElement.textContent = content.readabilityGrades?.averageGrade || "N/A";
    userRightsIndexElement.textContent = content.rightsScore ? (content.rightsScore * 100).toFixed(0) + "%" : "N/A";

    // Update Section Summaries
    sectionSummariesElement.innerHTML = ""; 

    if (content.sectionSummaries && content.sectionSummaries.length > 0) {
      content.sectionSummaries.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.classList.add('section-summary');
        sectionDiv.innerHTML = `
          <h3>${section.heading}</h3>
          <p>${section.summary}</p>
        `;
        sectionSummariesElement.appendChild(sectionDiv);
      });
    } else {
      sectionSummariesElement.innerHTML = "<p>No section summaries available.</p>";
    }

    // Update Key Excerpts List
    keyExcerptsList.innerHTML = ""; 

    if (content.keyExcerpts && content.keyExcerpts.length > 0) {
      content.keyExcerpts.forEach((excerpt, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `"${excerpt}"`; 
        listItem.setAttribute('data-index', index + 1); 
        keyExcerptsList.appendChild(listItem);
      });
    } else {
      keyExcerptsList.innerHTML = "<p>No key excerpts found.</p>";
    }

    // Update Uncommon Terms List
    uncommonTermsList.innerHTML = ""; 

    if (content.uncommonWords && content.uncommonWords.length > 0) {
      content.uncommonWords.forEach(item => {
        const termSpan = document.createElement('span');
        termSpan.textContent = item.word;
        termSpan.classList.add('uncommon-term');
        termSpan.setAttribute('data-definition', item.definition);
        uncommonTermsList.appendChild(termSpan);
      });
    } else {
      uncommonTermsList.innerHTML = "<p>No uncommon words found.</p>";
    }

    // Update the popups with detailed information
    updatePopupContent('readabilityPopup', content.readabilityGrades);
    updatePopupContent('rightsPopup', { score: content.rightsScore });
    updatePopupContent('excerptsPopup', content.keyExcerpts);
    updatePopupContent('termsPopup', content.uncommonWords);
  } catch (error) {
    log(logLevels.ERROR, `Error updating sidepanel content: ${error.message}`, error.stack);
    sidepanelContent.innerHTML = "<p>An error occurred while displaying the analysis results.</p>";
  }
}

// Function to update popup content
function updatePopupContent(popupId, data) {
  log(logLevels.INFO, `Updating popup content: popupId=${popupId}, data=${JSON.stringify(data)}`);
  const popup = document.getElementById(popupId);
  if (popup) {
    if (popupId === 'readabilityPopup' && data) {
      popup.innerHTML = `
        <p>Flesch Reading Ease: ${data.flesch}</p>
        <p>Flesch-Kincaid Grade Level: ${data.kincaid}</p>
        <p>Gunning Fog Index: ${data.fogIndex}</p>
      `;
    } else if (popupId === 'rightsPopup' && data) {
      popup.innerHTML = `<p>Detailed explanation of the rights score: ${data.score}</p>`; // Placeholder, replace with actual explanation
    } else if (popupId === 'excerptsPopup' && data) {
      popup.innerHTML = `<ul>${data.map((excerpt, index) => `<li>[${index + 1}] ${excerpt}</li>`).join('')}</ul>`;
    } else if (popupId === 'termsPopup' && data) {
      popup.innerHTML = `<ul>${data.map(item => `<li><strong>${item.word}</strong>: ${item.definition}</li>`).join('')}</ul>`;
    }
  }
}

// Function to show a popup
function showPopup(popupId) {
  log(logLevels.INFO, `Showing popup: ${popupId}`)
  const popup = document.getElementById(popupId);
  if (popup) {
    popup.style.display = 'block';
    // You might need to adjust the positioning of the popup here
  }
}

// Function to hide a popup
function hidePopup(popupId) {
  log(logLevels.INFO, `Hiding popup: ${popupId}`);
  const popup = document.getElementById(popupId);
  if (popup) {
    popup.style.display = 'none';
  }
}

// Add event listeners for uncommon term popups and key excerpts popups
document.addEventListener('mouseover', (event) => {
  const termSpan = event.target.closest('.uncommon-term');
  if (termSpan) {
    const definition = termSpan.getAttribute('data-definition');
    showPopup('termsPopup');
    updatePopupContent('termsPopup', [{ word: termSpan.textContent, definition }]); 
  }

  const excerptItem = event.target.closest('#key-excerpts-list li');
  if (excerptItem) {
    const excerptIndex = excerptItem.getAttribute('data-index');
    showPopup('excerptsPopup');
    updatePopupContent('excerptsPopup', [content.keyExcerpts[excerptIndex - 1]]); 
  }
});

document.addEventListener('mouseout', (event) => {
  const termSpan = event.target.closest('.uncommon-term');
  if (termSpan) {
    hidePopup('termsPopup');
  }

  const excerptItem = event.target.closest('#key-excerpts-list li');
  if (excerptItem) {
    hidePopup('excerptsPopup');
  }
});