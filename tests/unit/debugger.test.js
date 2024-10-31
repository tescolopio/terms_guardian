const { createDebugger } = require('../../src/utils/debugger');

describe('Debugger Utility', () => {
    let debugInstance;
    const mockConstants = {
        DEBUG: {
            DEFAULT_LEVEL: 2,
            STORAGE: {
                KEY: 'debugLogs',
                MAX_ENTRIES: 100,
                ROTATION_SIZE: 50,
                EXPORT_FORMAT: 'json'
            },
            PERFORMANCE: {
                ENABLED: true,
                THRESHOLD_WARNING: 100,
                SAMPLE_RATE: 0.1
            },
            LEVELS: {
                TRACE: 0,
                DEBUG: 1,
                INFO: 2,
                WARN: 3,
                ERROR: 4
            },
            MODULES: {
                MODULE1: 'module1',
                MODULE2: 'module2'
            }
        },
        STORAGE_KEYS: {
            PERFORMANCE_METRICS: 'performanceMetrics'
        },
        ANALYSIS: {
            PERFORMANCE_THRESHOLDS: {
                'testLabel': 200
            }
        }
    };

    beforeAll(() => {
        global.Constants = mockConstants;
        global.chrome = {
            storage: {
                local: {
                    get: jest.fn().mockResolvedValue({}),
                    set: jest.fn().mockResolvedValue({}),
                    remove: jest.fn().mockResolvedValue({})
                }
            }
        };
    });

    beforeEach(() => {
        debugInstance = createDebugger();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should create a debugger instance with default config', () => {
        expect(debugInstance.config.DEBUG_LEVEL).toBe(mockConstants.DEBUG.DEFAULT_LEVEL);
        expect(debugInstance.config.LOG_TO_CONSOLE).toBe(true);
    });

    test('should log a message at INFO level', async () => {
        const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
        await debugInstance.info('Test info message');
        expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('Test info message'));
        consoleInfoSpy.mockRestore();
    });

    test('should save log to storage', async () => {
        const logEntry = {
            timestamp: expect.any(String),
            level: 'INFO',
            message: 'Test storage log',
            data: null,
            groupId: null,
            stack: null
        };
        await debugInstance.info('Test storage log');
        expect(global.chrome.storage.local.set).toHaveBeenCalledWith({
            [mockConstants.DEBUG.STORAGE.KEY]: expect.arrayContaining([logEntry])
        });
    });

    test('should handle circular references in data', async () => {
        const circularData = {};
        circularData.self = circularData;
        const formattedData = debugInstance.config.formatData(circularData);
        expect(formattedData).toContain('[Circular Reference]');
    });

    test('should start and end a log group', () => {
        const consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
        const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
        debugInstance.startLogGroup('TestGroup');
        debugInstance.endLogGroup();
        expect(consoleGroupSpy).toHaveBeenCalledWith('TestGroup');
        expect(consoleGroupEndSpy).toHaveBeenCalled();
        consoleGroupSpy.mockRestore();
        consoleGroupEndSpy.mockRestore();
    });

    test('should start and end a performance timer', async () => {
        const label = 'testLabel';
        debugInstance.startTimer(label);
        const duration = await debugInstance.endTimer(label);
        expect(duration).toBeGreaterThan(0);
    });

    test('should save performance metrics', async () => {
        const label = 'testLabel';
        debugInstance.startTimer(label);
        await new Promise(resolve => setTimeout(resolve, 50));
        await debugInstance.endTimer(label);
        expect(global.chrome.storage.local.set).toHaveBeenCalledWith(expect.objectContaining({
            [mockConstants.STORAGE_KEYS.PERFORMANCE_METRICS]: expect.any(Object)
        }));
    });

    test('should export logs in JSON format', async () => {
        const exportedLogs = await debugInstance.exportLogs();
        expect(exportedLogs).toContain('"logs":');
        expect(exportedLogs).toContain('"metrics":');
    });

    test('should clear logs from storage', async () => {
        await debugInstance.clearLogs();
        expect(global.chrome.storage.local.remove).toHaveBeenCalledWith([
            mockConstants.DEBUG.STORAGE.KEY,
            mockConstants.STORAGE_KEYS.PERFORMANCE_METRICS
        ]);
    });
});