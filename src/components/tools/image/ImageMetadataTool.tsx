import React, { useState } from 'react';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { formatFileSize } from '../../../utils/format';
import { Info, Image as ImageIcon, RefreshCw, FileText } from 'lucide-react';

interface ImageMeta {
  name: string;
  sizeBytes: number;
  type: string;
  lastModified: number;
  width: number;
  height: number;
  aspectRatio: string;
  megapixels: string;
}

export const ImageMetadataTool: React.FC = () => {
  const [meta, setMeta] = useState<ImageMeta | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const calculateGcd = (a: number, b: number): number => {
    return b === 0 ? a : calculateGcd(b, a % b);
  };

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

    const img = new Image();
    img.src = preview;
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const gcd = calculateGcd(w, h);
      const ratio = `${w / gcd}:${h / gcd}`;
      const mp = ((w * h) / 1000000).toFixed(2);

      setMeta({
        name: file.name,
        sizeBytes: file.size,
        type: file.type || 'image/unknown',
        lastModified: file.lastModified,
        width: w,
        height: h,
        aspectRatio: ratio,
        megapixels: mp,
      });
    };
  };

  const resetAll = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setMeta(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Browser-Accessible Image Properties</p>
          <p className="text-light-muted dark:text-dark-muted mt-0.5 leading-relaxed">
            Displays genuine dimensions, byte size, aspect ratios, and MIME attributes. Note that modern browsers strip proprietary camera EXIF tags during upload to protect geolocation privacy.
          </p>
        </div>
      </div>

      {!meta ? (
        <FileUploadDropzone
          accept="image/*"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Upload an image to inspect technical attributes"
          subtitle="Inspect pixel resolution, aspect ratios, exact sizes, and MIME headers • Free up to 1024MB (1GB)"
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg border" />
              )}
              <div>
                <p className="font-semibold text-sm text-light-text dark:text-dark-text">{meta.name}</p>
                <p className="text-xs text-light-muted dark:text-dark-muted">
                  {meta.width} × {meta.height} px • {formatFileSize(meta.sizeBytes)}
                </p>
              </div>
            </div>

            <button
              onClick={resetAll}
              className="flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted hover:text-light-text"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Inspect another
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
              <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Resolution</span>
              <p className="text-base font-bold text-light-text dark:text-dark-text mt-1">
                {meta.width} × {meta.height} px
              </p>
            </div>

            <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
              <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Aspect Ratio</span>
              <p className="text-base font-bold text-light-text dark:text-dark-text mt-1">{meta.aspectRatio}</p>
            </div>

            <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
              <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Megapixels</span>
              <p className="text-base font-bold text-light-text dark:text-dark-text mt-1">{meta.megapixels} MP</p>
            </div>

            <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
              <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Exact File Size</span>
              <p className="text-base font-bold text-light-text dark:text-dark-text mt-1">
                {formatFileSize(meta.sizeBytes)} ({meta.sizeBytes.toLocaleString()} bytes)
              </p>
            </div>

            <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
              <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">MIME Type</span>
              <p className="text-base font-bold font-mono text-light-text dark:text-dark-text mt-1">{meta.type}</p>
            </div>

            <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
              <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Last Modified</span>
              <p className="text-xs font-medium text-light-text dark:text-dark-text mt-1.5">
                {new Date(meta.lastModified).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
