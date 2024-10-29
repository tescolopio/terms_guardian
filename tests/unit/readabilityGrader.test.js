const { createReadabilityGrader } = require('../../src/analysis/readabilityGrader.js');

const mockLogLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const loggedMessages = [];

const testLogger = (level, ...messages) => {
  loggedMessages.push(`[${level}] ${messages.join(' ')}`);
};

const readabilityGrader = createReadabilityGrader({ log: testLogger, logLevels: mockLogLevels });

// Helper function to print logged messages
const printLoggedMessages = () => {
  console.log("Logged messages:");
  loggedMessages.forEach(msg => console.log(msg));
  loggedMessages.length = 0; // Clear the array for the next test
};

describe('ReadabilityGrader', () => {
  beforeEach(() => {
    loggedMessages.length = 0; // Clear logged messages before each test
  });

  afterEach(() => {
    printLoggedMessages(); // Print logged messages after each test
  });

  test('should handle empty input', () => {
    const result = readabilityGrader.calculateReadabilityGrade('');
    expect(result).toEqual({
      flesch: 0,
      kincaid: 0,
      fogIndex: 0,
      averageGrade: 'N/A'
    });
    expect(loggedMessages).toContainEqual(expect.stringContaining('Error calculating readability grade:'));
  });

  test('should handle input with only punctuation or special characters', () => {
    const result = readabilityGrader.calculateReadabilityGrade('!@#$%^&*()');
    expect(result).toEqual({
      flesch: 0,
      kincaid: 0,
      fogIndex: 0,
      averageGrade: 'N/A'
    });
    expect(loggedMessages).toContainEqual(expect.stringContaining('Error calculating readability grade:'));
  });

  test('should calculate readability for simple text', () => {
    const result = readabilityGrader.calculateReadabilityGrade('The quick brown fox jumps over the lazy dog.');
    expect(result.flesch).toBeGreaterThan(0);
    expect(result.kincaid).toBeGreaterThan(0);
    expect(result.fogIndex).toBeGreaterThan(0);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(result.averageGrade);
    console.log("Test result:", result);
  });

  test('should calculate readability for complex text', () => {
    const complexText = `The intricate interplay between quantum mechanics and general relativity presents a formidable challenge to our understanding of the fundamental nature of reality. This conundrum has perplexed physicists for decades, as the two theories, while individually successful in their respective domains, seem irreconcilable when attempting to describe phenomena at the intersection of the very small and the very large.`;
    const result = readabilityGrader.calculateReadabilityGrade(complexText);
    expect(result.flesch).toBeLessThan(50);
    expect(result.kincaid).toBeGreaterThan(12);
    expect(result.fogIndex).toBeGreaterThan(12);
    expect(['C', 'D', 'F']).toContain(result.averageGrade);
    console.log("Test result:", result);
  });

  test('should handle text with multiple sentences', () => {
    const multiSentenceText = `This is a simple sentence. Here's another one! And a third? Yes, indeed.`;
    const result = readabilityGrader.calculateReadabilityGrade(multiSentenceText);
    expect(result.flesch).toBeGreaterThan(0);
    expect(result.kincaid).toBeGreaterThan(0);
    expect(result.fogIndex).toBeGreaterThan(0);
    expect(['A', 'B', 'C']).toContain(result.averageGrade);
    console.log("Test result:", result);
  });

  test('should handle text with numbers and special characters', () => {
    const mixedText = `In 2023, the company's revenue increased by 15% to $10.5 million!`;
    const result = readabilityGrader.calculateReadabilityGrade(mixedText);
    expect(result.flesch).toBeGreaterThan(0);
    expect(result.kincaid).toBeGreaterThan(0);
    expect(result.fogIndex).toBeGreaterThan(0);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(result.averageGrade);
    console.log("Test result:", result);
  });

  test('should correctly grade very easy text', () => {
    const easyText = `I like cats. Cats are fun. Cats play with toys. I play with cats.`;
    const result = readabilityGrader.calculateReadabilityGrade(easyText);
    expect(result.averageGrade).toBe('A');
    expect(result.flesch).toBeGreaterThan(90);
    expect(result.kincaid).toBeLessThan(3);
    expect(result.fogIndex).toBeLessThan(6);
    console.log("Test result:", result);
  });

  test('should correctly grade very difficult text', () => {
    const difficultText = `The ontological argument for the existence of God is a philosophical proof that posits the necessity of a supreme being based on the concept of maximal greatness and the logical implications thereof in possible world semantics.`;
    const result = readabilityGrader.calculateReadabilityGrade(difficultText);
    expect(['D', 'F']).toContain(result.averageGrade);
    expect(result.flesch).toBeLessThan(30);
    expect(result.kincaid).toBeGreaterThan(15);
    expect(result.fogIndex).toBeGreaterThan(15);
    console.log("Test result:", result);
  });

  test('should log debug information', () => {
    readabilityGrader.calculateReadabilityGrade('This is a test sentence.');
    expect(loggedMessages).toContainEqual(expect.stringContaining('Flesch Reading Ease Score:'));
    expect(loggedMessages).toContainEqual(expect.stringContaining('Flesch-Kincaid Grade Level:'));
    expect(loggedMessages).toContainEqual(expect.stringContaining('Gunning Fog Index:'));
  });

  test('should handle text with contractions', () => {
    const contractionText = `It's a beautiful day, isn't it? I can't believe how nice the weather is.`;
    const result = readabilityGrader.calculateReadabilityGrade(contractionText);
    expect(result.flesch).toBeGreaterThan(0);
    expect(result.kincaid).toBeGreaterThan(0);
    expect(result.fogIndex).toBeGreaterThan(0);
    expect(['A', 'B', 'C']).toContain(result.averageGrade);
    console.log("Test result:", result);
  });

  test('should handle text with hyphenated words', () => {
    const hyphenatedText = `The state-of-the-art technology was user-friendly and cost-effective.`;
    const result = readabilityGrader.calculateReadabilityGrade(hyphenatedText);
    expect(result.flesch).toBeLessThan(50);
    expect(result.kincaid).toBeGreaterThan(0);
    expect(result.fogIndex).toBeGreaterThan(0);
    expect(['B', 'C', 'D']).toContain(result.averageGrade);
    console.log("Test result:", result);
  });
});