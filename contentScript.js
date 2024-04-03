console.log('Content script loaded.');

// Function to check if selected text is likely part of a user agreement
function isUserAgreement(text) {
    const agreementKeywords = ['terms of service', 'privacy policy', 'user agreement', 'license agreement'];
    return agreementKeywords.some(keyword => text.toLowerCase().includes(keyword));
}

// This function will send the selected text to the background script
function sendTextForAnalysis(text) {
    chrome.runtime.sendMessage({action: "analyzeText", text: text}, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error sending message to background script:', chrome.runtime.lastError.message);
        } else {
            console.log('Selected text sent to background script for analysis.');
        }
    });
}

// This function creates an overlay to display the analysis results
function createResultsOverlay(analysisResults) {
    const overlay = document.createElement('div');
    overlay.setAttribute('id', 'termsGuardianResultsOverlay');
    overlay.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000000;">
            <div style="background:#fff;padding:20px;box-shadow:0 4px 6px rgba(0,0,0,0.1);border-radius:8px;max-width:600px;margin:50px auto;">
                <h2>Agreement Analysis Results</h2>
                <p><strong>Clarity Grade:</strong> ${analysisResults.clarityGrade}</p>
                <p><strong>Content Grade:</strong> ${analysisResults.contentGrade}</p>
                <p><strong>Key Excerpts:</strong> ${analysisResults.keyExcerpts}</p>
                <p><strong>Reasons for Grade:</strong> ${analysisResults.reasons}</p>
                <button onclick="document.getElementById('termsGuardianResultsOverlay').remove();">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "displayAnalysisResults") {
        console.log('Received analysis results to display.');
        createResultsOverlay(request.analysisResults);
    }
});

// Enable or disable the context menu item based on text selection
document.addEventListener('selectionchange', function() {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText && isUserAgreement(selectedText)) {
        chrome.runtime.sendMessage({action: "enableContextMenu", enable: true}, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error enabling context menu:', chrome.runtime.lastError.message);
            } else {
                console.log('Context menu enabled for selected text.');
            }
        });
    } else {
        chrome.runtime.sendMessage({action: "enableContextMenu", enable: false}, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error disabling context menu:', chrome.runtime.lastError.message);
            } else {
                console.log('Context menu disabled as selected text does not match criteria.');
            }
        });
    }
});