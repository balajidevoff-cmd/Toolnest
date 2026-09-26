import React, { useState, useRef } from 'react';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { Crop, Download, RefreshCw } from 'lucide-react';

export const ImageCropperTool: React.FC = () => {
  const { addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [aspectPreset, setAspectPreset] = useState<'free' | '1:1' | '16:9' | '4:3'>('free');
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 }); // in percentages
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);

    const url = URL.createObjectURL(selected);
    setImageSrc(url);
    setCropBox({ x: 10, y: 10, width: 80, height: 80 });
  };

  const handlePresetChange = (preset: 'free' | '1:1' | '16:9' | '4:3') => {
    setAspectPreset(preset);
    if (preset === '1:1') {
      setCropBox({ x: 15, y: 15, width: 70, height: 70 });
    } else if (preset === '16:9') {
      setCropBox({ x: 5, y: 25, width: 90, height: 50 });
    } else if (preset === '4:3') {
      setCropBox({ x: 10, y: 20, width: 80, height: 60 });
    }
  };

  const handleCrop = async () => {
    if (!imageSrc) return;

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const actualX = (cropBox.x / 100) * img.naturalWidth;
      const actualY = (cropBox.y / 100) * img.naturalHeight;
      const actualW = (cropBox.width / 100) * img.naturalWidth;
      const actualH = (cropBox.height / 100) * img.naturalHeight;

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(actualW));
      canvas.height = Math.max(1, Math.round(actualH));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.drawImage(img, actualX, actualY, actualW, actualH, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Crop export failed');

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      addToast({
        type: 'success',
        title: 'Image Cropped',
        message: `Cropped to ${canvas.width}×${canvas.height}px!`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not crop image.',
      });
    }
  };

  const resetAll = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setImageSrc(null);
    setDownloadUrl(null);
  };

  return (
    <div className="space-y-6">
      {!imageSrc ? (
        <FileUploadDropzone
          accept="image/png,image/jpeg,image/webp"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Upload an image to crop"
          subtitle="Interactive cropping with standard aspect ratio presets"
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
            <span className="font-semibold text-sm text-light-text dark:text-dark-text truncate">
              {file?.name}
            </span>
            <button
              onClick={resetAll}
              className="flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted hover:text-light-text"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Upload different
            </button>
          </div>

          {/* Aspect Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-light-muted dark:text-dark-muted mr-1">Aspect Ratio:</span>
            {[
              { id: 'free', label: 'Freeform' },
              { id: '1:1', label: '1:1 Square' },
              { id: '16:9', label: '16:9 Widescreen' },
              { id: '4:3', label: '4:3 Standard' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetChange(p.id as typeof aspectPreset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  aspectPreset === p.id
                    ? 'bg-brand-purple text-white border-brand-purple'
                    : 'border-light-border dark:border-dark-border text-light-muted hover:text-light-text'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Crop Container with Visual Frame */}
          <div className="relative rounded-2xl overflow-hidden border border-light-border dark:border-dark-border bg-black/40 flex items-center justify-center p-4 min-h-[350px]">
            <div ref={containerRef} className="relative inline-block select-none">
              <img src={imageSrc} alt="To crop" className="max-h-[480px] max-w-full rounded object-contain block pointer-events-none" />

              {/* Crop box overlay */}
              <div
                style={{
                  left: `${cropBox.x}%`,
                  top: `${cropBox.y}%`,
                  width: `${cropBox.width}%`,
                  height: `${cropBox.height}%`,
                }}
                className="absolute border-2 border-brand-purple shadow-outline bg-brand-purple/20 backdrop-blur-[1px] pointer-events-none"
              >
                <div className="absolute top-1 left-1.5 text-[10px] font-mono text-white bg-brand-purple/80 px-1 py-0.5 rounded">
                  Crop Area
                </div>
              </div>
            </div>
          </div>

          {/* Fine Tuning Sliders */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] border border-light-border dark:border-dark-border text-xs">
            <div>
              <span className="font-medium text-light-muted">Width: {cropBox.width}%</span>
              <input
                type="range"
                min="20"
                max="100"
                value={cropBox.width}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCropBox((prev) => ({
                    ...prev,
                    width: val,
                    x: Math.min(prev.x, 100 - val),
                  }));
                }}
                className="w-full accent-brand-purple"
              />
            </div>
            <div>
              <span className="font-medium text-light-muted">Height: {cropBox.height}%</span>
              <input
                type="range"
                min="20"
                max="100"
                value={cropBox.height}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCropBox((prev) => ({
                    ...prev,
                    height: val,
                    y: Math.min(prev.y, 100 - val),
                  }));
                }}
                className="w-full accent-brand-purple"
              />
            </div>
            <div>
              <span className="font-medium text-light-muted">X Offset: {cropBox.x}%</span>
              <input
                type="range"
                min="0"
                max={100 - cropBox.width}
                value={cropBox.x}
                onChange={(e) => setCropBox((prev) => ({ ...prev, x: parseInt(e.target.value, 10) }))}
                className="w-full accent-brand-purple"
              />
            </div>
            <div>
              <span className="font-medium text-light-muted">Y Offset: {cropBox.y}%</span>
              <input
                type="range"
                min="0"
                max={100 - cropBox.height}
                value={cropBox.y}
                onChange={(e) => setCropBox((prev) => ({ ...prev, y: parseInt(e.target.value, 10) }))}
                className="w-full accent-brand-purple"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleCrop}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-accent text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Crop className="w-4 h-4" />
              <span>Apply & Export Crop</span>
            </button>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download="cropped-image.png"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Cropped PNG</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
