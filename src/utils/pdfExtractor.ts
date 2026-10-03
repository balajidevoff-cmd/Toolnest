import { pdfjsLib } from './pdfWorkerSetup';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  lines: string[];
}

export interface ExtractedPdfData {
  fileName: string;
  totalPages: number;
  pages: ExtractedPage[];
  fullText: string;
  isScannedOrImageOnly?: boolean;
}

/**
 * Extracts structured text and lines from a PDF file in the browser.
 * Uses PDF.js with local worker, and provides a fallback text stream decoder if needed.
 */
export async function extractPdfText(file: File): Promise<ExtractedPdfData> {
  const buffer = await file.arrayBuffer();

  try {
    const uint8Data = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Data,
      useSystemFonts: true,
    });
    const doc = await loadingTask.promise;

    const pages: ExtractedPage[] = [];
    let combinedText = '';

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();

      interface TextItemWithPos {
        str: string;
        x: number;
        y: number;
        height: number;
      }

      const items: TextItemWithPos[] = [];
      for (const item of content.items) {
        if ('str' in item && typeof item.str === 'string' && item.str.trim().length > 0) {
          const transform = item.transform;
          const x = transform ? transform[4] : 0;
          const y = transform ? transform[5] : 0;
          items.push({
            str: item.str,
            x,
            y,
            height: item.height || 12,
          });
        }
      }

      // Sort by Y descending (top to bottom), then X ascending (left to right)
      items.sort((a, b) => {
        const yDiff = b.y - a.y;
        if (Math.abs(yDiff) > 5) {
          return yDiff;
        }
        return a.x - b.x;
      });

      // Group into lines based on Y-proximity
      const lineBuckets: string[] = [];
      let currentLineY: number | null = null;
      let currentLineTokens: string[] = [];

      for (const item of items) {
        if (currentLineY === null) {
          currentLineY = item.y;
          currentLineTokens.push(item.str);
        } else if (Math.abs(item.y - currentLineY) <= 6) {
          currentLineTokens.push(item.str);
        } else {
          const lineText = currentLineTokens.join(' ').replace(/\s+/g, ' ').trim();
          if (lineText.length > 0) {
            lineBuckets.push(lineText);
          }
          currentLineY = item.y;
          currentLineTokens = [item.str];
        }
      }

      if (currentLineTokens.length > 0) {
        const lineText = currentLineTokens.join(' ').replace(/\s+/g, ' ').trim();
        if (lineText.length > 0) {
          lineBuckets.push(lineText);
        }
      }

      const pageText = lineBuckets.join('\n');
      pages.push({
        pageNumber: i,
        text: pageText,
        lines: lineBuckets,
      });

      combinedText += (combinedText ? '\n\n' : '') + pageText;
    }

    const hasNoText = combinedText.trim().length === 0;

    return {
      fileName: file.name,
      totalPages: doc.numPages,
      pages,
      fullText: combinedText,
      isScannedOrImageOnly: hasNoText,
    };
  } catch {
    // Fallback: extract text directly from PDF byte streams
    return extractFallbackFromPdfBytes(file.name, buffer);
  }
}

/**
 * Fallback parser for extracting text strings directly from PDF syntax streams
 * in case PDF.js encounters an unsupported font, corruption, or worker block.
 */
function extractFallbackFromPdfBytes(fileName: string, buffer: ArrayBuffer): ExtractedPdfData {
  const decoder = new TextDecoder('latin1');
  const raw = decoder.decode(buffer);

  // Match text objects between BT and ET operators
  const textMatches: string[] = [];
  const btRegex = /BT[\s\S]*?ET/g;
  let match: RegExpExecArray | null;

  while ((match = btRegex.exec(raw)) !== null) {
    const block = match[0];
    // Match literal strings in parentheses (text)
    const literalRegex = /\(([^)]+)\)\s*(?:Tj|TJ|'|")/g;
    let litMatch: RegExpExecArray | null;
    const blockStrings: string[] = [];

    while ((litMatch = literalRegex.exec(block)) !== null) {
      const decoded = litMatch[1]
        .replace(/\\([()\\])/g, '$1')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\t/g, ' ')
        .trim();
      if (decoded) {
        blockStrings.push(decoded);
      }
    }

    if (blockStrings.length > 0) {
      textMatches.push(blockStrings.join(' '));
    }
  }

  // Count /Page objects
  const pageMatches = raw.match(/\/Type\s*\/Page[^s]/g) || [1];
  const totalPages = Math.max(1, pageMatches.length);

  const lines = textMatches.filter((t) => t.trim().length > 0);
  const fullText = lines.join('\n\n');

  const page: ExtractedPage = {
    pageNumber: 1,
    text: fullText,
    lines,
  };

  return {
    fileName,
    totalPages,
    pages: [page],
    fullText,
    isScannedOrImageOnly: fullText.trim().length === 0,
  };
}

/**
 * Converts extracted pages into structured Markdown text.
 */
