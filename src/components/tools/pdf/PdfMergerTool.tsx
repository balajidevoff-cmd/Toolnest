import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { formatFileSize } from '../../../utils/format';
import { Trash2, ArrowUp, ArrowDown, Download, FileText, Loader2, CheckCircle2 } from 'lucide-react';

interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
}

export const PdfMergerTool: React.FC = () => {
  const { addToast } = useApp();
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setError(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    const pdfOnly = newFiles.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (pdfOnly.length < newFiles.length) {
      addToast({
        type: 'warning',
        message: 'Non-PDF files were skipped.',
      });
    }

    const items: PdfFileItem[] = pdfOnly.map((f) => ({
      id: Math.random().toString(36).substring(2, 9),
      file: f,
      name: f.name,
      size: f.size,
    }));

    setFiles((prev) => [...prev, ...items]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;
    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[targetIndex];
    newFiles[targetIndex] = temp;
    setFiles(newFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least two PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const arrayBuffer = await item.file.arrayBuffer();
        let loadedDoc: PDFDocument;
        try {
          loadedDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        } catch {
          throw new Error(`Could not read "${item.name}". The file may be password protected or damaged.`);
        }

        const copiedPages = await mergedPdf.copyPages(loadedDoc, loadedDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      addToast({
        type: 'success',
        title: 'Merge Complete',
        message: `Successfully merged ${files.length} PDFs into one document!`,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to merge PDF files. Please ensure files are valid.';
      setError(errMsg);
      addToast({
        type: 'error',
        title: 'Merge Failed',
        message: errMsg,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileUploadDropzone
        accept=".pdf,application/pdf"
        multiple={true}
        onFilesSelected={handleFilesSelected}
        title="Upload PDF files to merge"
        subtitle="Select multiple PDF documents to unite into a single file • Free up to 1024MB (1GB)"
      />

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-light-text dark:text-dark-text">
              Files to Merge ({files.length})
            </h3>
            <button
              onClick={() => {
                setFiles([]);
                if (downloadUrl) URL.revokeObjectURL(downloadUrl);
                setDownloadUrl(null);
              }}
              className="text-xs text-rose-500 hover:underline"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2">
            {files.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-light-text dark:text-dark-text truncate">
                      {idx + 1}. {item.name}
                    </p>
                    <p className="text-[11px] text-light-muted dark:text-dark-muted">
                      {formatFileSize(item.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveFile(idx, 'up')}
                    className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 text-light-muted dark:text-dark-muted"
                    aria-label="Move file up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={idx === files.length - 1}
                    onClick={() => moveFile(idx, 'down')}
                    className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 text-light-muted dark:text-dark-muted"
                    aria-label="Move file down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFile(item.id)}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    aria-label="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleMerge}
              disabled={files.length < 2 || isProcessing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-accent disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Merging PDFs...</span>
                </>
              ) : (
                <span>Merge {files.length} PDFs</span>
              )}
            </button>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download="merged-document.pdf"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <Download className="w-4 h-4" />
                <span>Download Merged PDF</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
