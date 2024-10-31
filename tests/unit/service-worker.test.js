const { createServiceWorker } = require('../../src/background/service-worker');

describe('Service Worker', () => {
    let serviceWorker;
    let logMock;
    let chromeMock;

    beforeEach(() => {
        logMock = jest.fn();
        chromeMock = {
            contextMenus: {
                create: jest.fn(),
                onClicked: {
                    addListener: jest.fn()
                }
            },
            notifications: {
                create: jest.fn()
            },
            storage: {
                local: {
                    set: jest.fn(),
                    get: jest.fn()
                }
            },
            sidePanel: {
                open: jest.fn()
            },
            runtime: {
                onInstalled: {
                    addListener: jest.fn()
                },
                onMessage: {
                    addListener: jest.fn()
                }
            }
        };

        global.chrome = chromeMock;
        global.Constants = {
            STORAGE_KEYS: {
                LAST_WORD: 'lastWord',
                ANALYSIS_RESULTS: 'analysisResults'
            },
            CONTEXT_MENU: {
                GRADE_TEXT: 'gradeText'
            },
            MESSAGES: {
                ERROR: {
                    GENERAL: 'An error occurred',
                    UNKNOWN_ACTION: 'Unknown action',
                    ANALYSIS_FAILED: 'Analysis failed'
                },
                AUTO_GRADE: 'Auto grade completed'
            },
            EXTENSION: {
                NAME: 'Terms Guardian',
                ICON_PATHS: {
                    MEDIUM: 'icon_medium.png'
                }
            }
        };

        serviceWorker = createServiceWorker({
            log: logMock,
            logLevels: {
                ERROR: 0,
                WARN: 1,
                INFO: 2,
                DEBUG: 3
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should initialize service worker', () => {
        serviceWorker.initialize();
        expect(chrome.runtime.onInstalled.addListener).toHaveBeenCalled();
        expect(chrome.contextMenus.onClicked.addListener).toHaveBeenCalled();
        expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
        expect(logMock).toHaveBeenCalledWith(2, 'Service worker initialized successfully');
    });

    test('should set up context menu', () => {
        serviceWorker._test.setupContextMenu();
        expect(chrome.contextMenus.create).toHaveBeenCalledWith(global.Constants.CONTEXT_MENU.GRADE_TEXT);
        expect(logMock).toHaveBeenCalledWith(2, 'Context menu created successfully');
    });

    test('should show notification', () => {
        const message = 'Test notification';
        serviceWorker._test.showNotification(message);
        expect(chrome.notifications.create).toHaveBeenCalledWith(
            {
                type: 'basic',
                title: global.Constants.EXTENSION.NAME,
                message: message,
                iconUrl: global.Constants.EXTENSION.ICON_PATHS.MEDIUM
            },
            expect.any(Function)
        );
    });

    test('should handle context menu click', async () => {
        const data = { selectionText: 'test' };
        const tab = { id: 1 };
        await serviceWorker._test.handleContextMenuClick(data, tab);
        expect(chrome.storage.local.set).toHaveBeenCalledWith({ lastWord: 'test' });
        expect(chrome.sidePanel.open).toHaveBeenCalledWith({ tabId: 1 });
        expect(logMock).toHaveBeenCalledWith(2, 'Context menu actions completed successfully');
    });

    test('should handle message routing', async () => {
        const sendResponse = jest.fn();
        const message = { action: 'getWord' };
        const sender = { tab: { id: 1 } };
        chrome.storage.local.get.mockResolvedValue({ lastWord: 'test' });

        await serviceWorker._test.handleMessage(message, sender, sendResponse);
        expect(sendResponse).toHaveBeenCalledWith({ lastWord: 'test' });
    });

    test('should handle ToS detection', async () => {
        const message = { text: 'test' };
        const sender = { tab: { id: 1 } };
        const analyzeContentMock = jest.fn().mockResolvedValue({
            readability: 'easy',
            rights: 'all',
            summary: 'summary',
            uncommonWords: ['word1', 'word2']
        });

        serviceWorker._test.analyzeContent = analyzeContentMock;

        await serviceWorker._test.handleTosDetected(message, sender);
        expect(analyzeContentMock).toHaveBeenCalledWith('test');
        expect(chrome.storage.local.set).toHaveBeenCalledWith({
            analysisResults_1: expect.objectContaining({
                readability: 'easy',
                rights: 'all',
                summary: 'summary',
                uncommonWords: ['word1', 'word2'],
                timestamp: expect.any(String)
            })
        });
        expect(chrome.notifications.create).toHaveBeenCalled();
        expect(logMock).toHaveBeenCalledWith(2, 'ToS analysis completed successfully');
    });

    test('should handle check notification', async () => {
        const tab = { url: 'https://example.com' };
        const result = await serviceWorker._test.handleCheckNotification(tab);
        expect(result).toEqual({ shouldShow: false, domain: 'example.com' });
    });
});