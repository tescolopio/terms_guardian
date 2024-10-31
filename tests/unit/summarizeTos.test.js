const { createSummarizer } = require('../../src/analysis/summarizeTos');
const cheerio = require('cheerio');
const compromise = require('compromise');

describe('summarizeTos', () => {
    let summarizer;
    let log;
    let logLevels;

    beforeEach(() => {
        logLevels = {
            INFO: 'info',
            DEBUG: 'debug',
            ERROR: 'error'
        };

        log = jest.fn();

        summarizer = createSummarizer({ compromise, cheerio, log, logLevels });
    });

    test('should summarize ToS HTML correctly', () => {
        const html = `
            <h1>Introduction</h1>
            <p>Welcome to our terms of service.</p>
            <h2>Usage</h2>
            <p>You must follow the rules.</p>
            <h2>Privacy</h2>
            <p>We respect your privacy.</p>
        `;

        const result = summarizer.summarizeTos(html);

        expect(result.sections).toHaveLength(3);
        expect(result.sections[0].heading).toBe('Introduction');
        expect(result.sections[1].heading).toBe('Usage');
        expect(result.sections[2].heading).toBe('Privacy');
        expect(result.sections[0].summary).toContain('Welcome to our terms of service.');
        expect(result.sections[1].summary).toContain('You must follow the rules.');
        expect(result.sections[2].summary).toContain('We respect your privacy.');
        expect(result.metadata.sectionCount).toBe(3);
    });

    test('should handle empty HTML gracefully', () => {
        const html = '';

        const result = summarizer.summarizeTos(html);

        expect(result.sections).toHaveLength(0);
        expect(result.overall).toBe('An error occurred while summarizing the Terms of Service.');
    });

    test('should log errors during summarization', () => {
        const html = '<h1>Introduction</h1><p>Welcome to our terms of service.</p>';

        // Mock compromise to throw an error
        const mockCompromise = jest.fn(() => {
            throw new Error('Compromise error');
        });

        summarizer = createSummarizer({ compromise: mockCompromise, cheerio, log, logLevels });

        const result = summarizer.summarizeTos(html);

        expect(result.sections[0].summary).toBe('Error summarizing this section.');
        expect(log).toHaveBeenCalledWith(logLevels.ERROR, 'Error summarizing section:', {
            heading: 'Introduction',
            error: 'Compromise error'
        });
    });

    test('should handle sections without content', () => {
        const html = '<h1>Introduction</h1>';

        const result = summarizer.summarizeTos(html);

        expect(result.sections).toHaveLength(0);
        expect(result.overall).toBe('An error occurred while summarizing the Terms of Service.');
    });
});