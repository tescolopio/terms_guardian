const { createReadabilityGrader } = require('../../src/analysis/readabilityGrader.js');

const mockLogLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

describe('Readability Grader', () => {
  let testLogger;
  let readabilityGrader;

  beforeEach(() => {
    testLogger = jest.fn();
    readabilityGrader = createReadabilityGrader({ log: testLogger, logLevels: mockLogLevels });
  });

  afterEach(() => {
    testLogger.mockClear(); // Clear the mock after each test
  });

  const testCases = [
    {
      description: 'should calculate readability grades correctly for a simple text',
      text: "This is a simple sentence. It is easy to read.",
      expectedGrade: 'A',
      expectedLogs: [
        expect.stringContaining('[3] Flesch Reading Ease Score:'),
        expect.stringContaining('[3] Flesch-Kincaid Grade Level:'),
        expect.stringContaining('[3] Gunning Fog Index:'),
        expect.stringContaining('[3] Normalized Average Score:'),
        expect.stringContaining('[2] Calculated Readability Grades:'),
        expect.stringContaining('[2] Final grade: A'),
      ]
    },
    {
      description: 'should handle undefined text',
      text: undefined,
      expectedGrade: 'N/A',
      expectedLogs: [
        expect.stringContaining('[0] Error calculating readability grade:')
      ]
    },
    {
      description: 'should handle null text',
      text: null,
      expectedGrade: 'N/A',
      expectedLogs: [
        expect.stringContaining('[0] Error calculating readability grade:')
      ]
    },
    {
      description: 'should handle text in Spanish',
      text: 'El rápido zorro marrón salta sobre el perro perezoso.',
      expectedGrade: 'N/A',
      expectedLogs: [
        expect.stringContaining('[0] Error calculating readability grade:')
      ]
    },
    {
      description: 'should handle text with mathematical expressions',
      text: 'The equation E=mc^2 illustrates mass-energy equivalence.',
      expectedGrade: ['B', 'C', 'D'],
      expectedLogs: [
        expect.stringContaining('[3] Flesch Reading Ease Score:'),
        expect.stringContaining('[3] Flesch-Kincaid Grade Level:'),
        expect.stringContaining('[3] Gunning Fog Index:'),
        expect.stringContaining('[3] Normalized Average Score:'),
        expect.stringContaining('[2] Calculated Readability Grades:'),
      ]
    },
    {
      description: 'should handle empty text input',
      text: "",
      expectedGrade: 'N/A',
      expectedLogs: [
        expect.stringContaining('[0] Error calculating readability grade:')
      ]
    },
    {
      description: 'should handle input with only punctuation or special characters',
      text: "!@#$%^&*()",
      expectedGrade: 'N/A',
      expectedLogs: [
        expect.stringContaining('[0] Error calculating readability grade:')
      ]
    },
    {
      description: 'should calculate readability for simple text',
      text: "The quick brown fox jumps over the lazy dog.",
      expectedGrade: ['A', 'B', 'C', 'D', 'F'],
      expectedLogs: [
        expect.stringContaining('[3] Flesch Reading Ease Score:'),
        expect.stringContaining('[3] Flesch-Kincaid Grade Level:'),
        expect.stringContaining('[3] Gunning Fog Index:'),
        expect.stringContaining('[2] Calculated Readability Grades:')
      ]
    },
    {
      description: 'should calculate readability for complex text',
      text: `The intricate interplay between quantum mechanics and general relativity presents a formidable challenge to our understanding of the fundamental nature of reality. This conundrum has perplexed physicists for decades, as the two theories, while individually successful in their respective domains, seem irreconcilable when attempting to describe phenomena at the intersection of the very small and the very large.`,
      expectedGrade: ['C', 'D', 'F'],
      expectedLogs: [
        expect.stringContaining('[3] Flesch Reading Ease Score:'),
        expect.stringContaining('[3] Flesch-Kincaid Grade Level:'),
        expect.stringContaining('[3] Gunning Fog Index:'),
        expect.stringContaining('[2] Calculated Readability Grades:')
      ]
    },
    {
      description: 'should handle text with multiple sentences',
      text: `This is a simple sentence. Here's another one! And a third? Yes, indeed.`,
      expectedGrade: ['A', 'B', 'C'],
      expectedLogs: [
        expect.stringContaining('[3] Flesch Reading Ease Score:'),
        expect.stringContaining('[3] Flesch-Kincaid Grade Level:'),
        expect.stringContaining('[3] Gunning Fog Index:'),
        expect.stringContaining('[2] Calculated Readability Grades:')
      ]
    },
    {
      description: 'should handle text with numbers and special characters',
      text: `In 2023, the company's revenue increased by 15% to $10.5 million!`,
      expectedGrade: ['A', 'B', 'C', 'D', 'F'],
      expectedLogs: [
        expect.stringContaining('[3] Flesch Reading Ease Score:'),
        expect.stringContaining('[3] Flesch-Kincaid Grade Level:'),
        expect.stringContaining('[3] Gunning Fog Index:'),
        expect.stringContaining('[2] Calculated Readability Grades:')
      ]
    },
    {
      description: 'should correctly grade very easy text',
      text: `I like cats. Cats are fun. Cats play with toys. I play with cats.`,
      expectedGrade: 'A',
      expectedLogs: [
        expect.stringContaining('[3] Flesch Reading Ease Score:'),
        expect.stringContaining('[3] Flesch-Kincaid Grade Level:'),
        expect.stringContaining('[3] Gunning Fog Index:'),
        expect.stringContaining('[2] Calculated Readability Grades:'),
        expect.stringContaining('[2] Final grade: A')
      ]
    },
    {
      description: 'should correctly grade very difficult text',
      text: `The ontological argument for the existence of God is a philosophical proof that posits the necessity of a supreme being based on the concept of maximal greatness and the logical implications thereof in possible world semantics.`,
      expectedGrade: ['D', 'F'],
      expectedLogs: [
        expect.stringContaining('[3] Flesch Reading Ease Score:'),
        expect.stringContaining('[3] Flesch-Kincaid Grade Level:'),
        expect.stringContaining('[3] Gunning Fog Index:'),
        expect.stringContaining('[2] Calculated Readability Grades:')
      ]
    },
    {
      description: 'should log debug information',
      text: 'This is a test sentence.',
      expectedGrade: ['A', 'B', 'C', 'D', 'F'],
      expectedLogs: [
        expect.stringContaining('Flesch Reading Ease Score:'),
        expect.stringContaining('Flesch-Kincaid Grade Level:'),
        expect.stringContaining('Gunning Fog Index:')
      ]
    },
    {
      description: 'should handle text with contractions',
      text: `It's a beautiful day, isn't it? I can't believe how nice the weather is.`,
      expectedGrade: ['A', 'B', 'C'],
      expectedLogs: [
        expect.stringContaining('[3] Flesch Reading Ease Score:'),
        expect.stringContaining('[3] Flesch-Kincaid Grade Level:'),
        expect.stringContaining('[3] Gunning Fog Index:'),
        expect.stringContaining('[2] Calculated Readability Grades:')
      ]
    },
    {
      description: 'should handle text with hyphenated words',
      text: `The state-of-the-art technology was user-friendly and cost-effective.`,
      expectedGrade: ['B', 'C', 'D'],
      expectedLogs: [
        expect.stringContaining('[3] Flesch Reading Ease Score:'),
        expect.stringContaining('[3] Flesch-Kincaid Grade Level:'),
        expect.stringContaining('[3] Gunning Fog Index:'),
        expect.stringContaining('[2] Calculated Readability Grades:')
      ]
    }
  ];

  testCases.forEach(({ description, text, expectedGrade, expectedLogs }) => {
    test(description, () => {
      const result = readabilityGrader.calculateReadabilityGrade(text);
      if (Array.isArray(expectedGrade)) {
        expect(expectedGrade).toContain(result.averageGrade);
      } else {
        expect(result.averageGrade).toBe(expectedGrade);
      }

      // Assert that the logger was called with expected messages
      expectedLogs.forEach(expectedLog => {
        expect(testLogger).toHaveBeenCalledWith(
          expect.any(Number), // Log level
          expect.stringContaining(expectedLog)
        );
      });
    });
  });
});