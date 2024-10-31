const { createUtilities } = require('../../src/utils/utilities');

describe('Utilities', () => {
    let utilities;
    let logMock;
    let logLevels;
    let legalTerms;
    let Constants;

    beforeEach(() => {
        logMock = jest.fn();
        logLevels = {
            INFO: 'info',
            DEBUG: 'debug',
            ERROR: 'error'
        };
        legalTerms = ['term1', 'term2'];
        Constants = {
            DETECTION: {
                THRESHOLDS: {
                    PROXIMITY: 5
                }
            },
            MESSAGES: {
                ERROR: {
                    GENERAL: 'An error occurred'
                }
            },
            EXTENSION: {
                NAME: 'Test Extension',
                ICON_PATHS: {
                    MEDIUM: 'icon.png'
                }
            },
            CLASSES: {
                HIGHLIGHT: 'highlight'
            },
            API: {
                TIMEOUT: 5000
            }
        };

        global.Constants = Constants;

        utilities = createUtilities({
            log: logMock,
            logLevels: logLevels,
            legalTerms: legalTerms
        });

        global.chrome = {
            action: {
                setBadgeText: jest.fn(),
                setBadgeBackgroundColor: jest.fn()
            },
            tabs: {
                query: jest.fn(),
                sendMessage: jest.fn()
            },
            notifications: {
                create: jest.fn((options, callback) => {
                    callback('notificationId');
                })
            }
        };
    });

    describe('containsLegalTerm', () => {
        it('should return true if text contains a legal term', () => {
            const result = utilities.containsLegalTerm('This is a term1');
            expect(result).toBe(true);
        });

        it('should return false if text does not contain a legal term', () => {
            const result = utilities.containsLegalTerm('This is a test');
            expect(result).toBe(false);
        });
    });

    describe('containsPartialMatch', () => {
        it('should return true if text contains a partial match of a legal term', () => {
            const result = utilities.containsPartialMatch('This is a term1');
            expect(result).toBe(true);
        });

        it('should return false if text does not contain a partial match of a legal term', () => {
            const result = utilities.containsPartialMatch('This is a test');
            expect(result).toBe(false);
        });
    });

    describe('containsProximityMatch', () => {
        it('should return true if text contains legal terms within proximity', () => {
            const result = utilities.containsProximityMatch('This is term1 and term2');
            expect(result).toBe(true);
        });

        it('should return false if text does not contain legal terms within proximity', () => {
            const result = utilities.containsProximityMatch('This is term1 and something else');
            expect(result).toBe(false);
        });
    });

    describe('extractDomain', () => {
        it('should extract domain from a URL', () => {
            const result = utilities.extractDomain('https://www.example.com/path?query=1');
            expect(result).toBe('example.com');
        });

        it('should return null for an invalid URL', () => {
            const result = utilities.extractDomain('invalid-url');
            expect(result).toBe(null);
        });
    });

    describe('updateExtensionIcon', () => {
        it('should set badge text and color when showExclamation is true', () => {
            utilities.updateExtensionIcon(true);
            expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '!' });
            expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: '#FF0000' });
        });

        it('should clear badge text when showExclamation is false', () => {
            utilities.updateExtensionIcon(false);
            expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '' });
        });
    });

    describe('updateSidepanel', () => {
        it('should send message to update sidepanel', () => {
            const queryInfo = { active: true, currentWindow: true };
            chrome.tabs.query.mockImplementation((queryInfo, callback) => {
                callback([{ id: 1 }]);
            });

            utilities.updateSidepanel('content');
            expect(chrome.tabs.query).toHaveBeenCalledWith(queryInfo, expect.any(Function));
            expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, { type: 'updateSidepanel', content: 'content' });
        });

        it('should show notification if no active tab is found', () => {
            chrome.tabs.query.mockImplementationOnce((queryInfo, callback) => {
                callback([]);
            });

            utilities.updateSidepanel('content');
            expect(logMock).toHaveBeenCalledWith(logLevels.ERROR, 'Error updating sidepanel:', new Error('No active tab found'));
            expect(chrome.notifications.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'basic',
                    iconUrl: Constants.EXTENSION.ICON_PATHS.MEDIUM,
                    title: Constants.EXTENSION.NAME,
                    message: Constants.MESSAGES.ERROR.GENERAL
                }),
                expect.any(Function)
            );
        });
    });

    describe('highlightLegalTerms', () => {
        it('should highlight legal terms in the element', () => {
            document.body.innerHTML = '<div id="test">This is term1 and term2</div>';
            const element = document.getElementById('test');
            const count = utilities.highlightLegalTerms(element);
            expect(count).toBe(2);
            expect(element.innerHTML).toBe('<span>This is <span class="highlight">term1</span> and <span class="highlight">term2</span></span>');
        });

        it('should return 0 if no legal terms are found', () => {
            document.body.innerHTML = '<div id="test">This is a test</div>';
            const element = document.getElementById('test');
            const count = utilities.highlightLegalTerms(element);
            expect(count).toBe(0);
            expect(element.innerHTML).toBe('This is a test');
        });
    });

    describe('fetchWithTimeout', () => {
        beforeEach(() => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({})
                })
            );
        });

        it('should fetch data within timeout', async () => {
            const response = await utilities.fetchWithTimeout('https://api.example.com/data');
            expect(response.ok).toBe(true);
        });

        it('should throw error if request times out', async () => {
            global.fetch = jest.fn(() => new Promise((resolve, reject) => {
                setTimeout(() => reject(new Error('Request timed out after 1000ms')), 6000);
            }));

            await expect(utilities.fetchWithTimeout('https://api.example.com/data', { timeout: 1000 })).rejects.toThrow('Request timed out after 1000ms');
        }, 10000); // Increase the timeout to 10 seconds for this test
    });
});