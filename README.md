# Terms Guardian

## We believe

- You should always know what rights you are retaining or surrendering when you agree to any Terms of Service.
- Everyone deserves to understand the agreements they enter into without needing a law degree.
- Companies should be held accountable for the clarity and fairness of their Terms of Service.
- Building trust between users and service providers starts with clear and honest communication.
- Leveraging technology to simplify legal language is a step towards a more user-friendly internet.

## What is Term Guardian?

Terms Guardian is a web browser extension designed to empower users by demystifying the complex language often found in Terms of Service (ToS) agreements. It automatically detects ToS text on websites, grades its readability, summarizes its content into plain language, and assesses the rights retained or surrendered.

## Features

### 1. Plain Language Summary
- **What it is**: A concise, easy-to-understand explanation of the ToS
  - Breaks down complex legal concepts into everyday language
  - Highlights key points that affect user rights
  - Identifies important obligations and commitments
  - Points out unusual or important terms

### 2. Readability Assessment
- **What it is**: A multi-faceted analysis of the text's complexity
  - Flesch-Kincaid Readability Score (0-100, higher is more readable)
  - Dale-Chall Readability Index (Grade level equivalent)
  - Gunning Fog Index (Years of formal education needed)
  - Letter grades from A+ to F- that translate scores into intuitive ratings
  - For detailed methodology, see our [Content Grading Guide](docs/contentGrading.md)

### 3. Rights Retention Grade
- **What it is**: An analysis of user rights within the agreement
  - A letter grade (A+ to F-) and numerical score (0-100) indicating overall rights fairness
  - Detailed breakdown of rights analysis
  - Rights retained by the user
  - Rights surrendered to the service
  - Unusual rights transfers
  - Industry standard comparisons
- **Rights Categories**:
  - Data Rights
  - Privacy Rights
  - Content Rights
  - Usage Rights
  - Cancellation Rights
- **Grading Methodology**: Our comprehensive [Content Grading Guide](docs/contentGrading.md) explains how we assess user rights and readability in detail

### 4. Legal Terms Dictionary
- **What it is**: Context-aware definitions of complex legal terms
  - Plain language definitions
  - Usage examples
  - Legal implications
  - Common variations

## How It Works

- Automatically identifies legal documents
- Extracts relevant text
- Performs multi-layer analysis
- Generates educational insights

## Usage

Terms Guardian can be activated in three ways:

1. **Context Window**: Right-click on highlighted text and select the Terms Guardian option from the context menu.
2. **Popup Notification**: Click on the popup notification that appears when a legal agreement is detected on a page.
3. **Extension Icon**: Click the Terms Guardian icon in the browser's toolbar.

The educational side panel displays:
- Plain language summary
- Readability scores with explanation
- Rights retention analysis
- Interactive legal terms dictionary
- Document-specific insights

## Documentation

- [Content Grading Methodology](docs/contentGrading.md): Detailed explanation of our User Rights Index and Readability assessment methodology
- [Installation Guide](docs/installation.md): Step-by-step instructions for installing and configuring Terms Guardian
- [Developer Documentation](docs/development.md): Guidelines for contributing to the project

## Components

- `background.js`: Handles background processes and communication between components
- `content.js`: Detects and highlights legal text on web pages
- `popup.js`: Manages the extension's popup interface
- `textExtractor.js`: Extracts relevant legal text from web pages
- `summarizer.js`: Generates summaries of legal documents
- `readabilityGrader.js`: Calculates readability scores using various algorithms
- `rightsAssessor.js`: Evaluates the rights retention based on the ToS content
- `styles.css`: Defines styles for highlighted text and the popup interface

## Installation

1. Clone this repository or download the source code
2. Open your browser's extension management page:
   - Chrome: `chrome://extensions`
   - Firefox: `about:addons`
3. Enable "Developer mode"
4. Click "Load unpacked" (Chrome) or "Load Temporary Add-on" (Firefox)
5. Select the extension directory

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
