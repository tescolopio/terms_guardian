/**
 * @file debugger.js
 * @description This script contains logging utilities for debugging and error handling.
 * @contributors {tescolopio}
 * @version 1.0.0
 * @date 2024-09-21
 * 
 * @author Timmothy Escolopio
 * @company 3D Tech Solutions LLC
 * 
 * @changes
 *  - 2024-09-18 | tescolopio | Initial creation of the script.
 *  - 2024-09-24 | tescolopio | Updated script to include more robust logging and error handling. Also included config settings for logging. 
 */

let DEBUG_LEVEL = 4; // Adjust this to control the level of logging

const logLevels = {
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4
};

//2024-09-24
const config = {
  highlightThreshold: 20,
  sectionThreshold: 10,
  logLevel: logLevels.INFO,
  exportToFile: false, // Flag to control file export
  exportFilePath: 'extractedText.txt' // Default file path for export
};

/**
 * Logs a message with the specified level and optional additional data
 * @param {number} level The log level
 * @param {string} message The log message
 * @param {object} [data] Additional data to log (optional)
 */
function log(level, message, data = null) {
  if (level <= DEBUG_LEVEL) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] ${message}`;
    if (data) {
      logMessage += ` - ${JSON.stringify(data)}`; //2024-09-24
    }
    switch (level) {
      case logLevels.ERROR:
        console.error(logMessage);
        break;
      case logLevels.WARN:
        console.warn(logMessage);
        break;
      case logLevels.INFO:
        console.info(logMessage);
        break;
      case logLevels.DEBUG:
        console.log(logMessage);
        break;
    }
  }
}

export { log, logLevels, config };