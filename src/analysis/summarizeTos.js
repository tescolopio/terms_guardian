// Assuming you're using Compromise.js
import nlp from './node_modules/compromise/builds/compromise.min.js';
import { log, logLevels } from './debugger.js';


/**
 * Summarizes the ToS text by breaking it into sections and summarizing each section individually.
 * @param {CheerioStatic} $ The Cheerio object representing the loaded ToS HTML.
 * @return {string} The summarized ToS text.
 */
function summarizeTos($) { 
  try {
    console.log("Starting ToS summarization...");

    const sections = identifySections($); 
    console.log("Identified sections:", sections); 

    const sectionSummaries = sections.map(section => {
      try {
        const sectionText = extractSectionText(section); 
        console.log("Extracting text from section:", section.heading);

        const summary = summarizeSection(sectionText); 
        console.log("Section summary:", summary);

        return summary;
      } catch (error) {
        console.error("Error summarizing section:", section.heading, error);
        return ""; // Return an empty string in case of error
      }
    });

    const overallSummary = combineSummaries(sectionSummaries); 
    console.log("Overall summary:", overallSummary);

    return overallSummary;
  } catch (error) {
    console.error("Error in summarizeTos:", error);
    // Handle the error gracefully, perhaps by returning a default message or an error indicator
    return "An error occurred while summarizing the Terms of Service."; 
  }
}

function identifySections($) {
  try {
    log(logLevels.DEBUG, "Identifying sections using Cheerio");
    // Use Cheerio selectors to identify sections
    const sections = $('h1, h2, h3, h4, h5, h6').map((i, el) => {
      return {
        heading: $(el).text(),
        content: $(el).nextUntil('h1, h2, h3, h4, h5, h6').text()
      };
    }).get();

    log(logLevels.INFO, `Identified sections: ${JSON.stringify(sections)}`);
    return sections;
  } catch (error) {
    log(logLevels.ERROR, `Error identifying sections: ${error.message}`);
    return []; // Return an empty array in case of error
  }
}

function extractSectionText(section) {
  try {
    return section.content; 
  } catch (error) {
    console.error("Error extracting section text:", error);
    return ""; // Return an empty string in case of error
  }
}

function summarizeSection(sectionText) {
  try {
    const doc = nlp(sectionText);
    const summary = doc.sentences().slice(0, 3).text(); // Basic summarization

    // More advanced summarization techniques could be explored here

    return summary;
  } catch (error) {
    console.error("Error summarizing section text:", error);
    return ""; // Return an empty string in case of error
  }
}

function combineSummaries(sectionSummaries) {
  log(logLevels.DEBUG, `Combining section summaries: ${JSON.stringify(sectionSummaries)}`);
  let overallSummary = "";

  for (let i = 0; i < sectionSummaries.length; i++) {
    const section = sections[i]; // Assuming 'sections' is accessible in this scope
    const heading = section.heading;
    const summary = sectionSummaries[i];

    // Add the heading and summary to the overall summary
    overallSummary += `## ${heading}\n${summary}\n\n`; 
  }

  log(logLevels.INFO, `Overall summary: ${overallSummary}`);
  return overallSummary;
}

export { summarizeTos };