export function convertPagesToMarkdown(pages: ExtractedPage[]): string {
  const mdParts: string[] = [];

  pages.forEach((page) => {
    mdParts.push(`<!-- Page ${page.pageNumber} -->`);

    let isFirstNonEmpty = true;
    page.lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (isFirstNonEmpty && trimmed.length < 60 && !trimmed.endsWith('.')) {
        mdParts.push(`## ${trimmed}\n`);
        isFirstNonEmpty = false;
      } else if (
        trimmed.length < 40 &&
        !trimmed.endsWith('.') &&
        (trimmed === trimmed.toUpperCase() || /^[0-9]+(\.[0-9]+)*\s+[A-Z]/.test(trimmed))
      ) {
        mdParts.push(`\n### ${trimmed}\n`);
      } else if (/^[-*•]\s+/.test(trimmed)) {
        mdParts.push(trimmed.replace(/^[•]\s+/, '- '));
      } else if (/^[0-9]+\.\s+/.test(trimmed)) {
        mdParts.push(trimmed);
      } else {
        mdParts.push(`${trimmed}\n`);
      }
    });

    mdParts.push('\n---\n');
  });

  return mdParts.join('\n');
}

/**
 * Creates an official Word document (.doc) blob from pages with formatting.
 * Compatible with Microsoft Word, LibreOffice, Google Docs, and Apple Pages.
 */
export function createWordDocumentBlob(title: string, pages: ExtractedPage[]): Blob {
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body {
          font-family: Calibri, 'Segoe UI', Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #111111;
          margin: 1in;
        }
        h1 {
          font-size: 18pt;
          color: #1a365d;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 6px;
          margin-top: 18pt;
          margin-bottom: 12pt;
        }
        h2 {
          font-size: 14pt;
          color: #2b6cb0;
          margin-top: 14pt;
          margin-bottom: 8pt;
        }
        p {
          margin-bottom: 8pt;
          text-align: justify;
        }
        .page-break {
          page-break-after: always;
          margin-top: 20pt;
          border-top: 1px dashed #cbd5e0;
          padding-top: 10pt;
        }
        .page-number {
          font-size: 9pt;
          color: #718096;
          text-align: right;
          margin-bottom: 10pt;
        }
      </style>
    </head>
    <body>
      ${pages
        .map(
          (page, idx) => `
        <div class="page-container ${idx > 0 ? 'page-break' : ''}">
          <div class="page-number">Page ${page.pageNumber}</div>
          ${page.lines
            .map((line) => {
              const trimmed = line.trim();
              if (!trimmed) return '';
              if (trimmed.length < 50 && (trimmed === trimmed.toUpperCase() || /^[A-Z0-9\s:.-]{3,40}$/.test(trimmed))) {
                return `<h2>${trimmed}</h2>`;
              }
              return `<p>${trimmed}</p>`;
            })
            .join('')}
        </div>
      `
        )
        .join('')}
    </body>
    </html>
  `;

  return new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
}

/**
 * Creates an official Word document (.doc) blob from raw or user-edited text.
 */
export function createWordDocumentFromText(title: string, text: string): Blob {
  const paragraphs = text.split('\n');

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body {
          font-family: Calibri, 'Segoe UI', Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #111111;
          margin: 1in;
        }
        h1 {
          font-size: 18pt;
          color: #1a365d;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 6px;
          margin-top: 18pt;
          margin-bottom: 12pt;
        }
        h2 {
          font-size: 14pt;
          color: #2b6cb0;
          margin-top: 14pt;
          margin-bottom: 8pt;
        }
        p {
          margin-bottom: 8pt;
          text-align: justify;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${paragraphs
        .map((p) => {
          const trimmed = p.trim();
          if (!trimmed) return '';
          if (trimmed.length < 50 && (trimmed === trimmed.toUpperCase() || /^[A-Z0-9\s:.-]{3,40}$/.test(trimmed))) {
            return `<h2>${trimmed}</h2>`;
          }
          return `<p>${trimmed}</p>`;
        })
        .join('')}
    </body>
    </html>
  `;

  return new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
}

/**
 * Extracts tabular or delimited rows from extracted text for Excel/CSV export.
 */
export function extractTableDataFromPages(pages: ExtractedPage[]): string[][] {
  const allRows: string[][] = [];

  pages.forEach((page) => {
    page.lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      let cells: string[] = [];
      if (trimmed.includes('\t')) {
        cells = trimmed.split('\t');
      } else if (trimmed.includes('|')) {
        cells = trimmed.split('|').map((c) => c.trim()).filter(Boolean);
      } else if (trimmed.includes(',') && trimmed.split(',').length >= 3) {
        cells = trimmed.split(',').map((c) => c.trim());
      } else if (/\s{2,}/.test(trimmed)) {
        cells = trimmed.split(/\s{2,}/).map((c) => c.trim());
      } else {
        cells = [trimmed];
      }

      if (cells.length > 0) {
        allRows.push(cells);
      }
    });
  });

  return allRows.length > 0 ? allRows : [['No structured data detected']];
}
