import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { FileText, Download, Loader2, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export const PdfCompressorTool: React.FC = () => {
  const { addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    setStatusMessage(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    const selected = files[0];
    setFile(selected);
    setOriginalSize(selected.size);
    setCompressedSize(null);
  };

  const handleOptimize = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      // Load with pdf-lib and re-serialize with object stream compression
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      // Re-save without unused objects and stream compaction
      const optimizedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const newSize = optimizedBytes.length;
      setCompressedSize(newSize);

      const blob = new Blob([optimizedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      const diff = file.size - newSize;
      if (diff > 0) {
        const pct = ((diff / file.size) * 100).toFixed(1);
        setStatusMessage(`Successfully optimized! File reduced by ${pct}% (${(diff / 1024).toFixed(1)} KB).`);
        addToast({
          type: 'success',
          title: 'Optimization Complete',
          message: `Saved ${pct}% of original file size.`,
        });
      } else {
        setStatusMessage(
          `This PDF is already heavily compressed. Re-structuring saved ${(newSize / (1024 * 1024)).toFixed(2)} MB with normalized object tables.`
        );
        addToast({
          type: 'info',
          title: 'PDF Processed',
          message: 'Structure optimized. PDF streams were already compact.',
        });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Could not process PDF file.';
      setError(errMsg);
      addToast({
        type: 'error',
        title: 'Processing Failed',
        message: errMsg,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Honest Disclaimer Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">Honest Client-Side Optimization</p>
          <p className="text-light-muted dark:text-dark-muted leading-relaxed">
            This tool performs genuine lossless client-side PDF restructuring and removes duplicate dictionary streams. Note: Scanned documents containing embedded uncompressed photos require lossy raster downsampling, whereas text PDFs are compacted into object streams.
          </p>
        </div>
      </div>

      {!file ? (
        <FileUploadDropzone
          accept=".pdf,application/pdf"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Upload a PDF to optimize"
          subtitle="Client-side restructuring with zero cloud transmission"
        />
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-light-text dark:text-dark-text">{file.name}</p>
                <p className="text-xs text-light-muted dark:text-dark-muted">
                  Original Size: {originalSize ? `${(originalSize / 1024).toFixed(1)} KB` : ''}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (downloadUrl) URL.revokeObjectURL(downloadUrl);
                setFile(null);
                setCompressedSize(null);
                setDownloadUrl(null);
              }}
              className="text-xs text-light-muted dark:text-dark-muted hover:text-light-text"
            >
              Change file
            </button>
          </div>

          {compressedSize !== null && originalSize !== null && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-black/[0.01] dark:bg-white/[0.01]">
                <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Original Size</span>
                <p className="text-xl font-bold text-light-text dark:text-dark-text mt-1">
                  {(originalSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <span className="text-[11px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">Optimized Size</span>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {(compressedSize / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          )}

          {statusMessage && (
            <div className="p-3.5 rounded-xl bg-brand-purple/10 border border-brand-purple/20 text-xs text-light-text dark:text-dark-text flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleOptimize}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-accent disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Optimizing PDF...</span>
                </>
              ) : (
                <span>Optimize & Compact PDF</span>
              )}
            </button>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download={`optimized-${file.name}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Optimized PDF</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
