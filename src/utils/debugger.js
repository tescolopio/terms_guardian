/**
 * @file debugger.js
 * @description This script contains logging utilities for debugging and error handling.
 * @contributors {tescolopio}
 * @version 1.1.0
 * @date 2024-09-25
 * 
 * @author Timmothy Escolopio
 * @company 3D Tech Solutions LLC
 * 
 * @changes
 *  - 2024-09-18 | tescolopio | Initial creation of the script.
 *  - 2024-09-24 | tescolopio | Updated script to include more robust logging and error handling. Also included config settings for logging. 
 *  - 2024-09-25 | tescolopio | Modified to work with Chrome extension content scripts.
 */

window.DEBUG_LEVEL = 4; // Adjust this to control the level of logging

window.logLevels = {
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4
};

window.config = {
  highlightThreshold: 20,
  sectionThreshold: 10,
  logLevel: window.logLevels.INFO,
  exportToFile: false, // Flag to control file export
  exportFilePath: 'extractedText.txt' // Default file path for export
};

/**
 * Logs a message with the specified level and optional additional data
 * @param {number} level The log level
 * @param {string} message The log message
 * @param {object} [data] Additional data to log (optional)
 */
window.log = function(level, message, data = null) {
  if (level <= window.DEBUG_LEVEL) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] ${message}`;
    if (data) {
      logMessage += ` - ${JSON.stringify(data)}`;
    }
    switch (level) {
      case window.logLevels.ERROR:
        console.error(logMessage);
        break;
      case window.logLevels.WARN:
        console.warn(logMessage);
        break;
      case window.logLevels.INFO:
        console.info(logMessage);
        break;
      case window.logLevels.DEBUG:
        console.log(logMessage);
        break;
    }
  }
};