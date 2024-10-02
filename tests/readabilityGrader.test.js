import { calculateReadabilityGrade } from '../readabilityGrader.js';

describe('Readability Grader', () => {
    test('should calculate readability grades correctly for a simple text', () => {
        const text = "This is a simple sentence. It is easy to read.";
        const result = calculateReadabilityGrade(text);
        
        expect(result.flesch).toBeGreaterThan(0);
        expect(result.kincaid).toBeGreaterThan(0);
        expect(result.fogIndex).toBeGreaterThan(0);
        expect(result.averageGrade).toBeDefined();
    });

    test('should handle empty text input', () => {
        const text = "";
        const result = calculateReadabilityGrade(text);
        
        expect(result.flesch).toBe(0);
        expect(result.kincaid).toBe(0);
        expect(result.fogIndex).toBe(0);
        expect(result.averageGrade).toBe("N/A");
    });

    test('should handle text with complex words', () => {
        const text = "This sentence contains some complex words like internationalization and pseudopseudohypoparathyroidism.";
        const result = calculateReadabilityGrade(text);
        
        expect(result.flesch).toBeGreaterThan(0);
        expect(result.kincaid).toBeGreaterThan(0);
        expect(result.fogIndex).toBeGreaterThan(0);
        expect(result.averageGrade).toBeDefined();
    });

    test('should handle text with punctuation correctly', () => {
        const text = "Hello! How are you? This is a test.";
        const result = calculateReadabilityGrade(text);
        
        expect(result.flesch).toBeGreaterThan(0);
        expect(result.kincaid).toBeGreaterThan(0);
        expect(result.fogIndex).toBeGreaterThan(0);
        expect(result.averageGrade).toBeDefined();
    });

    test('should handle text with different sentence lengths', () => {
        const text = "Short. This is a longer sentence that should affect the readability score.";
        const result = calculateReadabilityGrade(text);
        
        expect(result.flesch).toBeGreaterThan(0);
        expect(result.kincaid).toBeGreaterThan(0);
        expect(result.fogIndex).toBeGreaterThan(0);
        expect(result.averageGrade).toBeDefined();
    });
});