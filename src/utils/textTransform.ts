/**
 * Text transformation utilities for ToolNest writing suite.
 */

export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}

export function toSentenceCase(str: string): string {
  return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
}

export function toAlternatingCase(str: string): string {
  return str
    .split('')
    .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
    .join('');
}

export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
    .replace(/[\s\-_]+/g, '');
}

export function toKebabCase(str: string): string {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((x) => x.toLowerCase())
    .join('-') || '';
}

export function toSnakeCase(str: string): string {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((x) => x.toLowerCase())
    .join('_') || '';
}

export function generateSlug(text: string, separator = '-'): string {
  return text
    .normalize('NFKD') // Normalize unicode
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove invalid chars
    .replace(/\s+/g, separator) // Replace spaces with separator
    .replace(new RegExp(`\\${separator}+`, 'g'), separator); // Remove duplicates
}

export function cleanWhitespace(
  text: string,
  options: { removeExtraSpaces?: boolean; removeEmptyLines?: boolean; trimLines?: boolean }
): string {
  let result = text;
  if (options.removeExtraSpaces) {
    result = result.replace(/[^\S\r\n]+/g, ' ');
  }
  if (options.trimLines) {
    result = result
      .split('\n')
      .map((l) => l.trim())
      .join('\n');
  }
  if (options.removeEmptyLines) {
    result = result.replace(/^\s*[\r\n]/gm, '');
  }
  return result.trim();
}
