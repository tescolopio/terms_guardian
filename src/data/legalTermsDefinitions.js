/**
 * @file legalTermsDefinitions.js
 * @description Definitions of common legal terms used in Terms of Service and similar agreements
 * @version 1.0.0
 * @date 2024-10-29
 * 
 * @author Timmothy Escolopio
 * @company 3D Tech Solutions LLC
 */

const legalTermsDefinitions = {
    // Agreement Types
    'terms of service': 'A legal agreement between a service provider and user that governs the use of a service.',
    'privacy policy': 'A document explaining how an organization collects, uses, and protects user data.',
    'eula': 'End User License Agreement - A legal contract between software provider and purchaser.',
    'sla': 'Service Level Agreement - A contract defining the expected level of service between provider and client.',
    'nda': 'Non-Disclosure Agreement - A contract requiring parties to keep specified information confidential.',
    
    // Legal Concepts
    'liability': 'Legal responsibility for one\'s acts or omissions.',
    'warranty': 'A guarantee or promise about the quality, characteristics, or performance of a product or service.',
    'indemnity': 'An obligation to compensate for a loss or damage incurred.',
    'jurisdiction': 'The legal authority of a court or other institution to make decisions about a matter.',
    'arbitration': 'A method of resolving disputes outside of court through an impartial third party.',
    
    // Rights and Ownership
    'intellectual property': 'Creations of the mind, such as inventions, literary works, designs, and symbols used in commerce.',
    'copyright': 'Legal protection for original works of authorship.',
    'trademark': 'A symbol, word, or words legally registered or established as representing a company or product.',
    'patent': 'A government license conferring exclusive rights to an invention.',
    'license': 'Permission to use something owned or controlled by another party.',
    
    // Privacy and Data
    'gdpr': 'General Data Protection Regulation - EU law on data protection and privacy.',
    'ccpa': 'California Consumer Privacy Act - Law protecting California residents\' privacy rights.',
    'data protection': 'Legal measures to ensure secure handling of personal information.',
    'cookie policy': 'Document explaining how a website uses tracking technologies.',
    'confidentiality': 'The obligation to keep certain information private or secret.',
    
    // Financial Terms
    'billing terms': 'Conditions governing payment for services or products.',
    'refund policy': 'Rules regarding the return of money paid for products or services.',
    'subscription terms': 'Conditions governing recurring payment arrangements.',
    'payment terms': 'Conditions under which payments must be made.',
    'cancellation policy': 'Rules regarding the termination of services or agreements.',
    
    // Usage Rights
    'acceptable use': 'Permitted ways of using a service or product.',
    'user guidelines': 'Rules and recommendations for using a service.',
    'service rules': 'Specific regulations governing the use of a service.',
    'usage policy': 'Framework of rules for using a service or product.',
    'user rights': 'Legal entitlements granted to users of a service.',
    
    // Compliance
    'compliance': 'Adherence to rules, regulations, or standards.',
    'regulatory': 'Relating to or arising from official rules or laws.',
    'statutory': 'Required, permitted, or enacted by statute.',
    'governing law': 'The law that will be used to interpret the agreement.',
    'enforcement': 'The act of compelling observance of or compliance with a law.',
    
    // Legal Actions
    'litigation': 'The process of taking legal action.',
    'dispute resolution': 'Methods for resolving disagreements between parties.',
    'mediation': 'Intervention in a dispute to help reach agreement.',
    'termination': 'The act of ending something, especially a legal agreement.',
    'breach': 'Violation of a law, obligation, or agreement.',
    
    // Responsibilities
    'obligation': 'A duty to perform certain actions.',
    'duty': 'A legal or moral obligation.',
    'responsibility': 'The state of being accountable for something.',
    'liability limitation': 'Restrictions on legal responsibility for damages.',
    'force majeure': 'Unforeseeable circumstances preventing fulfillment of a contract.',
    
    // Content Rights
    'user content': 'Material created or provided by users of a service.',
    'proprietary rights': 'Rights belonging to the owner of something.',
    'fair use': 'Limited use of copyrighted material without permission for purposes such as commentary, criticism, or parody.',
    'content license': 'Permission to use specific content in defined ways.',
    'ownership rights': 'Legal rights of possession and control.'
};

if (typeof window !== 'undefined') {
    window.legalTermsDefinitions = legalTermsDefinitions;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { legalTermsDefinitions };}