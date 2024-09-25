# Terms Guardian

Terms Guardian is a web browser extension designed to empower users by demystifying the complex language often found in Terms of Service (ToS) agreements. It automatically detects ToS text on websites, grades its readability, summarizes its content into plain language, and assesses the rights retained or surrendered.

## Features

- **ToS Detection**: Automatically detects when you're viewing a Terms of Service agreement.
- **Summary Generation**: Provides a concise summary of the ToS in plain language.
- **Readability Grade**: Grades the ToS text for language complexity using one readability algorithm (Flesch-Kincaid Readability).
- **Rights Retention Grade**: Grades the ToS based on how much freedom or rights are retained or taken, using a sophisticated TensorFlow.js language model.
- **Enhanced Readability Grading**: Utilizes additional algorithms (Dale-Chall Readability and Gunning Fog Index) for a more comprehensive language difficulty assessment.
- **Uncommon Word Definitions**: Provides definitions for uncommon words or excerpts that significantly contribute to the grades.

## Additional Functionality

- Detects and highlights legal agreements on web pages
- Extracts relevant legal text for easy reading
- Opens a side panel with detailed information when activated

## Installation

1. Clone this repository or download the source code.
2. Open your browser's extension management page:
   - Chrome: `chrome://extensions`
   - Firefox: `about:addons`
3. Enable "Developer mode" (usually a toggle in the top right corner).
4. Click "Load unpacked" (Chrome) or "Load Temporary Add-on" (Firefox).
5. Select the directory containing the extension files.

## Usage

Terms Guardian can be activated in three ways:

1. **Context Window**: Right-click on highlighted text and select the Terms Guardian option from the context menu.
2. **Popup Notification**: Click on the popup notification that appears when a legal agreement is detected on a page.
3. **Extension Icon**: Click the Terms Guardian icon in the browser's toolbar.

Once activated, a side panel will open, displaying:

- The extracted legal text (if applicable)
- A summary of the legal document
- Readability grades
- Rights retention assessment
- Additional information about the detected agreement

## Components

- `background.js`: Handles background processes and communication between components
- `content.js`: Detects and highlights legal text on web pages
- `popup.js`: Manages the extension's popup interface
- `textExtractor.js`: Extracts relevant legal text from web pages
- `summarizer.js`: Generates summaries of legal documents
- `readabilityGrader.js`: Calculates readability scores using various algorithms
- `rightsAssessor.js`: Evaluates the rights retention based on the ToS content
- `styles.css`: Defines styles for highlighted text and the popup interface

## Permissions

The extension requires the following permissions:

- `activeTab`: To access and modify the content of the active tab
- `notifications`: To display notifications when legal agreements are detected
- `tabs`: To interact with browser tabs
- `scripting`: To inject content scripts into web pages

## Contributing

Contributions to Terms Guardian are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes and commit them with descriptive commit messages
4. Push your changes to your fork
5. Submit a pull request to the main repository

## License

MIT License

## Contact

time@3dtechsolutions.us