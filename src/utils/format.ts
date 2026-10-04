/**
 * Formats a file size in bytes into a clean, human-readable string (B, KB, MB, GB).
 */
export function formatFileSize(bytes: number): string {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) {
    return '0 B';
  }
  if (bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  if (bytes < k) {
    return `${bytes} B`;
  } else if (bytes < k * k) {
    return `${(bytes / k).toFixed(1)} KB`;
  } else if (bytes < k * k * k) {
    return `${(bytes / (k * k)).toFixed(2)} MB`;
  } else {
    return `${(bytes / (k * k * k)).toFixed(2)} GB`;
  }
}
