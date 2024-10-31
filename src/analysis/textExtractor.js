/**
 * @file textExtractor.js
 * @description Service for extracting text from various document formats
 * @version 2.0.0
 */

(function (global) {
  'use strict';

  function createTextExtractor({ log, logLevels, utilities }) {
    if (!utilities) {
      throw new Error('Utilities service must be provided to text extractor');
    }

    const { showNotification } = utilities;

    // Add error types for better error handling
    const ERROR_TYPES = {
      INCOMPLETE_HTML: 'INCOMPLETE_HTML',
      MALFORMED_HTML: 'MALFORMED_HTML',
      PDF_EXTRACTION: 'PDF_EXTRACTION',
      DOCX_EXTRACTION: 'DOCX_EXTRACTION',
      INVALID_INPUT: 'INVALID_INPUT',
    };

    /**
     * Handles extraction errors and shows appropriate notifications
     */
    async function handleExtractionError(error, type, content) {
      log(logLevels.ERROR, `Extraction error (${type}):`, error);

      let notificationConfig = {
        type: 'basic',
        requireInteraction: true,
      };

      switch (type) {
        case ERROR_TYPES.INCOMPLETE_HTML:
          return new Promise(resolve => {
            showNotification(
              {
                ...notificationConfig,
                title: 'Incomplete HTML Detected',
                message:
                  'The HTML content contains incomplete tags. Would you like to extract the text anyway?',
                buttons: [{ title: 'Yes, extract anyway' }, { title: 'No, skip extraction' }],
              },
              wasConfirmed => {
                if (wasConfirmed) {
                  resolve(preprocessText(content));
                } else {
                  resolve('');
                }
              }
            );
          });

        case ERROR_TYPES.MALFORMED_HTML:
          showNotification({
            ...notificationConfig,
            title: 'Malformed HTML',
            message:
              'The HTML content is malformed and cannot be parsed. Please check the content and try again.',
          });
          return '';

        case ERROR_TYPES.PDF_EXTRACTION:
          showNotification({
            ...notificationConfig,
            title: 'PDF Extraction Error',
            message:
              'There was an error extracting text from the PDF. Please ensure the file is not corrupted or password-protected.',
          });
          return '';

        case ERROR_TYPES.DOCX_EXTRACTION:
          showNotification({
            ...notificationConfig,
            title: 'DOCX Extraction Error',
            message:
              'There was an error extracting text from the Word document. Please ensure the file is not corrupted.',
          });
          return '';

        default:
          showNotification({
            ...notificationConfig,
            title: 'Extraction Error',
            message: 'An unexpected error occurred during text extraction. Please try again.',
          });
          return '';
      }
    }

    /**
     * Preprocesses text by normalizing whitespace, case, and special characters
     */
    function preprocessText(text) {
      if (!text || typeof text !== 'string') return '';

      log(logLevels.DEBUG, 'Preprocessing text');

      const preprocessedText = text
        .replace(/\r?\n|\r/g, ' ') // Replace newlines with spaces
        .replace(/\t/g, ' ') // Replace tabs with spaces
        .replace(/\f/g, ' ') // Replace form feeds with spaces
        .replace(/\v/g, ' ') // Replace vertical tabs with spaces
        .replace(/\u00A0/g, ' ') // Replace non-breaking spaces with regular spaces
        .replace(/\u2028/g, ' ') // Replace line separators with spaces
        .replace(/\u2029/g, ' ') // Replace paragraph separators with spaces
        .replace(/[^\S\r\n]+/g, ' ') // Replace multiple spaces with single space
        .trim(); // Remove leading/trailing whitespace

      log(logLevels.DEBUG, 'Text preprocessed');
      return preprocessedText;
    }

    /**
     * Extracts text from HTML content with enhanced error handling
     */
    async function extractFromHTML(html) {
      try {
        if (!html) return '';

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Check for parser errors
        const parserError = doc.querySelector('parsererror');
        if (parserError) {
          return await handleExtractionError(
            new Error(parserError.textContent),
            ERROR_TYPES.INCOMPLETE_HTML,
            doc.body.textContent
          );
        }

        // Remove unwanted elements
        const excludeSelectors = [
          'script',
          'style',
          'noscript',
          'iframe',
          'svg',
          'header',
          'footer',
          'nav',
          '[role="navigation"]',
          '.cookie-banner',
          '.ad',
          '.advertisement',
          'meta',
          'link',
          'head',
        ];

        excludeSelectors.forEach(selector => {
          doc.querySelectorAll(selector).forEach(el => el.remove());
        });

        // Extract text while preserving structure
        function extractNodeText(node) {
          if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent.trim();
          }

          if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toLowerCase();
            const text = Array.from(node.childNodes).map(extractNodeText).filter(Boolean).join(' ');

            // Add spacing for block elements
            if (
              ['div', 'p', 'section', 'article', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)
            ) {
              return `\n${text}\n`;
            }

            return text;
          }

          return '';
        }

        const extractedText = extractNodeText(doc.body);
        return preprocessText(extractedText);
      } catch (error) {
        return await handleExtractionError(error, ERROR_TYPES.MALFORMED_HTML);
      }
    }

    /**
     * Extracts text from PDF content (base64 or ArrayBuffer)
     */
    async function extractFromPDF(pdfData) {
      try {
        if (!pdfData) return '';

        // Convert base64 to ArrayBuffer if needed
        const arrayBuffer = typeof pdfData === 'string' ? base64ToArrayBuffer(pdfData) : pdfData;

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let extractedText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map(item => item.str).join(' ');
          extractedText += pageText + '\n';
        }

        return preprocessText(extractedText);
      } catch (error) {
        log(logLevels.ERROR, 'Error extracting from PDF:', error);
        return '';
      }
    }

    /**
     * Extracts text from Word documents (DOCX)
     */
    async function extractFromDOCX(docxData) {
      try {
        if (!docxData) return '';

        const arrayBuffer = typeof docxData === 'string' ? base64ToArrayBuffer(docxData) : docxData;

        const result = await mammoth.extractRawText({ arrayBuffer });
        return preprocessText(result.value);
      } catch (error) {
        log(logLevels.ERROR, 'Error extracting from DOCX:', error);
        return '';
      }
    }

    /**
     * Extracts text from plain text files
     */
    function extractFromText(text) {
      return preprocessText(text);
    }

    /**
     * Split text into sentences with improved handling
     */
    function splitIntoSentences(text) {
      const processed = preprocessText(text);

      // Enhanced regex for sentence detection
      const sentenceRegex = /[^.!?。；!\?]+[.!?。；!\?]+/g;

      return (processed.match(sentenceRegex) || [])
        .map(sentence => sentence.trim())
        .filter(Boolean);
    }

    /**
     * Split text into words with improved tokenization
     */
    function splitIntoWords(text) {
      const processed = preprocessText(text);

      // Enhanced word tokenization regex
      const wordRegex = /\b\w+(?:[-']\w+)*\b/g;

      return (processed.match(wordRegex) || []).filter(Boolean);
    }

    /**
     * Utility function to convert base64 to ArrayBuffer
     */
    function base64ToArrayBuffer(base64) {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }

    /**
     * Main extraction function that handles different input types
     */
    async function extract(input, type) {
      try {
        if (!input) {
          throw new Error('No input provided for extraction');
        }

        switch (type?.toLowerCase()) {
          case 'html':
            return await extractFromHTML(input);
          case 'pdf':
            try {
              return await extractFromPDF(input);
            } catch (error) {
              return await handleExtractionError(error, ERROR_TYPES.PDF_EXTRACTION);
            }
          case 'docx':
            try {
              return await extractFromDOCX(input);
            } catch (error) {
              return await handleExtractionError(error, ERROR_TYPES.DOCX_EXTRACTION);
            }
          case 'text':
            return extractFromText(input);
          default:
            // Try to auto-detect type
            if (typeof input === 'string') {
              if (input.trim().startsWith('<')) {
                return await extractFromHTML(input);
              }
              return extractFromText(input);
            }
            return await handleExtractionError(
              new Error('Unable to determine input type'),
              ERROR_TYPES.INVALID_INPUT
            );
        }
      } catch (error) {
        return await handleExtractionError(error, ERROR_TYPES.INVALID_INPUT);
      }
    }

    return {
      extract,
      extractFromHTML,
      extractFromPDF,
      extractFromDOCX,
      extractFromText,
      splitIntoSentences,
      splitIntoWords,
      preprocessText,
    };
  }

  // Export for both environments
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createTextExtractor };
  } else {
    global.TextExtractor = { create: createTextExtractor };
  }
})(typeof window !== 'undefined' ? window : global);
