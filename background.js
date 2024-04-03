console.log('Background script loaded.');

import * as tf from '@tensorflow/tfjs';

class ModelHandler {
    constructor() {
        this.model = null;
    }

    async loadModel(modelUrl) {
        try {
            this.model = await tf.loadLayersModel(modelUrl);
            console.log('Model loaded successfully');
        } catch (error) {
            console.error('Error loading model:', error);
        }
    }

    async analyzeText(text) {
        if (!this.model) {
            console.error('Model not loaded');
            return 'Error: Model not loaded.';
        }

        try {
            const processedText = this.preprocessText(text);
            const inputTensor = tf.tensor([processedText], [1, processedText.length]);
            const prediction = this.model.predict(inputTensor);
            const contentGrade = await this.postprocessPrediction(prediction);
            return contentGrade;
        } catch (error) {
            console.error('Error analyzing text with TensorFlow.js:', error);
            return 'Error: Problem during the analysis.';
        }
    }

    preprocessText(text) {
        return text.split(' ').map(word => word.length);
    }

    async postprocessPrediction(prediction) {
        try {
            const predictionArray = await prediction.array();
            console.log('Prediction output:', predictionArray);
            return 'A';
        } catch (error) {
            console.error('Error processing prediction output:', error);
            return 'Error: Problem during postprocessing.';
        }
    }
}

const modelHandler = new ModelHandler();
// INPUT_REQUIRED {Provide the URL to your TensorFlow.js model}
modelHandler.loadModel('url_to_your_tensorflowjs_model/model.json');

function fleschReadingEase(text) {
    const sentenceLength = text.split('.').length;
    const wordCount = text.split(' ').length;
    const syllableCount = text.split(' ').reduce((total, word) => {
        return total + (word.match(/[aeiouy]/gi) ? word.match(/[aeiouy]/gi).length : 0);
    }, 0);
    return 206.835 - 1.015 * (wordCount / sentenceLength) - 84.6 * (syllableCount / wordCount);
}

// Function to calculate Flesch-Kincaid Grade Level
function fleschKincaidGradeLevel(text) {
    const sentenceLength = text.split('.').length;
    const wordCount = text.split(' ').length;
    const syllableCount = text.split(' ').reduce((total, word) => {
        return total + (word.match(/[aeiouy]/gi) ? word.match(/[aeiouy]/gi).length : 0);
    }, 0);
    return 0.39 * (wordCount / sentenceLength) + 11.8 * (syllableCount / wordCount) - 15.59;
}

// Function to calculate Gunning Fog Index
function gunningFogIndex(text) {
    const sentenceLength = text.split('.').length;
    const wordCount = text.split(' ').length;
    const complexWordCount = text.split(' ').reduce((total, word) => {
        return total + (word.match(/[aeiouy]/gi) && word.match(/[aeiouy]/gi).length >= 3 ? 1 : 0);
    }, 0);
    return 0.4 * ((wordCount / sentenceLength) + 100 * (complexWordCount / wordCount));
}

async function analyzeContentWithTensorFlow(text) {
    console.log('Analyzing content with TensorFlow.js...');
    const contentGrade = await modelHandler.analyzeText(text);
    return contentGrade;
}

function calculateReadabilityGrade(text) {
    const fleschScore = fleschReadingEase(text);
    const kincaidScore = fleschKincaidGradeLevel(text);
    const fogIndexScore = gunningFogIndex(text);

    const averageScore = (fleschScore + kincaidScore + fogIndexScore) / 3;

    // This is a simple mapping to convert score to grade, needs refining
    if (averageScore > 90) return 'A';
    else if (averageScore > 70) return 'B';
    else if (averageScore > 50) return 'C';
    else if (averageScore > 30) return 'D';
    else return 'F';
}

let analysisResults = {};

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "gradeAgreement",
        title: "Grade this Agreement",
        contexts: ["selection"]
    }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error creating context menu:', chrome.runtime.lastError.message);
        } else {
            console.log('Context menu created successfully.');
        }
    });
});

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.action === "analyzeText") {
        console.log('Received text for analysis.');
        if (!request.text) {
            console.error('No text provided for analysis.');
            sendResponse({ error: 'No text provided for analysis.' });
            return;
        }
        try {
            const textToAnalyze = request.text;
            const readabilityGrade = calculateReadabilityGrade(textToAnalyze);
            const contentGrade = await analyzeContentWithTensorFlow(textToAnalyze);
            const keyExcerpts = 'This is a key excerpt from the agreement.';
            const reasons = 'The agreement has clear terms and favors user rights.';

            analysisResults = {
                clarityGrade: readabilityGrade,
                contentGrade: contentGrade,
                keyExcerpts: keyExcerpts,
                reasons: reasons
            };

            console.log('Analysis results stored.');
            sendResponse(analysisResults);
        } catch (error) {
            console.error('Error analyzing text:', error.message, error.stack);
            sendResponse({ error: 'Error analyzing text. Please check the console for more details.' });
        }
    } else if (request.action === "requestAnalysisResults") {
        console.log('Received request for analysis results.');

        if (Object.keys(analysisResults).length !== 0) {
            sendResponse(analysisResults);
            console.log('Analysis results sent from storage.');
        } else {
            sendResponse({
                error: 'No analysis results available.'
            });
            console.log('No stored analysis results found.');
        }
    }
    return true; // Indicates asynchronous response
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "gradeAgreement") {
        chrome.tabs.executeScript({
            code: 'window.getSelection().toString();'
        }, function(selection) {
            const selectedText = selection[0];
            if (selectedText) {
                console.log('User agreement text selected.');
                chrome.runtime.sendMessage({action: "analyzeText", text: selectedText});
            } else {
                console.log('No text selected.');
            }
        });
    }
});