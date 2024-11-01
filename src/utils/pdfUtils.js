/**
 * @file pdfUtils.js
 * @description PDF.js initialization and utility functions
 */

import * as pdfjsLib from 'pdfjs-dist';

// Set worker path for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.js');

/**
 * Initialize PDF document
 * @param {ArrayBuffer} pdfData PDF file data
 * @returns {Promise<PDFDocumentProxy>} PDF document
 */
export async function initPDFDocument(pdfData) {
  try {
    return await pdfjsLib.getDocument({
      data: pdfData,
      cMapUrl: chrome.runtime.getURL('cmaps/'),
      cMapPacked: true
    }).promise;
  } catch (error) {
    console.error('Error initializing PDF document:', error);
    throw error;
  }
}

/**
 * Extract text content from PDF
 * @param {PDFDocumentProxy} pdfDoc PDF document
 * @returns {Promise<string>} Extracted text
 */
export async function extractPDFText(pdfDoc) {
  try {
    const numPages = pdfDoc.numPages;
    const textContent = [];
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const text = await page.getTextContent();
      textContent.push(text.items.map(item => item.str).join(' '));
    }
    
    return textContent.join('\n');
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw error;
  }
}