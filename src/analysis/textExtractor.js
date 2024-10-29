/**
 * @file textExtractor.js
 * @description Extracts and analyzes text from web pages for legal content.
 * @version 1.1.0
 * @date 2024-09-30
 */

(function(window) {
    // Assume these are globally available
    const { log, logLevels, config, legalTerms } = window;

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
     * Extracts and analyzes text from the entire page, section by section.
     * @return {Promise<string>} A promise that resolves to the extracted legal text 
     * or an empty string if none is found.
     */
    async function extractAndAnalyzePageText() {
        try {
            log(logLevels.DEBUG, 'Starting text extraction and analysis');

            // Attempt to extract legal text based on highlighted elements
            const extractedTextFromHighlights = extractTextFromHighlights();

            if (extractedTextFromHighlights) {
                log(config.logLevel, "Legal text extracted from highlights successfully.");
                return extractedTextFromHighlights;
            } 

            // If extraction from highlights fails, try section-based extraction
            const extractedTextFromSections = await extractTextFromSections();

            if (extractedTextFromSections) {
                log(config.logLevel, "Legal text extracted from sections successfully.");
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
     * @return {string|null} The extracted text or null if not enough highlights are found
     */
    function extractTextFromHighlights() {
        try {
            log(logLevels.DEBUG, 'Starting text extraction from highlights');
            
            const legalElements = document.querySelectorAll('.legal-term-highlight'); 
            log(logLevels.DEBUG, 'Number of legal-term-highlight elements found', { count: legalElements.length });

            if (legalElements.length > config.highlightThreshold) {
                log(logLevels.INFO, 'Highlight threshold exceeded, extracting full body text');
                return document.body.innerText;
            } else {
                let fullText = '';
                legalElements.forEach((element) => {
                    fullText += element.textContent + '\n\n';
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
     * @return {Promise<string|null>} The extracted legal text or null if none is found
     */
    async function extractTextFromSections() {
        try {
            log(logLevels.DEBUG, 'Starting text extraction from sections');
            
            const sections = document.querySelectorAll('main, article, section, div[class*="terms"], div[id*="terms"]'); 
            log(logLevels.DEBUG, 'Number of sections found', { count: sections.length });

            if (sections.length === 0) {
                log(logLevels.WARN, 'No sections found for extraction');
                return null;
            }

            let legalText = '';

            sections.forEach((section) => {
                const sectionText = extractTextFromSection(section);
                log(logLevels.DEBUG, 'Extracted text from section', { sectionText });

                if (isLegalText(sectionText)) {
                    legalText += sectionText + '\n\n';
                    log(logLevels.DEBUG, 'Section text identified as legal text', { sectionText });
                }
            });

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
     * @param {Element} section The section element to extract text from
     * @return {string|null} The extracted text from the section or null if an error occurs
     */
    function extractTextFromSection(section) {
        try {
            log(logLevels.DEBUG, 'Starting text extraction from section', { section });

            const filteredContent = Array.from(section.children).filter(child => 
                !['NAV', 'HEADER', 'FOOTER', 'SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED'].includes(child.tagName)
            );
            const sectionText = filteredContent.map(el => el.textContent).join(' ').trim();
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
            
            const threshold = config.sectionThreshold;
            const isLegal = legalTermCount >= threshold;

            log(logLevels.DEBUG, 'Legal text analysis result', { legalTermCount, threshold, isLegal });
            return isLegal;
        } catch (error) {
            log(logLevels.ERROR, 'Error analyzing legal text', { error });
            return false;
        }
    }

    // Expose the main function to the global scope
    window.extractAndAnalyzePageText = extractAndAnalyzePageText;

})(window);