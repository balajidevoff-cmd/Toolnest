import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { parsePdfPageRange } from '../../../utils/pdfRange';
import { formatFileSize } from '../../../utils/format';
import { FileText, Download, Loader2, CheckCircle2, Scissors, RefreshCw } from 'lucide-react';

export const PdfSplitterTool: React.FC = () => {
  const { addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [rangeInput, setRangeInput] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    const selected = files[0];
    setFile(selected);

    try {
      const buffer = await selected.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      setTotalPages(count);
      setRangeInput(count > 1 ? `1-${Math.min(count, 3)}` : '1');
    } catch {
      setError('Could not inspect PDF. The file may be password protected or invalid.');
      setFile(null);
      setTotalPages(null);
    }
  };

  const handleExtract = async () => {
    if (!file || !totalPages) return;
    setError(null);
    setIsProcessing(true);

    try {
      const pageIndices = parsePdfPageRange(rangeInput, totalPages);
      const buffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(buffer, { ignoreEncryption: true });

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const newBytes = await newPdf.save();
      const blob = new Blob([newBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      addToast({
        type: 'success',
        title: 'Extraction Complete',
        message: `Extracted ${pageIndices.length} page(s) into a new PDF!`,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to extract pages.';
      setError(errMsg);
      addToast({
        type: 'error',
        title: 'Extraction Error',
        message: errMsg,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setTotalPages(null);
    setDownloadUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadDropzone
          accept=".pdf,application/pdf"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Upload a PDF to extract pages"
          subtitle="Extract single pages or custom ranges • Free up to 1024MB (1GB)"
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-light-text dark:text-dark-text">{file.name}</p>
                <p className="text-xs text-light-muted dark:text-dark-muted">
                  Total Pages: <strong>{totalPages}</strong> • {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            <button
              onClick={resetAll}
              className="flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Choose different file
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-light-text dark:text-dark-text">
              Pages to Extract (e.g. 1-3, 5, 7-{totalPages})
            </label>
            <input
              type="text"
              value={rangeInput}
              onChange={(e) => setRangeInput(e.target.value)}
              placeholder="e.g. 1-3, 5"
              className="w-full max-w-md px-4 py-2.5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-sm text-light-text dark:text-dark-text focus:border-brand-purple focus:outline-none"
            />
            <p className="text-[11px] text-light-muted dark:text-dark-muted">
              Enter individual pages separated by commas or dash-separated ranges between 1 and {totalPages}.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleExtract}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-accent disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting Pages...</span>
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4" />
                  <span>Extract Specified Pages</span>
                </>
              )}
            </button>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download={`extracted-${file.name}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <Download className="w-4 h-4" />
                <span>Download Extracted PDF</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
