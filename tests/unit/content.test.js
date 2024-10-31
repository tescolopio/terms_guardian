const { JSDOM } = require('jsdom');
const { expect } = require('chai');
const sinon = require('sinon');
const ContentController = require('../../src/content/content.js');

// Mock global variables and objects
global.Constants = {
    DETECTION: {
        INTERVAL: 1000,
        THRESHOLDS: {
            AUTO_GRADE: 10,
            NOTIFY: 5
        }
    },
    MESSAGES: {},
    CLASSES: {
        HIGHLIGHT: 'highlight'
    }
};

global.RightsAssessor = {
    create: sinon.stub().returns({
        analyzeContent: sinon.stub().resolves('rightsAnalysis')
    })
};

global.TosSummarizer = {
    create: sinon.stub().returns({})
};

global.TextExtractor = {
    create: sinon.stub().returns({
        extractAndAnalyzePageText: sinon.stub().resolves({
            metadata: { legalTermCount: 6 },
            text: 'sample text'
        })
    })
};

global.UncommonWordsIdentifier = {
    create: sinon.stub().returns({
        identifyUncommonWords: sinon.stub().resolves('uncommonWords')
    })
};

global.commonWords = [];
global.legalTermsDefinitions = [];
global.legalTerms = [];
global.compromise = {};
global.cheerio = {};

// Mock the chrome API
global.chrome = {
    runtime: {
        sendMessage: sinon.stub()
    },
    action: {
        setBadgeText: sinon.stub()
    }
};

describe('ContentController', () => {
    let controller;
    let logStub;
    let clock;

    beforeEach(() => {
        logStub = sinon.stub();
        clock = sinon.useFakeTimers();

        controller = new ContentController({
            log: logStub,
            logLevels: {
                ERROR: 0,
                WARN: 1,
                INFO: 2,
                DEBUG: 3
            }
        });
    });

    afterEach(() => {
        clock.restore();
    });

    it('should initialize analyzers successfully', () => {
        expect(global.RightsAssessor.create.calledOnce).to.be.true;
        expect(global.TosSummarizer.create.calledOnce).to.be.true;
        expect(global.TextExtractor.create.calledOnce).to.be.true;
        expect(global.UncommonWordsIdentifier.create.calledOnce).to.be.true;
        expect(logStub.calledWith(2, "All analyzers initialized successfully")).to.be.true;
    });

    it('should update the extension icon', () => {
        const setBadgeTextStub = sinon.stub(chrome.action, 'setBadgeText');

        controller.updateExtensionIcon(true);
        expect(setBadgeTextStub.calledWith({ text: '!' })).to.be.true;
        expect(logStub.calledWith(2, 'Extension badge set')).to.be.true;

        controller.updateExtensionIcon(false);
        expect(setBadgeTextStub.calledWith({ text: '' })).to.be.true;
        expect(logStub.calledWith(2, 'Extension badge cleared')).to.be.true;

        setBadgeTextStub.restore();
    });

    it('should detect legal agreements and handle moderate legal term count', async () => {
        const handleModerateLegalTermCountStub = sinon.stub(controller, 'handleModerateLegalTermCount');
        const updateExtensionIconStub = sinon.stub(controller, 'updateExtensionIcon');

        await controller.detectLegalAgreements();
        expect(handleModerateLegalTermCountStub.calledOnce).to.be.true;
        expect(updateExtensionIconStub.calledWith(false)).to.be.false;

        handleModerateLegalTermCountStub.restore();
        updateExtensionIconStub.restore();
    });

    it('should handle high legal term count', async () => {
        const updateExtensionIconStub = sinon.stub(controller, 'updateExtensionIcon');
        const performFullAnalysisStub = sinon.stub(controller, 'performFullAnalysis').resolves('analysis');
        const sendMessageStub = sinon.stub(chrome.runtime, 'sendMessage');

        await controller.handleHighLegalTermCount('sample text');
        expect(updateExtensionIconStub.calledWith(true)).to.be.true;
        expect(sendMessageStub.calledWith({
            type: 'tosDetected',
            text: 'sample text',
            analysis: 'analysis'
        })).to.be.true;

        updateExtensionIconStub.restore();
        performFullAnalysisStub.restore();
        sendMessageStub.restore();
    });

    it('should perform full analysis', async () => {
        const analysis = await controller.performFullAnalysis('sample text');
        expect(analysis).to.deep.equal({
            rights: 'rightsAnalysis',
            uncommonWords: 'uncommonWords',
            timestamp: new Date().toISOString()
        });
    });

    it('should initialize the content script', () => {
        const detectLegalAgreementsStub = sinon.stub(controller, 'detectLegalAgreements');
        const setupMessageListenersStub = sinon.stub(controller, 'setupMessageListeners');
        const observerStub = sinon.stub(MutationObserver.prototype, 'observe');

        controller.initialize();
        expect(detectLegalAgreementsStub.calledOnce).to.be.true;
        expect(setupMessageListenersStub.calledOnce).to.be.true;
        expect(observerStub.calledOnce).to.be.true;

        detectLegalAgreementsStub.restore();
        setupMessageListenersStub.restore();
        observerStub.restore();
    });

    it('should handle grade text requests', async () => {
        const selectedTextStub = sinon.stub(window, 'getSelection').returns({
            toString: () => 'selected text'
        });
        const detectLegalAgreementsStub = sinon.stub(controller, 'detectLegalAgreements').resolves(true);
        const performFullAnalysisStub = sinon.stub(controller, 'performFullAnalysis').resolves('analysis');
        const sendMessageStub = sinon.stub(chrome.runtime, 'sendMessage');

        await controller.handleGradeTextRequest();
        expect(detectLegalAgreementsStub.calledWith('selected text')).to.be.true;
        expect(sendMessageStub.calledWith({
            type: 'tosDetected',
            text: 'selected text',
            analysis: 'analysis'
        })).to.be.true;

        selectedTextStub.restore();
        detectLegalAgreementsStub.restore();
        performFullAnalysisStub.restore();
        sendMessageStub.restore();
    });
});