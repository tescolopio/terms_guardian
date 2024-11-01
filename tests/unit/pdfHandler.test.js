const { expect } = require('chai');
const sinon = require('sinon');
const { PDFHandler } = require('../../src/utils/pdfHandler');

describe('PDFHandler', () => {
  let logStub, logLevels, pdfHandler, mockPdfDoc;

  beforeEach(() => {
    logStub = sinon.stub();
    logLevels = {
      INFO: 'info',
      ERROR: 'error',
      DEBUG: 'debug'
    };
    pdfHandler = new PDFHandler({ log: logStub, logLevels });

    // Mock PDF document
    mockPdfDoc = {
      numPages: 2,
      getPage: sinon.stub().resolves({ getTextContent: sinon.stub().resolves({ items: [{ str: 'Test content' }] }) }),
      getMetadata: sinon.stub().resolves({ info: { Title: 'Test PDF' }, metadata: {} }),
      destroy: sinon.stub()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('initialize', () => {
    it('should initialize the handler', async () => {
      await pdfHandler.initialize();
      expect(pdfHandler.initialized).to.be.true;
      expect(logStub.calledWith(logLevels.INFO, 'Initializing PDF handler')).to.be.true;
      expect(logStub.calledWith(logLevels.INFO, 'PDF handler initialized successfully')).to.be.true;
    });

    it('should not reinitialize if already initialized', async () => {
      pdfHandler.initialized = true;
      await pdfHandler.initialize();
      expect(logStub.called).to.be.false;
    });

    it('should log an error if initialization fails', async () => {
      const error = new Error('Initialization error');
      logStub.throws(error);
      try {
        await pdfHandler.initialize();
      } catch (e) {
        expect(e).to.equal(error);
        expect(logStub.calledWith(logLevels.ERROR, 'Failed to initialize PDF handler:', error)).to.be.true;
      }
    });
  });

  describe('loadPDF', () => {
    beforeEach(() => {
      sinon.stub(pdfHandler, 'initialize').resolves();
      sinon.stub(pdfHandler, 'loadPDF').resolves(mockPdfDoc);
    });

    it('should load a PDF document', async () => {
      const pdfDoc = await pdfHandler.loadPDF();
      expect(pdfDoc.numPages).to.equal(2);
      expect(logStub.calledWith(logLevels.INFO, 'Loading PDF document')).to.be.true;
    });

    it('should initialize if not already initialized', async () => {
      pdfHandler.initialized = false;
      const initializeSpy = sinon.spy(pdfHandler, 'initialize');
      await pdfHandler.loadPDF();
      expect(initializeSpy.calledOnce).to.be.true;
    });

    it('should log an error if loading PDF fails', async () => {
      const error = new Error('Load PDF error');
      pdfHandler.loadPDF.rejects(error);
      try {
        await pdfHandler.loadPDF();
      } catch (e) {
        expect(e).to.equal(error);
        expect(logStub.calledWith(logLevels.ERROR, 'Failed to load PDF:', error)).to.be.true;
      }
    });
  });

  describe('extractText', () => {
    beforeEach(() => {
      sinon.stub(pdfHandler, 'loadPDF').resolves(mockPdfDoc);
    });

    it('should extract text from PDF document', async () => {
      const text = await pdfHandler.extractText(mockPdfDoc);
      expect(text).to.equal('Test content');
    });

    it('should log an error if text extraction fails', async () => {
      const error = new Error('Extract text error');
      mockPdfDoc.getPage.rejects(error);
      try {
        await pdfHandler.extractText(mockPdfDoc);
      } catch (e) {
        expect(e).to.equal(error);
        expect(logStub.calledWith(logLevels.ERROR, 'Failed to extract text:', error)).to.be.true;
      }
    });
  });

  describe('getMetadata', () => {
    beforeEach(() => {
      sinon.stub(pdfHandler, 'loadPDF').resolves(mockPdfDoc);
    });

    it('should get metadata from PDF document', async () => {
      const metadata = await pdfHandler.getMetadata(mockPdfDoc);
      expect(metadata.info.Title).to.equal('Test PDF');
      expect(metadata.pageCount).to.equal(2);
    });

    it('should log an error if getting metadata fails', async () => {
      const error = new Error('Get metadata error');
      mockPdfDoc.getMetadata.rejects(error);
      const metadata = await pdfHandler.getMetadata(mockPdfDoc);
      expect(metadata.info).to.deep.equal({});
      expect(metadata.pageCount).to.equal(2);
      expect(logStub.calledWith(logLevels.ERROR, 'Failed to get metadata:', error)).to.be.true;
    });
  });

  describe('cleanup', () => {
    beforeEach(() => {
      sinon.stub(pdfHandler, 'loadPDF').resolves(mockPdfDoc);
    });

    it('should clean up resources', async () => {
      await pdfHandler.cleanup(mockPdfDoc);
      expect(mockPdfDoc.destroy.calledOnce).to.be.true;
      expect(logStub.calledWith(logLevels.DEBUG, 'PDF document destroyed')).to.be.true;
    });

    it('should log an error if cleanup fails', async () => {
      const error = new Error('Cleanup error');
      mockPdfDoc.destroy.rejects(error);
      await pdfHandler.cleanup(mockPdfDoc);
      expect(logStub.calledWith(logLevels.ERROR, 'Error during cleanup:', error)).to.be.true;
    });
  });
});