import React, { useState, useRef } from 'react';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { Lock, Unlock, Download, Loader2, RefreshCw } from 'lucide-react';

export const ImageResizerTool: React.FC = () => {
  const { addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [origDimensions, setOrigDimensions] = useState<{ width: number; height: number } | null>(null);
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [lockRatio, setLockRatio] = useState<boolean>(true);
  const [format, setFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadSize, setDownloadSize] = useState<number | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);

    const url = URL.createObjectURL(selected);
    setImageSrc(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setOrigDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (lockRatio && origDimensions && origDimensions.width > 0) {
      const ratio = origDimensions.height / origDimensions.width;
      setHeight(Math.round(newWidth * ratio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (lockRatio && origDimensions && origDimensions.height > 0) {
      const ratio = origDimensions.width / origDimensions.height;
      setWidth(Math.round(newHeight * ratio));
    }
  };

  const handleResize = async () => {
    if (!imageSrc || !width || !height) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize canvas context');

      ctx.drawImage(img, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, 0.92));
      if (!blob) throw new Error('Could not export resized image');

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadSize(blob.size);

      addToast({
        type: 'success',
        title: 'Image Resized',
        message: `Successfully resized to ${width}×${height}px!`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Resize Failed',
        message: 'Could not resize image.',
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
    setOrigDimensions(null);
    setDownloadUrl(null);
  };

  return (
    <div className="space-y-6">
      {!imageSrc ? (
        <FileUploadDropzone
          accept="image/png,image/jpeg,image/webp"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Upload an image to resize"
          subtitle="Supports PNG, JPG, and WebP images"
        />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Uploaded preview"
                className="w-14 h-14 object-cover rounded-lg border border-light-border dark:border-dark-border"
              />
              <div>
                <p className="font-semibold text-sm text-light-text dark:text-dark-text">{file?.name}</p>
                <p className="text-xs text-light-muted dark:text-dark-muted">
                  Original: {origDimensions?.width} × {origDimensions?.height} px •{' '}
                  {file ? (file.size / 1024).toFixed(1) : ''} KB
                </p>
              </div>
            </div>

            <button
              onClick={resetAll}
              className="flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted hover:text-light-text"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Upload different image
            </button>
          </div>

          {/* Dimension Controls */}
          <div className="p-5 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-light-border dark:border-dark-border space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[130px]">
                <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={width}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-sm font-mono text-light-text dark:text-dark-text focus:outline-none"
                />
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={() => setLockRatio(!lockRatio)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    lockRatio
                      ? 'bg-brand-purple/10 text-brand-purple border-brand-purple/30'
                      : 'border-light-border dark:border-dark-border text-light-muted'
                  }`}
                  title={lockRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                >
                  {lockRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex-1 min-w-[130px]">
                <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={height}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-sm font-mono text-light-text dark:text-dark-text focus:outline-none"
                />
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1">
                  Output Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as 'image/png' | 'image/jpeg' | 'image/webp')}
                  className="w-full px-3 py-2 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-xs font-medium text-light-text dark:text-dark-text focus:outline-none cursor-pointer"
                >
                  <option value="image/png">PNG (Lossless)</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WebP (Modern)</option>
                </select>
              </div>
            </div>

            {/* Quick scale presets */}
            <div className="flex items-center gap-2 pt-2 text-xs">
              <span className="text-light-muted dark:text-dark-muted font-medium">Quick presets:</span>
              {[25, 50, 75, 100, 150, 200].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => {
                    if (origDimensions) {
                      const scale = pct / 100;
                      setWidth(Math.round(origDimensions.width * scale));
                      setHeight(Math.round(origDimensions.height * scale));
                    }
                  }}
                  className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-brand-purple/10 hover:text-brand-purple text-light-text dark:text-dark-text font-medium"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleResize}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-accent disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Resizing...</span>
                </>
              ) : (
                <span>Resize Image</span>
              )}
            </button>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download={`resized-${width}x${height}.${format.split('/')[1]}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Resized Image ({downloadSize ? (downloadSize / 1024).toFixed(1) : ''} KB)</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
