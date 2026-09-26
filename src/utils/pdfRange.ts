/**
 * Parses page range string (e.g. "1-3, 5, 7-9") into 0-indexed page indices.
 * @param rangeString Comma-separated page numbers or ranges (1-indexed)
 * @param totalPages Total number of pages in the PDF
 * @returns Array of 0-indexed page numbers
 */
export function parsePdfPageRange(rangeString: string, totalPages: number): number[] {
  if (!rangeString.trim()) {
    throw new Error('Please specify at least one page or page range.');
  }

  if (totalPages <= 0) {
    throw new Error('PDF has no valid pages.');
  }

  const parts = rangeString.split(',').map((p) => p.trim()).filter(Boolean);
  const resultIndices: number[] = [];

  for (const part of parts) {
    if (part.includes('-')) {
      const bounds = part.split('-').map((b) => b.trim());
      if (bounds.length !== 2) {
        throw new Error(`Invalid range format: "${part}"`);
      }
      const start = parseInt(bounds[0], 10);
      const end = parseInt(bounds[1], 10);

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Range contains invalid numbers: "${part}"`);
      }
      if (start < 1 || end < 1) {
        throw new Error(`Page numbers must be greater than zero.`);
      }
      if (start > totalPages || end > totalPages) {
        throw new Error(`Page number out of range: Document only has ${totalPages} pages.`);
      }
      if (start > end) {
        throw new Error(`Start page cannot be greater than end page in "${part}".`);
      }

      for (let i = start; i <= end; i++) {
        // Convert to 0-indexed
        resultIndices.push(i - 1);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (isNaN(pageNum)) {
        throw new Error(`Invalid page number: "${part}"`);
      }
      if (pageNum < 1) {
        throw new Error(`Page number must be at least 1.`);
      }
      if (pageNum > totalPages) {
        throw new Error(`Page ${pageNum} out of range: Document only has ${totalPages} pages.`);
      }
      resultIndices.push(pageNum - 1);
    }
  }

  if (resultIndices.length === 0) {
    throw new Error('No valid pages selected.');
  }

  return resultIndices;
}
