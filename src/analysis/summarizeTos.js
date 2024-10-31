/**
 * @file summarizeTos.js
 * @description Implements ToS summarization functionality for Chrome extensions
 * @version 1.0.0
 * @date 2024-10-05
 */

(function(global) {
  'use strict';

  // Create the main factory function
  function createSummarizer({ compromise, cheerio, log, logLevels }) {
    /**
     * Summarizes the ToS text by breaking it into sections and summarizing each section.
     * @param {string} html The HTML content to summarize
     * @return {object} Object containing overall and section summaries
     */
    function summarizeTos(html) {
      try {
        log(logLevels.INFO, "Starting ToS summarization...");
        
        // Load HTML with cheerio
        const $ = cheerio.load(html);
        
        // Get sections
        const sections = identifySections($);
        log(logLevels.DEBUG, "Identified sections:", { count: sections.length });

        // Process each section
        const sectionSummaries = sections.map(section => {
          try {
            const sectionText = extractSectionText(section);
            log(logLevels.DEBUG, "Processing section:", { 
              heading: section.heading,
              textLength: sectionText.length 
            });

            const summary = summarizeSection(sectionText);
            return {
              heading: section.heading,
              summary: summary,
              originalText: sectionText
            };
          } catch (error) {
            log(logLevels.ERROR, "Error summarizing section:", {
              heading: section.heading,
              error: error.message
            });
            return {
              heading: section.heading,
              summary: "Error summarizing this section.",
              error: error.message
            };
          }
        });

        // Create overall summary
        const overallSummary = combineSummaries(sectionSummaries);
        
        log(logLevels.INFO, "Summarization complete");
        
        return {
          overall: overallSummary,
          sections: sectionSummaries,
          metadata: {
            sectionCount: sections.length,
            timestamp: new Date().toISOString()
          }
        };
      } catch (error) {
        log(logLevels.ERROR, "Error in summarizeTos:", error);
        return {
          overall: "An error occurred while summarizing the Terms of Service.",
          sections: [],
          error: error.message
        };
      }
    }

    /**
     * Identifies sections in the HTML using heading tags
     * @param {CheerioStatic} $ Cheerio instance
     * @returns {Array} Array of section objects
     */
    function identifySections($) {
      try {
        log(logLevels.DEBUG, "Identifying sections");
        
        const sections = [];
        const headings = $('h1, h2, h3, h4, h5, h6');
        
        headings.each((i, el) => {
          const $el = $(el);
          const heading = $el.text().trim();
          const content = $el.nextUntil('h1, h2, h3, h4, h5, h6').text().trim();
          
          if (heading && content) {
            sections.push({ heading, content });
          }
        });

        log(logLevels.DEBUG, `Found ${sections.length} sections`);
        return sections;
      } catch (error) {
        log(logLevels.ERROR, "Error identifying sections:", error);
        return [];
      }
    }

    /**
     * Extracts text from a section
     * @param {Object} section Section object
     * @returns {string} Extracted text
     */
    function extractSectionText(section) {
      try {
        return section.content.trim();
      } catch (error) {
        log(logLevels.ERROR, "Error extracting section text:", error);
        return "";
      }
    }

    /**
     * Summarizes a section of text using compromise.js
     * @param {string} sectionText Text to summarize
     * @returns {string} Summarized text
     */
    function summarizeSection(sectionText) {
      try {
        if (!sectionText.trim()) {
          return "";
        }

        const doc = compromise(sectionText);
        
        // Get key sentences (first sentence, any sentences with important terms, last sentence)
        const firstSentence = doc.sentences().first().text();
        const lastSentence = doc.sentences().last().text();
        
        // Look for sentences with important legal terms
        const importantSentences = doc.sentences()
          .filter(s => s.has('#Condition') || s.has('#Legal') || s.has('#Money'))
          .text();

        // Combine and deduplicate sentences
        const summary = [...new Set([firstSentence, importantSentences, lastSentence])]
          .filter(Boolean)
          .join(' ');

        return summary || "No summary available.";
      } catch (error) {
        log(logLevels.ERROR, "Error summarizing section:", error);
        return "Error generating summary.";
      }
    }

    /**
     * Combines section summaries into an overall summary
     * @param {Array} sectionSummaries Array of section summaries
     * @returns {string} Combined summary
     */
    function combineSummaries(sectionSummaries) {
      try {
        return sectionSummaries.map(section => 
          `## ${section.heading}\n${section.summary}`
        ).join('\n\n');
      } catch (error) {
        log(logLevels.ERROR, "Error combining summaries:", error);
        return "Error creating overall summary.";
      }
    }

    // Return public interface
    return {
      summarizeTos
    };
  }

  // Export for both Chrome extension and test environments
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createSummarizer };
  } else if (typeof window !== 'undefined') {
    global.TosSummarizer = {
      create: createSummarizer
    };
  }

})(typeof window !== 'undefined' ? window : global);