console.log('Popup UI script loaded.');

document.addEventListener('DOMContentLoaded', function() {
    // Request the analysis results from the background script
    chrome.runtime.sendMessage({action: "requestAnalysisResults"}, function(response) {
        console.log('Received analysis results from background script.');
        if (chrome.runtime.lastError) {
            console.error('Error receiving analysis results:', chrome.runtime.lastError.message);
            document.getElementById('gradeResults').innerHTML = '<p>Error loading analysis results.</p>';
            return;
        }
        if (response.error) {
            console.error('Error receiving analysis results:', response.error);
            document.getElementById('gradeResults').innerHTML = '<p>Error loading analysis results.</p>';
        } else {
            // Update the UI with the received analysis results
            if(response.clarityGrade && response.contentGrade) {
                updateUI(response.clarityGrade, response.contentGrade, response.keyExcerpts, response.reasons);
            } else {
                console.log('Incomplete analysis results received.');
                document.getElementById('gradeResults').innerHTML = '<p>Incomplete analysis results received. Please try again.</p>';
            }
        }
    });
});

function updateUI(clarityGrade, contentGrade, keyExcerpts, reasons) {
    console.log('Updating UI with analysis results.');
    try {
        document.getElementById('clarityGrade').innerHTML = `<h3>Clarity Grade:</h3><p>${clarityGrade}</p>`;
        document.getElementById('contentGrade').innerHTML = `<h3>Content Grade:</h3><p>${contentGrade}</p>`;
        document.getElementById('keyExcerpts').innerHTML = `<h3>Key Excerpts:</h3><p>${keyExcerpts}</p>`;
        document.getElementById('reasons').innerHTML = `<h3>Reasons for Grade:</h3><p>${reasons}</p>`;
    } catch (error) {
        console.error('Error updating UI:', error.message, error.stack);
        document.getElementById('gradeResults').innerHTML = '<p>Error updating UI. Please check the console for more details.</p>';
    }
}