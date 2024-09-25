import { load } from './node_modules/cheerio/lib/cheerio.min.js';
import { log, logLevels, config } from './debugger.js';
import legalTerms from './legalTerms.js';
import fs from 'fs';

/**
 * Preprocesses text by removing extra whitespace and normalizing case
 * @param {string} text The text to preprocess
 * @return {string} The preprocessed text
 */
function preprocessText(text) {
    log(logLevels.DEBUG, 'Preprocessing text');
    const preprocessedText = text.replace(/\s+/g, ' ').trim().toLowerCase();
    log(logLevels.DEBUG, 'Text preprocessed', { originalText: text, preprocessedText });
    return preprocessedText;
}

/**
 * Exports the extracted text to a file if the exportToFile flag is set
 * @param {string} text The text to export
 * @param {string} filePath The file path to export to
 */
function exportTextToFile(text, filePath) {
    if (config.exportToFile) {
        fs.writeFileSync(filePath, text, 'utf8');
        log(logLevels.INFO, `Text exported to ${filePath}`);
    } else {
        log(logLevels.DEBUG, 'Export to file is disabled');
    }
}

/**
 * Extracts and analyzes text from the entire page, section by section.
 * @return {Promise<string>} A promise that resolves to the extracted legal text 
 * or an empty string if none is found.
 */
export async function extractAndAnalyzePageText() {
    try {
        if (typeof document === 'undefined') {
            throw new Error('document is not defined');
        }

        const $ = await load(document.documentElement.outerHTML);

        // Attempt to extract legal text based on highlighted elements
        const extractedTextFromHighlights = extractTextFromHighlights($);

        if (extractedTextFromHighlights) {
            log(config.logLevel, "Legal text extracted from highlights successfully.");
            exportTextToFile(extractedTextFromHighlights, config.exportFilePath);
            return extractedTextFromHighlights;
        } 

        // If extraction from highlights fails, try section-based extraction
        const extractedTextFromSections = await extractTextFromSections($);

        if (extractedTextFromSections) {
            log(config.logLevel, "Legal text extracted from sections successfully.");
            exportTextToFile(extractedTextFromSections, config.exportFilePath);
            return extractedTextFromSections;
        } 

        log(config.logLevel, "No legal text found on the page.");
        return '';

    } catch (error) {
        log(logLevels.ERROR, "Error extracting and analyzing page text", { error });
        return '';
    }
}

/**
 * Extracts text based on number of highlighted sections
 * @param {CheerioStatic} $ The Cheerio object
 * @return {string|null} The extracted text or null if not enough highlights are found
 */
function extractTextFromHighlights($) {
    try {
        log(logLevels.DEBUG, 'Starting text extraction from highlights');
        
        const legalElements = $('.legal-term-highlight'); 
        log(logLevels.DEBUG, 'Number of legal-term-highlight elements found', { count: legalElements.length });

        if (legalElements.length > config.highlightThreshold) { // Adjust the threshold as needed
            log(logLevels.INFO, 'Highlight threshold exceeded, extracting full body text');
            return document.body.innerText;
        } else {
            let fullText = '';
            legalElements.each((index, element) => {
                fullText += $(element).text() + '\n\n';
            });
            const preprocessedText = preprocessText(fullText);
            log(logLevels.DEBUG, 'Extracted and preprocessed text from highlights', { preprocessedText });
            return preprocessedText;
        }
    } catch (error) {
        log(logLevels.ERROR, 'Error extracting text from highlights', { error });
        return null;
    }
}

/**
 * Extracts and analyzes text from sections on the page
 * @param {CheerioStatic} $ The Cheerio object
 * @return {Promise<string|null>} The extracted legal text or null if none is found
 */
async function extractTextFromSections($) {
    try {
        log(logLevels.DEBUG, 'Starting text extraction from sections');
        
        // Identify potential sections using Cheerio selectors
        const sections = $('main, article, section, div[class*="terms"], div[id*="terms"]'); 
        log(logLevels.DEBUG, 'Number of sections found', { count: sections.length });

        if (sections.length === 0) {
            log(logLevels.WARN, 'No sections found for extraction');
            return null;
        }

        let legalText = '';

        await Promise.all(sections.map(async (index, section) => {
            const sectionText = extractTextFromSection($, section);
            log(logLevels.DEBUG, 'Extracted text from section', { index, sectionText });

            if (isLegalText(sectionText)) {
                legalText += sectionText + '\n\n';
                log(logLevels.DEBUG, 'Section text identified as legal text', { index, sectionText });
            }
        }));

        const trimmedText = preprocessText(legalText);
        log(logLevels.DEBUG, 'Trimmed and preprocessed legal text', { trimmedText });

        return trimmedText || null; 
    } catch (error) {
        log(logLevels.ERROR, 'Error extracting text from sections', { error });
        return null;
    }
}

/**
 * Extracts text from a section, filtering out non-textual elements
 * @param {CheerioStatic} $ The Cheerio object
 * @param {CheerioElement} section The section element to extract text from
 * @return {string|null} The extracted text from the section or null if an error occurs
 */
function extractTextFromSection($, section) {
    try {
        log(logLevels.DEBUG, 'Starting text extraction from section', { section });

        const filteredContent = $(section).children().not('nav, header, footer, script, style, iframe, object, embed'); 
        const sectionText = filteredContent.text().trim();
        const preprocessedText = preprocessText(sectionText);

        log(logLevels.DEBUG, 'Extracted and preprocessed text from section', { preprocessedText });
        return preprocessedText || null;
    } catch (error) {
        log(logLevels.ERROR, 'Error extracting text from section', { error });
        return null;
    }
}

/**
 * Checks if a given text contains enough legal terms to be considered legal text
 * @param {string} text The text to analyze
 * @return {boolean} True if the text contains enough legal terms, false otherwise
 */
function isLegalText(text) {
    try {
        log(logLevels.DEBUG, 'Starting legal text analysis', { text });

        const words = text.toLowerCase().split(/\s+/);
        const legalTermCount = words.filter(word => legalTerms.includes(word)).length;
        
        // Adjust the threshold as needed
        const threshold = config.sectionThreshold; // Consider lowering this for section-level analysis
        const isLegal = legalTermCount >= threshold;

        log(logLevels.DEBUG, 'Legal text analysis result', { legalTermCount, threshold, isLegal });
        return isLegal;
    } catch (error) {
        log(logLevels.ERROR, 'Error analyzing legal text', { error });
        return false;
    }
}