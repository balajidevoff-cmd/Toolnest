import React, { useState } from 'react';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { formatFileSize } from '../../../utils/format';
import { Download, Loader2, RefreshCw, CheckCircle2, AlertCircle, Sliders, Zap, Sparkles, Shield } from 'lucide-react';

type ScalePreset = '100' | '1920' | '1280' | '75' | '50';

export const ImageCompressorTool: React.FC = () => {
  const { addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(65);
  const [format, setFormat] = useState<'image/jpeg' | 'image/webp'>('image/webp');
  const [scalePreset, setScalePreset] = useState<ScalePreset>('100');
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

  const handleCompress = async (forcedScale?: number, forcedQuality?: number, forcedFormat?: 'image/jpeg' | 'image/webp') => {
    if (!imageSrc || !file) return;
    setIsProcessing(true);

    const useQuality = forcedQuality !== undefined ? forcedQuality : quality;
    const useFormat = forcedFormat !== undefined ? forcedFormat : format;

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      let targetWidth = img.naturalWidth;
      let targetHeight = img.naturalHeight;

      if (forcedScale !== undefined) {
        targetWidth = Math.round(img.naturalWidth * forcedScale);
        targetHeight = Math.round(img.naturalHeight * forcedScale);
      } else if (scalePreset === '75') {
        targetWidth = Math.round(img.naturalWidth * 0.75);
        targetHeight = Math.round(img.naturalHeight * 0.75);
      } else if (scalePreset === '50') {
        targetWidth = Math.round(img.naturalWidth * 0.5);
        targetHeight = Math.round(img.naturalHeight * 0.5);
      } else if (scalePreset === '1920' && (targetWidth > 1920 || targetHeight > 1920)) {
        if (targetWidth >= targetHeight) {
          targetHeight = Math.round((1920 / targetWidth) * targetHeight);
          targetWidth = 1920;
        } else {
          targetWidth = Math.round((1920 / targetHeight) * targetWidth);
          targetHeight = 1920;
        }
      } else if (scalePreset === '1280' && (targetWidth > 1280 || targetHeight > 1280)) {
        if (targetWidth >= targetHeight) {
          targetHeight = Math.round((1280 / targetWidth) * targetHeight);
          targetWidth = 1280;
        } else {
          targetWidth = Math.round((1280 / targetHeight) * targetWidth);
          targetHeight = 1280;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, targetWidth);
      canvas.height = Math.max(1, targetHeight);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // White background for JPEGs
      if (useFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, useFormat, useQuality / 100)
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
          message: `Saved ${pct}% (${formatFileSize(savedBytes)})!`,
        });
      } else {
        addToast({
          type: 'warning',
          title: 'Size Check',
          message: 'The file was already compressed. Lower quality or scale down to reduce size further.',
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

  const forceAutoCompress = () => {
    // Automatically apply 75% resolution and 50% WebP quality to guarantee a smaller size
    setScalePreset('75');
    setQuality(50);
    setFormat('image/webp');
    handleCompress(0.75, 50, 'image/webp');
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
          accept="image/png,image/jpeg,image/webp,image/jpg"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Upload an image to compress"
          subtitle="Adjust compression quality and resolution scaling • Free up to 1024MB (1GB)"
        />
      ) : (
        <div className="space-y-6">
          {/* Image Overview Banner */}
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
                  Original: {originalSize !== null ? formatFileSize(originalSize) : ''}
                </p>
              </div>
            </div>

            <button
              onClick={resetAll}
              className="flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted hover:text-light-text cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Different image
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="p-4 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-light-border dark:border-dark-border space-y-3">
            <span className="text-xs font-bold text-light-text dark:text-dark-text uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-purple" />
              Compression Profile
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => { setQuality(65); setFormat('image/webp'); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  quality === 65 && format === 'image/webp'
                    ? 'border-brand-purple bg-brand-purple/10 ring-1 ring-brand-purple'
                    : 'border-light-border dark:border-dark-border bg-white/40 dark:bg-black/20'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Balanced (WebP)</span>
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-[11px] text-light-muted dark:text-dark-muted mt-1">
                  ~65% quality. High reduction with sharp visual clarity.
                </p>
              </button>

              <button
                type="button"
                onClick={() => { setQuality(40); setFormat('image/webp'); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  quality === 40 && format === 'image/webp'
                    ? 'border-brand-purple bg-brand-purple/10 ring-1 ring-brand-purple'
                    : 'border-light-border dark:border-dark-border bg-white/40 dark:bg-black/20'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Extreme Compression</span>
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <p className="text-[11px] text-light-muted dark:text-dark-muted mt-1">
                  ~40% quality. Smallest file footprint for fast web sharing.
                </p>
              </button>

              <button
                type="button"
                onClick={() => { setQuality(82); setFormat('image/jpeg'); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  quality === 82 && format === 'image/jpeg'
                    ? 'border-brand-purple bg-brand-purple/10 ring-1 ring-brand-purple'
                    : 'border-light-border dark:border-dark-border bg-white/40 dark:bg-black/20'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>High Quality (JPEG)</span>
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <p className="text-[11px] text-light-muted dark:text-dark-muted mt-1">
                  ~82% quality. Universal compatibility with rich colors.
                </p>
              </button>
            </div>
          </div>

          {/* Detailed Tuning Controls */}
          <div className="p-5 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-light-border dark:border-dark-border space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Quality Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-light-text dark:text-dark-text">Quality: {quality}%</span>
                  <span className="text-light-muted dark:text-dark-muted">
                    {quality > 75 ? 'High' : quality > 45 ? 'Balanced' : 'Smallest'}
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

              {/* Format selection */}
              <div>
                <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as 'image/jpeg' | 'image/webp')}
                  className="w-full px-3 py-2 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-xs font-medium text-light-text dark:text-dark-text focus:outline-none cursor-pointer"
                >
                  <option value="image/webp">WebP (Best Compression)</option>
                  <option value="image/jpeg">JPEG (Standard Compatibility)</option>
                </select>
              </div>

              {/* Max Scale Preset */}
              <div>
                <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1">
                  Resolution Scale
                </label>
                <select
                  value={scalePreset}
                  onChange={(e) => setScalePreset(e.target.value as ScalePreset)}
                  className="w-full px-3 py-2 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-xs font-medium text-light-text dark:text-dark-text focus:outline-none cursor-pointer"
                >
                  <option value="100">Original Resolution (100%)</option>
                  <option value="1920">Max 1920px (Full HD)</option>
                  <option value="1280">Max 1280px (HD)</option>
                  <option value="75">75% of Original</option>
                  <option value="50">50% of Original (Small)</option>
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
                  {originalSize !== null ? formatFileSize(originalSize) : ''}
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
                  {compressedSize !== null ? formatFileSize(compressedSize) : ''}{' '}
                  <span className="text-xs font-normal">
                    ({isLarger ? `+${formatFileSize(Math.abs(savedDifference))}` : `-${((savedDifference / originalSize) * 100).toFixed(1)}%`})
                  </span>
                </p>
              </div>
            </div>
          )}

          {isLarger && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                <span>
                  The image was already heavily compressed. Click below to automatically scale and enforce size reduction.
                </span>
              </div>
              <button
                type="button"
                onClick={forceAutoCompress}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs whitespace-nowrap cursor-pointer"
              >
                Force Reduction (75% WebP)
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => handleCompress()}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-accent disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compressing Image...</span>
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
                <span>Download Compressed ({compressedSize !== null ? formatFileSize(compressedSize) : ''})</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
