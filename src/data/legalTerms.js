/**
 * @file legalTerms.js
 * @description This script contains an array of legal terms used for detecting legal agreements.
 * @contributors {tescolopio}
 * @version 1.1.0
 * @date 2024-09-25
 * 
 * @author Timmothy Escolopio
 * @company 3D Tech Solutions LLC
 * 
 * @changes
 *  - 2024-09-18 | tescolopio | Initial creation of the script.
 *  - 2024-09-25 | tescolopio | Modified to work with Chrome extension content scripts.
 */

const legalTerms = [
    'terms of service', 'terms and conditions', 'user agreement', 'service agreement',
    'terms of use', 'legal terms', 'user terms', 'usage policy', 'acceptable use policy',
    'end user license agreement', 'eula', 'legal notice', 'site terms', 'website terms',
    'service terms', 'conditions of use', 'terms', 'legal agreement', 'user policy',
    'service conditions', 'terms & policies', 'legal information', 'agreement',
    'rules and regulations', 'user guidelines', 'service rules', 'privacy', 'tos',
    'disclaimer', 'liability', 'warranty', 'indemnity', 'confidentiality', 'non-disclosure agreement',
    'nda', 'intellectual property', 'ip rights', 'license', 'licensing terms', 'service level agreement',
    'sla', 'data protection', 'cookie policy', 'gdpr', 'ccpa', 'privacy policy', 'refund policy',
    'return policy', 'cancellation policy', 'billing terms', 'payment terms', 'subscription terms'
];

if (typeof window !== 'undefined') {
    window.legalTerms = legalTerms;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { legalTerms };}