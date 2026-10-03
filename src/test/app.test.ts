import { describe, it, expect } from 'vitest';
import { TOOLS, CATEGORIES } from '../data/tools';
import { filterTools } from '../utils/search';
import { convertUnit } from '../utils/units';
import { calculateSgpa, calculateCgpa } from '../utils/cgpa';
import { calculatePercentOf, calculatePercentageChange, calculatePercentageWhatIs } from '../utils/percentage';
import { evaluateMathExpression } from '../utils/mathParser';
import { generateUuidV4, isValidUuidV4 } from '../utils/uuid';
import { calculateExactAge, calculateDaysBetween, isLeapYear } from '../utils/dateCalc';
import { parsePdfPageRange } from '../utils/pdfRange';
import { generateSecurePassword, estimatePasswordStrength, generatePassphrase } from '../utils/passwords';
import {
  toTitleCase,
  toSentenceCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  generateSlug,
  cleanWhitespace,
} from '../utils/textTransform';

import {
  convertPagesToMarkdown,
  createWordDocumentBlob,
  extractTableDataFromPages,
} from '../utils/pdfExtractor';

describe('Tool Registry Specifications', () => {
  it('contains exactly 40 tools with all required fields', () => {
    expect(TOOLS.length).toBe(40);
  });


  it('guarantees unique tool IDs and slugs', () => {
    const ids = new Set<string>();
    const slugs = new Set<string>();

    TOOLS.forEach((t) => {
      expect(ids.has(t.id)).toBe(false);
      expect(slugs.has(t.slug)).toBe(false);
      ids.add(t.id);
      slugs.add(t.slug);

      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.category).toBeTruthy();
      expect(t.icon).toBeTruthy();
      expect(Array.isArray(t.keywords)).toBe(true);
      expect(t.keywords.length).toBeGreaterThan(0);
      expect(t.route.startsWith('/tools/')).toBe(true);
      expect(t.privacyLabel).toBeTruthy();
    });
  });

  it('verifies all 6 required categories are configured', () => {
    expect(CATEGORIES.length).toBe(6);
    const categoryIds = CATEGORIES.map((c) => c.id);
    expect(categoryIds).toContain('pdf-documents');
    expect(categoryIds).toContain('image-studio');
    expect(categoryIds).toContain('qr-code');
    expect(categoryIds).toContain('calculators');
    expect(categoryIds).toContain('text-writing');
    expect(categoryIds).toContain('privacy-security');
  });
});

describe('Search and Filter System', () => {
  it('filters by tool name case-insensitively', () => {
    const results = filterTools(TOOLS, { query: 'pdf merger' });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].slug).toBe('pdf-merger');
  });

  it('filters by keywords and aliases', () => {
    const results = filterTools(TOOLS, { query: 'wifi' });
    expect(results.some((t) => t.slug === 'qr-generator')).toBe(true);
  });

  it('filters by category alone and combined with search', () => {
    const pdfTools = filterTools(TOOLS, { category: 'pdf-documents' });
    pdfTools.forEach((t) => expect(t.category).toBe('pdf-documents'));

    const combined = filterTools(TOOLS, { category: 'pdf-documents', query: 'split' });
    expect(combined.length).toBe(1);
    expect(combined[0].slug).toBe('pdf-splitter');
  });

  it('sorts alphabetically when requested', () => {
    const sorted = filterTools(TOOLS, { sortBy: 'alphabetical' });
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].name.localeCompare(sorted[i + 1].name)).toBeLessThanOrEqual(0);
    }
  });
});

describe('Unit and Temperature Conversions', () => {
  it('converts distance units accurately', () => {
    const kmToMiles = convertUnit('length', 10, 'kilometers', 'miles');
    expect(kmToMiles).toBeCloseTo(6.2137, 2);

    const mToCm = convertUnit('length', 5, 'meters', 'centimeters');
    expect(mToCm).toBe(500);
  });

  it('converts temperature correctly across Celsius, Fahrenheit, and Kelvin', () => {
    // 0 C = 32 F = 273.15 K
    expect(convertUnit('temperature', 0, 'celsius', 'fahrenheit')).toBe(32);
    expect(convertUnit('temperature', 0, 'celsius', 'kelvin')).toBe(273.15);
    expect(convertUnit('temperature', 212, 'fahrenheit', 'celsius')).toBe(100);
    expect(convertUnit('temperature', 373.15, 'kelvin', 'celsius')).toBe(100);
  });
});

