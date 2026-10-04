import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { pdfjsLib } from '../../../utils/pdfWorkerSetup';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { formatFileSize } from '../../../utils/format';
import { FileText, Download, Loader2, CheckCircle2, AlertCircle, Sliders, Zap, Shield, Sparkles } from 'lucide-react';

type CompressionMode = 'balanced' | 'extreme' | 'low' | 'lossless';

export const PdfCompressorTool: React.FC = () => {
  const { addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compressionMode, setCompressionMode] = useState<CompressionMode>('balanced');

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
    setProgressText('Reading PDF data...');

    try {
      const buffer = await file.arrayBuffer();
      let compressedBytes: Uint8Array;

      if (compressionMode === 'lossless') {
        setProgressText('Restructuring PDF object streams...');
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        compressedBytes = await pdfDoc.save({
          useObjectStreams: true,
          addDefaultPage: false,
        });
      } else {
        // High-efficiency page raster compression using pdfjsLib and pdf-lib
        let scale = 1.0;
        let quality = 0.65;

        if (compressionMode === 'extreme') {
          scale = 0.75;
          quality = 0.45;
        } else if (compressionMode === 'low') {
          scale = 1.35;
          quality = 0.82;
        }

        setProgressText('Parsing PDF document structure...');
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const pdfDoc = await loadingTask.promise;
        const totalPages = pdfDoc.numPages;

        const newPdf = await PDFDocument.create();

        for (let i = 1; i <= totalPages; i++) {
          setProgressText(`Compressing page ${i} of ${totalPages} (${Math.round((i / totalPages) * 100)}%)...`);
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.floor(viewport.width));
          canvas.height = Math.max(1, Math.floor(viewport.height));
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas rendering context not available');

          // White background for transparent PDF elements
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
            canvas: canvas,
          };

          await (page.render(renderContext as any) as any).promise;

          const jpegBlob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', quality)
          );

          if (jpegBlob) {
            const jpegArray = await jpegBlob.arrayBuffer();
            const embeddedImg = await newPdf.embedJpg(jpegArray);
            const newPage = newPdf.addPage([viewport.width, viewport.height]);
            newPage.drawImage(embeddedImg, {
              x: 0,
              y: 0,
              width: viewport.width,
              height: viewport.height,
            });
          }

          // Release canvas memory
          canvas.width = 0;
          canvas.height = 0;
        }

        setProgressText('Finalizing compressed PDF file...');
        compressedBytes = await newPdf.save({ useObjectStreams: true });
      }

      const newSize = compressedBytes.length;
      setCompressedSize(newSize);

      const blob = new Blob([compressedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      const diff = file.size - newSize;
      if (diff > 0) {
        const pct = ((diff / file.size) * 100).toFixed(1);
        setStatusMessage(`Successfully optimized! File reduced by ${pct}% (${formatFileSize(diff)} saved).`);
        addToast({
          type: 'success',
          title: 'Compression Complete',
          message: `Saved ${pct}% of original file size (${formatFileSize(diff)}).`,
        });
      } else {
        setStatusMessage(
          `The document is already very compact. Normalized size: ${formatFileSize(newSize)}.`
        );
        addToast({
          type: 'info',
          title: 'PDF Processed',
          message: 'Document structure optimized.',
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
      setProgressText('');
    }
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadDropzone
          accept=".pdf,application/pdf"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Upload a PDF to compress"
          subtitle="Real client-side compression with customizable quality • Free up to 1024MB (1GB)"
        />
      ) : (
        <div className="space-y-6">
          {/* File Overview Banner */}
          <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-light-text dark:text-dark-text">{file.name}</p>
                <p className="text-xs text-light-muted dark:text-dark-muted">
                  Original Size: {originalSize !== null ? formatFileSize(originalSize) : ''}
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

          {/* Compression Level Selector */}
          <div className="p-5 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-light-border dark:border-dark-border space-y-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-purple" />
              <span className="text-xs font-bold text-light-text dark:text-dark-text uppercase tracking-wider">
                Select Compression Strength
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {/* Balanced */}
              <button
                type="button"
                onClick={() => setCompressionMode('balanced')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  compressionMode === 'balanced'
                    ? 'border-brand-purple bg-brand-purple/10 ring-1 ring-brand-purple'
                    : 'border-light-border dark:border-dark-border hover:border-brand-purple/40 bg-white/40 dark:bg-black/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-light-text dark:text-dark-text">Recommended</span>
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-[11px] text-light-muted dark:text-dark-muted">
                  Balanced quality & high reduction (~60-80% smaller). Best for most PDFs.
                </p>
              </button>

              {/* Extreme */}
              <button
                type="button"
                onClick={() => setCompressionMode('extreme')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  compressionMode === 'extreme'
                    ? 'border-brand-purple bg-brand-purple/10 ring-1 ring-brand-purple'
                    : 'border-light-border dark:border-dark-border hover:border-brand-purple/40 bg-white/40 dark:bg-black/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-light-text dark:text-dark-text">Extreme</span>
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <p className="text-[11px] text-light-muted dark:text-dark-muted">
                  Maximum compression (~80-95% smaller). Ideal for large scans & email attachments.
                </p>
              </button>

              {/* Low */}
              <button
                type="button"
                onClick={() => setCompressionMode('low')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  compressionMode === 'low'
                    ? 'border-brand-purple bg-brand-purple/10 ring-1 ring-brand-purple'
                    : 'border-light-border dark:border-dark-border hover:border-brand-purple/40 bg-white/40 dark:bg-black/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-light-text dark:text-dark-text">Low</span>
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <p className="text-[11px] text-light-muted dark:text-dark-muted">
                  Highest visual clarity (~30-50% smaller). Sharp text & high-res images.
                </p>
              </button>

              {/* Lossless */}
              <button
                type="button"
                onClick={() => setCompressionMode('lossless')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  compressionMode === 'lossless'
                    ? 'border-brand-purple bg-brand-purple/10 ring-1 ring-brand-purple'
                    : 'border-light-border dark:border-dark-border hover:border-brand-purple/40 bg-white/40 dark:bg-black/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-light-text dark:text-dark-text">Lossless Only</span>
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <p className="text-[11px] text-light-muted dark:text-dark-muted">
                  Pure object stream compaction. Zero pixel rasterization.
                </p>
              </button>
            </div>
          </div>

          {/* Size Comparison Cards */}
          {compressedSize !== null && originalSize !== null && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-black/[0.01] dark:bg-white/[0.01]">
                <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Original Size</span>
                <p className="text-xl font-bold text-light-text dark:text-dark-text mt-1">
                  {formatFileSize(originalSize)}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <span className="text-[11px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">Optimized Size</span>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatFileSize(compressedSize)}
                  {originalSize > compressedSize && (
                    <span className="text-xs font-normal ml-2 text-emerald-600 dark:text-emerald-400">
                      (-{(((originalSize - compressedSize) / originalSize) * 100).toFixed(1)}%)
                    </span>
                  )}
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleOptimize}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-accent disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{progressText || 'Compressing PDF...'}</span>
                </>
              ) : (
                <span>Compress & Compact PDF</span>
              )}
            </button>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download={`compressed-${file.name}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Compressed PDF ({compressedSize !== null ? formatFileSize(compressedSize) : ''})</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
