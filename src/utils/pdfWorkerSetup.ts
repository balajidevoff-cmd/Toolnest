// Ensure Uint8Array toHex and Promise.withResolvers exist in all environments (Node, Safari, Chrome, Workers)
// This is required because Mozilla PDF.js v6 targets modern unreleased ES specifications.
if (typeof Uint8Array !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uint8Proto = Uint8Array.prototype as any;
  if (!uint8Proto.toHex) {
    uint8Proto.toHex = function () {
      let hex = '';
      for (let i = 0; i < this.length; i++) {
        hex += this[i].toString(16).padStart(2, '0');
      }
      return hex;
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(Uint8Array as any).fromHex) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Uint8Array as any).fromHex = function (hex: string) {
      const bytes = new Uint8Array(Math.floor(hex.length / 2));
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
      }
      return bytes;
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof Promise !== 'undefined' && !(Promise as any).withResolvers) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
}

export { pdfjsLib };