describe('CGPA Calculation Engine', () => {
  it('calculates credit-weighted SGPA', () => {
    const subjects = [
      { id: '1', name: 'Math', credits: 4, gradePoint: 10 }, // 40
      { id: '2', name: 'Physics', credits: 3, gradePoint: 8 }, // 24
      { id: '3', name: 'CS', credits: 3, gradePoint: 9 },      // 27
    ];
    // Total weighted: 40 + 24 + 27 = 91. Total credits: 10. SGPA = 9.1
    const { sgpa, totalCredits } = calculateSgpa(subjects);
    expect(totalCredits).toBe(10);
    expect(sgpa).toBe(9.1);
  });

  it('calculates multi-semester cumulative CGPA correctly', () => {
    const semesters = [
      {
        id: 's1',
        name: 'Sem 1',
        subjects: [{ id: '1', name: 'Course 1', credits: 10, gradePoint: 8.0 }],
      },
      {
        id: 's2',
        name: 'Sem 2',
        subjects: [{ id: '2', name: 'Course 2', credits: 10, gradePoint: 9.0 }],
      },
    ];
    const { cgpa, totalCredits } = calculateCgpa(semesters);
    expect(totalCredits).toBe(20);
    expect(cgpa).toBe(8.5);
  });
});

describe('Percentage Calculations', () => {
  it('calculates percent of value', () => {
    expect(calculatePercentOf(25, 200)).toBe(50);
  });

  it('handles percentage change and flags increase vs decrease', () => {
    const increase = calculatePercentageChange(100, 150);
    expect(increase.changePercent).toBe(50);
    expect(increase.type).toBe('increase');

    const decrease = calculatePercentageChange(200, 150);
    expect(decrease.changePercent).toBe(-25);
    expect(decrease.type).toBe('decrease');
  });

  it('throws on division by zero', () => {
    expect(() => calculatePercentageChange(0, 100)).toThrow();
    expect(() => calculatePercentageWhatIs(50, 0)).toThrow();
  });
});

describe('Safe Mathematical Parser (No eval)', () => {
  it('evaluates basic arithmetic and order of operations', () => {
    expect(evaluateMathExpression('3 + 5 * 2')).toBe(13);
    expect(evaluateMathExpression('(3 + 5) * 2')).toBe(16);
    expect(evaluateMathExpression('2^3 + 4')).toBe(12);
  });

  it('evaluates trigonometric functions in degrees', () => {
    expect(evaluateMathExpression('sin(90)')).toBeCloseTo(1, 4);
    expect(evaluateMathExpression('cos(0)')).toBeCloseTo(1, 4);
  });

  it('evaluates square roots, logs, and factorials', () => {
    expect(evaluateMathExpression('sqrt(16)')).toBe(4);
    expect(evaluateMathExpression('log(100)')).toBe(2);
    expect(evaluateMathExpression('5!')).toBe(120);
  });

  it('throws error on division by zero', () => {
    expect(() => evaluateMathExpression('10 / 0')).toThrow('Division by zero');
  });
});

describe('UUID v4 Generator', () => {
  it('generates valid RFC4122 v4 UUIDs', () => {
    const id = generateUuidV4();
    expect(isValidUuidV4(id)).toBe(true);
    // UUID v4 character at index 14 is always '4'
    expect(id.charAt(14)).toBe('4');
  });
});

describe('Date and Leap Year Calculations', () => {
  it('correctly identifies leap years', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2025)).toBe(false);
  });

  it('calculates days between two calendar dates', () => {
    const days = calculateDaysBetween('2024-01-01', '2024-01-10');
    expect(days).toBe(9);
  });

  it('rejects future birthdates with clear error', () => {
    expect(() => calculateExactAge('2099-01-01', '2025-01-01')).toThrow(
      'Birth date cannot be in the future'
    );
  });
});

