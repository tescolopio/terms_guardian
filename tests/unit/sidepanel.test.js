const { JSDOM } = require('jsdom');
const { createSidepanel } = require('../../src/panel/sidepanel');

describe('Sidepanel', () => {
    let dom;
    let sidepanel;
    let elements;
    let mockLog;
    let mockLogLevels;
    let mockConstants;
    let mockDebug;

    beforeEach(() => {
        dom = new JSDOM(`
            <div id="sidepanel-content"></div>
            <a id="terms-url"></a>
            <h1 id="terms-title"></h1>
            <div id="readability-grade"></div>
            <div id="user-rights-index"></div>
            <div id="overall-summary"></div>
            <div id="section-summaries"></div>
            <div id="key-excerpts-list"></div>
            <div id="uncommon-terms-list"></div>
            <div id="status-message"></div>
        `);

        global.document = dom.window.document;
        global.window = dom.window;

        mockLog = jest.fn();
        mockLogLevels = { info: 'info', error: 'error' };
        mockConstants = {
            SELECTORS: {},
            MESSAGES: {
                UPDATE_SIDEPANEL: 'updateSidepanel',
                ANALYSIS_ERROR: 'analysisError',
                CLEAR_PANEL: 'clearPanel'
            },
            CLASSES: {},
            DEBUG: {
                MODULES: { SIDEPANEL: 'sidepanel' }
            }
        };
        mockDebug = {
            startGroup: jest.fn(),
            info: jest.fn(),
            startTimer: jest.fn(),
            endTimer: jest.fn(),
            endGroup: jest.fn(),
            error: jest.fn()
        };

        global.Constants = mockConstants;
        global.debug = mockDebug;

        sidepanel = createSidepanel({ log: mockLog, logLevels: mockLogLevels });
        elements = {
            content: document.getElementById('sidepanel-content'),
            termsUrl: document.getElementById('terms-url'),
            termsTitle: document.getElementById('terms-title'),
            readabilityGrade: document.getElementById('readability-grade'),
            userRightsIndex: document.getElementById('user-rights-index'),
            overallSummary: document.getElementById('overall-summary'),
            sectionSummaries: document.getElementById('section-summaries'),
            keyExcerptsList: document.getElementById('key-excerpts-list'),
            uncommonTermsList: document.getElementById('uncommon-terms-list'),
            statusMessage: document.getElementById('status-message')
        };
    });

    afterEach(() => {
        dom.window.close();
    });

    test('should initialize sidepanel and set up event listeners', () => {
        expect(mockDebug.startGroup).toHaveBeenCalledWith(mockConstants.DEBUG.MODULES.SIDEPANEL);
        expect(mockDebug.info).toHaveBeenCalledWith('Initializing sidepanel');
        expect(mockDebug.endGroup).toHaveBeenCalled();
    });

    test('should update document information', () => {
        const info = { url: 'http://example.com', title: 'Example Terms' };
        sidepanel.updateContent({ documentInfo: info });

        expect(elements.termsUrl.href).toBe(info.url);
        expect(elements.termsUrl.textContent).toBe(info.url);
        expect(elements.termsTitle.textContent).toBe(info.title);
    });

    test('should update scores', () => {
        const scores = { readability: { grade: 'A' }, rights: 0.85 };
        sidepanel.updateContent({ scores });

        expect(elements.readabilityGrade.textContent).toBe('A');
        expect(elements.userRightsIndex.textContent).toBe('85%');
    });

    test('should handle update errors', async () => {
        const error = new Error('Test error');
        sidepanel.updateContent = jest.fn().mockImplementation(() => {
            throw error;
        });

        try {
            await sidepanel.updateContent({});
        } catch (e) {
            expect(mockDebug.error).toHaveBeenCalledWith('Error updating panel', { error });
            expect(elements.content.classList.contains('error')).toBe(true);
            expect(elements.statusMessage.textContent).toBe('Error updating panel');
        }
    });

    test('should show status message', () => {
        sidepanel.showStatusMessage('Test message', 'success');
        expect(elements.statusMessage.textContent).toBe('Test message');
        expect(elements.statusMessage.className).toBe('status-message success');
    });

    test('should summarize content', () => {
        const content = {
            scores: { readability: { grade: 'A' }, rights: 0.85 },
            sections: [{}, {}],
            terms: [{}, {}, {}]
        };
        const summary = sidepanel.summarizeContent(content);
        expect(summary).toEqual({
            hasScores: true,
            sectionsCount: 2,
            termsCount: 3,
            timestamp: expect.any(String)
        });
    });

    describe('Sidepanel', () => {
        let dom;
        let sidepanel;
        let elements;
        let mockLog;
        let mockLogLevels;
        let mockConstants;
        let mockDebug;

        beforeEach(() => {
            dom = new JSDOM(`
                <div id="sidepanel-content"></div>
                <a id="terms-url"></a>
                <h1 id="terms-title"></h1>
                <div id="readability-grade"></div>
                <div id="user-rights-index"></div>
                <div id="overall-summary"></div>
                <div id="section-summaries"></div>
                <div id="key-excerpts-list"></div>
                <div id="uncommon-terms-list"></div>
                <div id="status-message"></div>
                <div class="loading-indicator"></div>
            `);

            global.document = dom.window.document;
            global.window = dom.window;

            mockLog = jest.fn();
            mockLogLevels = { info: 'info', error: 'error' };
            mockConstants = {
                SELECTORS: {
                    POPUPS: {
                        TERMS: 'termsPopup',
                        EXCERPTS: 'excerptsPopup'
                    },
                    SIDEPANEL: {
                        KEY_EXCERPTS_LIST: 'key-excerpts-list'
                    }
                },
                MESSAGES: {
                    UPDATE_SIDEPANEL: 'updateSidepanel',
                    ANALYSIS_ERROR: 'analysisError',
                    CLEAR_PANEL: 'clearPanel'
                },
                CLASSES: {
                    SECTION_SUMMARY: 'section-summary',
                    UNCOMMON_TERM: 'uncommon-term'
                },
                DEBUG: {
                    MODULES: { SIDEPANEL: 'sidepanel' }
                }
            };
            mockDebug = {
                startGroup: jest.fn(),
                info: jest.fn(),
                startTimer: jest.fn(),
                endTimer: jest.fn(),
                endGroup: jest.fn(),
                error: jest.fn()
            };

            global.Constants = mockConstants;
            global.debug = mockDebug;

            sidepanel = createSidepanel({ log: mockLog, logLevels: mockLogLevels });
            elements = {
                content: document.getElementById('sidepanel-content'),
                termsUrl: document.getElementById('terms-url'),
                termsTitle: document.getElementById('terms-title'),
                readabilityGrade: document.getElementById('readability-grade'),
                userRightsIndex: document.getElementById('user-rights-index'),
                overallSummary: document.getElementById('overall-summary'),
                sectionSummaries: document.getElementById('section-summaries'),
                keyExcerptsList: document.getElementById('key-excerpts-list'),
                uncommonTermsList: document.getElementById('uncommon-terms-list'),
                statusMessage: document.getElementById('status-message'),
                loadingIndicator: document.querySelector('.loading-indicator')
            };
        });

        afterEach(() => {
            dom.window.close();
        });

        test('should initialize sidepanel and set up event listeners', () => {
            expect(mockDebug.startGroup).toHaveBeenCalledWith(mockConstants.DEBUG.MODULES.SIDEPANEL);
            expect(mockDebug.startTimer).toHaveBeenCalledWith('sidepanelInit');
            expect(mockDebug.endTimer).toHaveBeenCalledWith('sidepanelInit');
            expect(mockDebug.endGroup).toHaveBeenCalled();
        });

        test('should update document information', () => {
            const info = { url: 'http://example.com', title: 'Example Terms' };
            sidepanel.updateContent({ documentInfo: info });

            expect(elements.termsUrl.href).toBe(info.url);
            expect(elements.termsUrl.textContent).toBe(info.url);
            expect(elements.termsTitle.textContent).toBe(info.title);
        });

        test('should update scores', () => {
            const scores = { readability: { grade: 'A' }, rights: 0.85 };
            sidepanel.updateContent({ scores });

            expect(elements.readabilityGrade.textContent).toBe('A');
            expect(elements.userRightsIndex.textContent).toBe('85%');
        });

        test('should handle update errors', async () => {
            const error = new Error('Test error');
            sidepanel.updateContent = jest.fn().mockImplementation(() => {
                throw error;
            });

            try {
                await sidepanel.updateContent({});
            } catch (e) {
                expect(mockDebug.error).toHaveBeenCalledWith('Error in panel-update:', error);
                expect(elements.content.classList.contains('error')).toBe(true);
                expect(elements.statusMessage.textContent).toBe('An error occurred while processing your request');
            }
        });

        test('should show status message', () => {
            sidepanel.status.show('Test message', 'success');
            expect(elements.statusMessage.textContent).toBe('Test message');
            expect(elements.statusMessage.className).toBe('status-message success');
        });

        test('should clear status message', () => {
            sidepanel.status.show('Test message', 'success');
            sidepanel.status.clear();
            expect(elements.statusMessage.className).toBe('status-message');
            expect(elements.statusMessage.textContent).toBe('');
        });

        test('should start and end loading state', () => {
            sidepanel.loading.start('Loading...');
            expect(elements.content.classList.contains('loading')).toBe(true);
            expect(elements.loadingIndicator.style.display).toBe('block');
            expect(elements.loadingIndicator.textContent).toBe('Loading...');

            sidepanel.loading.end();
            expect(elements.content.classList.contains('loading')).toBe(false);
            expect(elements.loadingIndicator.style.display).toBe('none');
        });

        test('should clear panel', () => {
            sidepanel.clearPanel();
            expect(elements.content.classList.contains('loading')).toBe(false);
            expect(elements.content.classList.contains('updating')).toBe(false);
            expect(elements.content.classList.contains('error')).toBe(false);
            expect(elements.sectionSummaries.innerHTML).toBe('');
            expect(elements.keyExcerptsList.innerHTML).toBe('');
            expect(elements.uncommonTermsList.innerHTML).toBe('');
            expect(elements.statusMessage.className).toBe('status-message');
            expect(elements.statusMessage.textContent).toBe('');
        });

        test('should update sections', () => {
            const sections = [
                { heading: 'Section 1', summary: 'Summary 1' },
                { heading: 'Section 2', summary: 'Summary 2' }
            ];
            sidepanel.updateContent({ sections });

            expect(elements.sectionSummaries.children.length).toBe(2);
            expect(elements.sectionSummaries.children[0].querySelector('h3').textContent).toBe('Section 1');
            expect(elements.sectionSummaries.children[0].querySelector('p').textContent).toBe('Summary 1');
            expect(elements.sectionSummaries.children[1].querySelector('h3').textContent).toBe('Section 2');
            expect(elements.sectionSummaries.children[1].querySelector('p').textContent).toBe('Summary 2');
        });

        test('should update excerpts', () => {
            const excerpts = ['Excerpt 1', 'Excerpt 2'];
            sidepanel.updateContent({ excerpts });

            expect(elements.keyExcerptsList.children.length).toBe(2);
            expect(elements.keyExcerptsList.children[0].textContent).toBe('"Excerpt 1"');
            expect(elements.keyExcerptsList.children[1].textContent).toBe('"Excerpt 2"');
        });

        test('should update terms', () => {
            const terms = [
                { word: 'Term 1', definition: 'Definition 1' },
                { word: 'Term 2', definition: 'Definition 2' }
            ];
            sidepanel.updateContent({ terms });

            expect(elements.uncommonTermsList.children.length).toBe(2);
            expect(elements.uncommonTermsList.children[0].textContent).toBe('Term 1');
            expect(elements.uncommonTermsList.children[0].getAttribute('data-definition')).toBe('Definition 1');
            expect(elements.uncommonTermsList.children[1].textContent).toBe('Term 2');
            expect(elements.uncommonTermsList.children[1].getAttribute('data-definition')).toBe('Definition 2');
        });

        test('should show and hide popups', () => {
            const popup = document.createElement('div');
            popup.id = 'testPopup';
            popup.style.display = 'none';
            document.body.appendChild(popup);

            sidepanel.showPopup('testPopup');
            expect(popup.style.display).toBe('block');

            sidepanel.hidePopup('testPopup');
            expect(popup.style.display).toBe('none');

            document.body.removeChild(popup);
        });
    });
});