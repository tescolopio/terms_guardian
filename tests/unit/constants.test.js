const { constants } = require('../../src/utils/constants');

describe('Constants', () => {
    describe('EXTENSION', () => {
        it('should have correct extension name', () => {
            expect(constants.EXTENSION.NAME).toBe('Terms Guardian');
        });

        it('should have correct extension version', () => {
            expect(constants.EXTENSION.VERSION).toBe('1.0.0');
        });

        it('should have correct icon paths', () => {
            expect(constants.EXTENSION.ICON_PATHS.SMALL).toBe('images/icon16.png');
            expect(constants.EXTENSION.ICON_PATHS.MEDIUM).toBe('images/icon48.png');
            expect(constants.EXTENSION.ICON_PATHS.LARGE).toBe('images/icon128.png');
        });
    });

    describe('DETECTION', () => {
        it('should have correct detection interval', () => {
            expect(constants.DETECTION.INTERVAL).toBe(5000);
        });

        it('should have correct detection thresholds', () => {
            expect(constants.DETECTION.THRESHOLDS.AUTO_GRADE).toBe(30);
            expect(constants.DETECTION.THRESHOLDS.NOTIFY).toBe(10);
            expect(constants.DETECTION.THRESHOLDS.HIGHLIGHT).toBe(20);
            expect(constants.DETECTION.THRESHOLDS.SECTION).toBe(10);
            expect(constants.DETECTION.THRESHOLDS.PROXIMITY).toBe(5);
        });
    });

    describe('ANALYSIS', () => {
        it('should have correct chunk size', () => {
            expect(constants.ANALYSIS.CHUNK_SIZE).toBe(500);
        });

        it('should have correct minimum word length', () => {
            expect(constants.ANALYSIS.MIN_WORD_LENGTH).toBe(3);
        });

        it('should have correct maximum retries', () => {
            expect(constants.ANALYSIS.MAX_RETRIES).toBe(3);
        });

        it('should have correct cache duration', () => {
            expect(constants.ANALYSIS.CACHE_DURATION).toBe(86400000);
        });

        it('should have correct grades', () => {
            expect(constants.ANALYSIS.GRADES.A).toEqual({ MIN: 90, LABEL: 'Excellent' });
            expect(constants.ANALYSIS.GRADES.B).toEqual({ MIN: 80, LABEL: 'Good' });
            expect(constants.ANALYSIS.GRADES.C).toEqual({ MIN: 70, LABEL: 'Fair' });
            expect(constants.ANALYSIS.GRADES.D).toEqual({ MIN: 60, LABEL: 'Poor' });
            expect(constants.ANALYSIS.GRADES.F).toEqual({ MIN: 0, LABEL: 'Very Poor' });
        });

        it('should have correct performance thresholds', () => {
            expect(constants.ANALYSIS.PERFORMANCE_THRESHOLDS.TEXT_PROCESSING).toBe(100);
            expect(constants.ANALYSIS.PERFORMANCE_THRESHOLDS.API_CALL).toBe(2000);
            expect(constants.ANALYSIS.PERFORMANCE_THRESHOLDS.GRADE_CALCULATION).toBe(50);
            expect(constants.ANALYSIS.PERFORMANCE_THRESHOLDS.RIGHTS_ANALYSIS).toBe(150);
            expect(constants.ANALYSIS.PERFORMANCE_THRESHOLDS.EXTRACTION).toBe(200);
        });
    });

    describe('MESSAGES', () => {
        it('should have correct auto grade message', () => {
            expect(constants.MESSAGES.AUTO_GRADE).toBe("Terms Guardian has detected a legal document and is currently grading it. Click the extension badge at the top of the browser to see the readability and how it affects your rights by agreeing to it. This is for educational purposes only and is not legal advice.");
        });

        it('should have correct significant terms message', () => {
            expect(constants.MESSAGES.SIGNIFICANT_TERMS).toBe("A significant number of legal terms have been found on this page. Click the Terms Guardian Extension badge at the top of the screen to grade the text. If this is not a legal document like a Terms of Service you can still grade sections of text by selecting the text you want to grade and right clicking to bring up the context menu, then click 'grade this text' to learn more about it. This is for educational purposes only and is not legal advice.");
        });

        it('should have correct no legal text message', () => {
            expect(constants.MESSAGES.NO_LEGAL_TEXT).toBe("No legal text was found on this page.");
        });

        it('should have correct error messages', () => {
            expect(constants.MESSAGES.ERROR.MODEL_LOAD).toBe("Error loading analysis model");
            expect(constants.MESSAGES.ERROR.API_ERROR).toBe("Error communicating with definition service");
            expect(constants.MESSAGES.ERROR.INVALID_TEXT).toBe("Invalid or empty text provided");
            expect(constants.MESSAGES.ERROR.GENERAL).toBe("An unexpected error occurred. Please try again later.");
            expect(constants.MESSAGES.ERROR.PERFORMANCE).toBe("Operation took longer than expected");
            expect(constants.MESSAGES.ERROR.STORAGE_FULL).toBe("Storage limit reached");
            expect(constants.MESSAGES.ERROR.NETWORK).toBe("Network connection error");
        });
    });

    describe('API', () => {
        it('should have correct API settings', () => {
            expect(constants.API.LEXPREDICT.BASE_URL).toBe('https://api.lexpredict.com/v1');
            expect(constants.API.LEXPREDICT.ENDPOINTS.DEFINITIONS).toBe('/dictionary/legal/common-law');
            expect(constants.API.LEXPREDICT.TIMEOUT).toBe(5000);
            expect(constants.API.LEXPREDICT.RETRY_DELAYS).toEqual([1000, 2000, 4000]);
        });
    });

    describe('DEBUG', () => {
        it('should have correct debug levels', () => {
            expect(constants.DEBUG.LEVELS.ERROR).toBe(0);
            expect(constants.DEBUG.LEVELS.WARN).toBe(1);
            expect(constants.DEBUG.LEVELS.INFO).toBe(2);
            expect(constants.DEBUG.LEVELS.DEBUG).toBe(3);
            expect(constants.DEBUG.LEVELS.TRACE).toBe(4);
        });

        it('should have correct default debug level', () => {
            expect(constants.DEBUG.DEFAULT_LEVEL).toBe(2);
        });

        it('should have correct debug storage settings', () => {
            expect(constants.DEBUG.STORAGE.KEY).toBe('debugLogs');
            expect(constants.DEBUG.STORAGE.MAX_ENTRIES).toBe(1000);
            expect(constants.DEBUG.STORAGE.EXPORT_FORMAT).toBe('json');
            expect(constants.DEBUG.STORAGE.ROTATION_SIZE).toBe(500);
        });

        it('should have correct debug performance settings', () => {
            expect(constants.DEBUG.PERFORMANCE.ENABLED).toBe(true);
            expect(constants.DEBUG.PERFORMANCE.THRESHOLD_WARNING).toBe(100);
            expect(constants.DEBUG.PERFORMANCE.THRESHOLD_ERROR).toBe(1000);
            expect(constants.DEBUG.PERFORMANCE.SAMPLE_RATE).toBe(0.1);
        });

        it('should have correct debug modules', () => {
            expect(constants.DEBUG.MODULES.CONTENT).toBe('content');
            expect(constants.DEBUG.MODULES.RIGHTS).toBe('rights');
            expect(constants.DEBUG.MODULES.READABILITY).toBe('readability');
            expect(constants.DEBUG.MODULES.EXTRACTION).toBe('extraction');
            expect(constants.DEBUG.MODULES.API).toBe('api');
            expect(constants.DEBUG.MODULES.STORAGE).toBe('storage');
        });
    });

    describe('CLASSES', () => {
        it('should have correct DOM element classes', () => {
            expect(constants.CLASSES.HIGHLIGHT).toBe('legal-term-highlight');
            expect(constants.CLASSES.SECTION).toBe('legal-text-section');
            expect(constants.CLASSES.IMPORTANT).toBe('important-term');
        });
    });

    describe('SELECTORS', () => {
        it('should have correct legal sections selectors', () => {
            expect(constants.SELECTORS.LEGAL_SECTIONS).toEqual([
                'main',
                'article',
                'section',
                'div[class*="terms"]',
                'div[id*="terms"]',
                'div[class*="legal"]',
                'div[id*="legal"]'
            ]);
        });

        it('should have correct exclude elements selectors', () => {
            expect(constants.SELECTORS.EXCLUDE_ELEMENTS).toEqual([
                'nav',
                'header',
                'footer',
                'script',
                'style',
                'iframe',
                'object',
                'embed',
                'noscript'
            ]);
        });

        it('should have correct popup selectors', () => {
            expect(constants.SELECTORS.POPUPS.READABILITY).toBe('#readabilityPopup');
            expect(constants.SELECTORS.POPUPS.RIGHTS).toBe('#rightsPopup');
            expect(constants.SELECTORS.POPUPS.EXCERPTS).toBe('#excerptsPopup');
            expect(constants.SELECTORS.POPUPS.TERMS).toBe('#termsPopup');
        });
    });

    describe('STORAGE_KEYS', () => {
        it('should have correct local storage keys', () => {
            expect(constants.STORAGE_KEYS.LAST_WORD).toBe('lastWord');
            expect(constants.STORAGE_KEYS.ANALYSIS_RESULTS).toBe('analysisResults');
            expect(constants.STORAGE_KEYS.CACHE_PREFIX).toBe('termsDef_');
            expect(constants.STORAGE_KEYS.SETTINGS).toBe('guardianSettings');
            expect(constants.STORAGE_KEYS.DEBUG_LOGS).toBe('debugLogs');
            expect(constants.STORAGE_KEYS.PERFORMANCE_METRICS).toBe('perfMetrics');
        });
    });

    describe('CONTEXT_MENU', () => {
        it('should have correct context menu items', () => {
            expect(constants.CONTEXT_MENU.GRADE_TEXT.id).toBe('gradeThisText');
            expect(constants.CONTEXT_MENU.GRADE_TEXT.title).toBe('Grade this text');
            expect(constants.CONTEXT_MENU.GRADE_TEXT.contexts).toEqual(['selection']);
        });
    });
});