describe('PDF Page Range Parser', () => {
  it('parses valid comma-separated and dash-separated ranges', () => {
    const indices = parsePdfPageRange('1-3, 5', 10);
    // 0-indexed: 0, 1, 2, 4
    expect(indices).toEqual([0, 1, 2, 4]);
  });

  it('rejects out of range pages', () => {
    expect(() => parsePdfPageRange('1-12', 10)).toThrow('Document only has 10 pages');
    expect(() => parsePdfPageRange('0', 10)).toThrow('Page number must be at least 1');
  });
});

describe('Password and Passphrase Security', () => {
  it('generates passwords respecting length and character flags', () => {
    const pwd = generateSecurePassword({
      length: 20,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
    expect(pwd.length).toBe(20);
    expect(/[A-Z]/.test(pwd)).toBe(true);
    expect(/[a-z]/.test(pwd)).toBe(true);
    expect(/[0-9]/.test(pwd)).toBe(true);
    expect(/[^a-zA-Z0-9]/.test(pwd)).toBe(true);
  });

  it('generates multi-word passphrases', () => {
    const phrase = generatePassphrase(4, '-', true, false);
    const parts = phrase.split('-');
    expect(parts.length).toBe(4);
    parts.forEach((p) => {
      expect(p.length).toBeGreaterThan(0);
      expect(p.charAt(0)).toBe(p.charAt(0).toUpperCase());
    });
  });

  it('estimates password strength and returns entropy', () => {
    const weak = estimatePasswordStrength('12345');
    expect(weak.score).toBeLessThanOrEqual(1);

    const strong = estimatePasswordStrength('V3ry$Tr0ngP@ssw0rd!#2026');
    expect(strong.score).toBeGreaterThanOrEqual(3);
    expect(strong.entropyBits).toBeGreaterThan(60);
  });
});

describe('Text Transformations', () => {
  it('converts to Title Case, camelCase, and kebab-case', () => {
    expect(toTitleCase('hello world from tovix')).toBe('Hello World From Tovix');
    expect(toSentenceCase('hello. world! how are you?')).toBe('Hello. World! How are you?');
    expect(toCamelCase('hello world test')).toBe('helloWorldTest');
    expect(toKebabCase('Hello World Test')).toBe('hello-world-test');
    expect(toSnakeCase('Hello World Test')).toBe('hello_world_test');
  });

  it('generates clean SEO URL slugs', () => {
    const slug = generateSlug('How to use TOVIX in 2025?!');
    expect(slug).toBe('how-to-use-tovix-in-2025');
  });

  it('cleans redundant whitespace and blank lines', () => {
    const messy = '  Hello    world  \n\n\n  Next   line  ';
    const cleaned = cleanWhitespace(messy, {
      removeExtraSpaces: true,
      removeEmptyLines: true,
      trimLines: true,
    });
    expect(cleaned).toBe('Hello world\nNext line');
  });
});

describe('Client-Side PDF & Document Extraction Utilities', () => {
  it('converts extracted pages into Markdown format', () => {
    const mockPages = [
      {
        pageNumber: 1,
        text: 'ANNUAL REPORT\nIntroduction\nThis is a sample document.',
        lines: ['ANNUAL REPORT', 'Introduction', 'This is a sample document.'],
      },
    ];
    const md = convertPagesToMarkdown(mockPages);
    expect(md).toContain('<!-- Page 1 -->');
    expect(md).toContain('## ANNUAL REPORT');
    expect(md).toContain('This is a sample document.');
  });

  it('generates an official Word document blob with HTML Word XML', () => {
    const mockPages = [
      {
        pageNumber: 1,
        text: 'Title\nBody text.',
        lines: ['Title', 'Body text.'],
      },
    ];
    const blob = createWordDocumentBlob('TestDoc', mockPages);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/msword;charset=utf-8');
    expect(blob.size).toBeGreaterThan(50);
  });

  it('detects tabular lines and parses rows for Excel/CSV export', () => {
    const mockPages = [
      {
        pageNumber: 1,
        text: 'Item\tPrice\tQty\nApple\t$1.50\t10',
        lines: ['Item\tPrice\tQty', 'Apple\t$1.50\t10'],
      },
    ];
    const rows = extractTableDataFromPages(mockPages);
    expect(rows.length).toBe(2);
    expect(rows[0]).toEqual(['Item', 'Price', 'Qty']);
    expect(rows[1]).toEqual(['Apple', '$1.50', '10']);
  });
});

