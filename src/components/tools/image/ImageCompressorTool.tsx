import React, { useState } from 'react';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { Download, Loader2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const ImageCompressorTool: React.FC = () => {
  const { addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(75);
  const [format, setFormat] = useState<'image/jpeg' | 'image/webp'>('image/jpeg');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setOriginalSize(selected.size);
    setCompressedSize(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);

    const url = URL.createObjectURL(selected);
    setImageSrc(url);
  };

  const handleCompress = async () => {
    if (!imageSrc || !file) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Fill white background for JPEGs so transparent PNGs don't render black
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, format, quality / 100)
      );

      if (!blob) throw new Error('Compression failed');

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setCompressedSize(blob.size);

      const savedBytes = file.size - blob.size;
      if (savedBytes > 0) {
        const pct = ((savedBytes / file.size) * 100).toFixed(1);
        addToast({
          type: 'success',
          title: 'Compression Successful',
          message: `Saved ${pct}% (${(savedBytes / 1024).toFixed(1)} KB)!`,
        });
      } else {
        addToast({
          type: 'warning',
          title: 'Image Size Increased',
          message: 'Target format/quality produced a larger file than original.',
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not compress image.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setImageSrc(null);
    setOriginalSize(null);
    setCompressedSize(null);
    setDownloadUrl(null);
  };

  const savedDifference = originalSize && compressedSize ? originalSize - compressedSize : 0;
  const isLarger = savedDifference < 0;

  return (
    <div className="space-y-6">
      {!imageSrc ? (
        <FileUploadDropzone
          accept="image/png,image/jpeg,image/webp"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Upload an image to compress"
          subtitle="Adjust compression quality with instant before/after size comparisons"
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              <img
                src={imageSrc}
                alt="Source preview"
                className="w-14 h-14 object-cover rounded-lg border border-light-border dark:border-dark-border"
              />
              <div>
                <p className="font-semibold text-sm text-light-text dark:text-dark-text">{file?.name}</p>
                <p className="text-xs text-light-muted dark:text-dark-muted">
                  Original: {originalSize ? `${(originalSize / 1024).toFixed(1)} KB` : ''}
                </p>
              </div>
            </div>

            <button
              onClick={resetAll}
              className="flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted hover:text-light-text"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Different image
            </button>
          </div>

          {/* Quality & Format Controls */}
          <div className="p-5 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-light-border dark:border-dark-border space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-light-text dark:text-dark-text">Compression Quality: {quality}%</span>
                  <span className="text-light-muted dark:text-dark-muted">
                    {quality > 80 ? 'High Fidelity' : quality > 50 ? 'Balanced' : 'Smallest Size'}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                  className="w-full accent-brand-purple cursor-pointer"
                />
              </div>

              <div className="w-full sm:w-48">
                <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as 'image/jpeg' | 'image/webp')}
                  className="w-full px-3 py-2 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-xs font-medium text-light-text dark:text-dark-text focus:outline-none cursor-pointer"
                >
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WebP (Recommended)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Comparison Cards */}
          {compressedSize !== null && originalSize !== null && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-black/[0.01] dark:bg-white/[0.01]">
                <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Original Size</span>
                <p className="text-xl font-bold text-light-text dark:text-dark-text mt-1">
                  {(originalSize / 1024).toFixed(1)} KB
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border ${
                  isLarger ? 'border-amber-500/30 bg-amber-500/5' : 'border-emerald-500/30 bg-emerald-500/5'
                }`}
              >
                <span
                  className={`text-[11px] font-semibold uppercase ${
                    isLarger ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isLarger ? 'Output is Larger' : 'Compressed Size'}
                </span>
                <p
                  className={`text-xl font-bold mt-1 ${
                    isLarger ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {(compressedSize / 1024).toFixed(1)} KB{' '}
                  <span className="text-xs font-normal">
                    ({isLarger ? `+${(Math.abs(savedDifference) / 1024).toFixed(1)} KB` : `-${((savedDifference / originalSize) * 100).toFixed(1)}%`})
                  </span>
                </p>
              </div>
            </div>
          )}

          {isLarger && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                The output is larger than your original file because the input image was already aggressively compressed. Lower the quality slider or keep the original file.
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleCompress}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-accent disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compressing...</span>
                </>
              ) : (
                <span>Compress Image</span>
              )}
            </button>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download={`compressed-${file?.name.replace(/\.[^/.]+$/, '')}.${format === 'image/jpeg' ? 'jpg' : 'webp'}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <Download className="w-4 h-4" />
                <span>Download Compressed ({compressedSize ? (compressedSize / 1024).toFixed(1) : ''} KB)</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
