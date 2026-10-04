import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { formatFileSize } from '../../../utils/format';
import { Download, RefreshCw, Loader2, ArrowRight, Settings2, Sliders } from 'lucide-react';

export type SupportedFormat =
  | 'image/png'
  | 'image/jpeg'
  | 'image/webp'
  | 'image/bmp'
  | 'image/gif'
  | 'image/x-icon'
  | 'image/svg+xml'
  | 'application/pdf';

interface FormatOption {
  value: SupportedFormat;
  label: string;
  ext: string;
  desc: string;
  badge?: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  { value: 'image/png', label: 'PNG', ext: 'png', desc: 'Lossless with transparency support', badge: 'High Quality' },
  { value: 'image/jpeg', label: 'JPEG / JPG', ext: 'jpg', desc: 'Universal photographic format' },
  { value: 'image/webp', label: 'WebP', ext: 'webp', desc: 'Next-gen compact web standard', badge: 'Modern' },
  { value: 'image/bmp', label: 'BMP', ext: 'bmp', desc: 'Uncompressed Windows Bitmap raster' },
  { value: 'image/gif', label: 'GIF', ext: 'gif', desc: 'Standard graphics interchange format' },
  { value: 'image/x-icon', label: 'ICO (Favicon)', ext: 'ico', desc: 'Website favicon and Windows icon', badge: 'Icons' },
  { value: 'image/svg+xml', label: 'SVG', ext: 'svg', desc: 'Scalable Vector Graphics embedded wrapper' },
  { value: 'application/pdf', label: 'PDF Document', ext: 'pdf', desc: 'Single-page formatted document', badge: 'Document' },
];

export const ImageConverterTool: React.FC = () => {
  const { addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<SupportedFormat>('image/png');
  const [quality, setQuality] = useState<number>(90);
  const [icoSize, setIcoSize] = useState<number>(32);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [convertedSize, setConvertedSize] = useState<number | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setConvertedSize(null);

    const url = URL.createObjectURL(selected);
    setImageSrc(url);
  };

  const canvasToBmpBlob = (canvas: HTMLCanvasElement): Blob => {
    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const rowSize = Math.floor((24 * width + 31) / 32) * 4;
    const pixelArraySize = rowSize * height;
    const fileSize = 54 + pixelArraySize;

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    // File header (14 bytes)
    view.setUint16(0, 0x4D42, false); // 'BM'
    view.setUint32(2, fileSize, true);
    view.setUint32(6, 0, true);
    view.setUint32(10, 54, true);

    // DIB Header (40 bytes)
    view.setUint32(14, 40, true);
    view.setInt32(18, width, true);
    view.setInt32(22, height, true);
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true); // 24-bit BGR
    view.setUint32(30, 0, true);
    view.setUint32(34, pixelArraySize, true);
    view.setInt32(38, 2835, true);
    view.setInt32(42, 2835, true);
    view.setUint32(46, 0, true);
    view.setUint32(50, 0, true);

    let offset = 54;
    for (let y = height - 1; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        view.setUint8(offset++, data[idx + 2]); // B
        view.setUint8(offset++, data[idx + 1]); // G
        view.setUint8(offset++, data[idx]);     // R
      }
      for (let p = 0; p < rowSize - width * 3; p++) {
        view.setUint8(offset++, 0);
      }
    }

    return new Blob([buffer], { type: 'image/bmp' });
  };

  const canvasToIcoBlob = async (canvas: HTMLCanvasElement, targetDim: number): Promise<Blob> => {
    const icoCanvas = document.createElement('canvas');
    icoCanvas.width = targetDim;
    icoCanvas.height = targetDim;
    const ctx = icoCanvas.getContext('2d')!;
    ctx.drawImage(canvas, 0, 0, targetDim, targetDim);

    const pngBlob = await new Promise<Blob | null>((res) => icoCanvas.toBlob(res, 'image/png'));
    if (!pngBlob) throw new Error('Could not create icon');
    const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());

    const icoSize = 6 + 16 + pngBytes.length;
    const buffer = new ArrayBuffer(icoSize);
    const view = new DataView(buffer);

    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true); // type 1 = ICO
    view.setUint16(4, 1, true); // 1 image

    view.setUint8(6, targetDim >= 256 ? 0 : targetDim);
    view.setUint8(7, targetDim >= 256 ? 0 : targetDim);
    view.setUint8(8, 0);
    view.setUint8(9, 0);
    view.setUint16(10, 1, true);
    view.setUint16(12, 32, true);
    view.setUint32(14, pngBytes.length, true);
    view.setUint32(18, 22, true);

    new Uint8Array(buffer, 22).set(pngBytes);
    return new Blob([buffer], { type: 'image/x-icon' });
  };

  const canvasToSvgBlob = (canvas: HTMLCanvasElement): Blob => {
    const dataUrl = canvas.toDataURL('image/png');
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
  <image width="${canvas.width}" height="${canvas.height}" xlink:href="${dataUrl}"/>
</svg>`;
    return new Blob([svgContent], { type: 'image/svg+xml' });
  };

  const canvasToPdfBlob = async (canvas: HTMLCanvasElement): Promise<Blob> => {
    const pdfDoc = await PDFDocument.create();
    const pngBlob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
    if (!pngBlob) throw new Error('PDF conversion failed');
    const pngBytes = await pngBlob.arrayBuffer();
    const img = await pdfDoc.embedPng(pngBytes);
    const page = pdfDoc.addPage([canvas.width, canvas.height]);
    page.drawImage(img, { x: 0, y: 0, width: canvas.width, height: canvas.height });
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  };

  const handleConvert = async () => {
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
      if (!ctx) throw new Error('Canvas initialization failed');

      // For opaque formats without alpha channel (JPEG, BMP), fill white background
      if (targetFormat === 'image/jpeg' || targetFormat === 'image/bmp') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      let blob: Blob | null = null;

      if (targetFormat === 'image/bmp') {
        blob = canvasToBmpBlob(canvas);
      } else if (targetFormat === 'image/x-icon') {
        blob = await canvasToIcoBlob(canvas, icoSize);
      } else if (targetFormat === 'image/svg+xml') {
        blob = canvasToSvgBlob(canvas);
      } else if (targetFormat === 'application/pdf') {
        blob = await canvasToPdfBlob(canvas);
      } else if (targetFormat === 'image/gif') {
        blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/gif'));
      } else {
        blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, targetFormat, quality / 100)
        );
      }

      if (!blob) throw new Error('Conversion failed');

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setConvertedSize(blob.size);

      const matchedOption = FORMAT_OPTIONS.find((f) => f.value === targetFormat);
      const extLabel = matchedOption ? matchedOption.label : 'format';

      addToast({
        type: 'success',
        title: 'Conversion Complete',
        message: `Converted to ${extLabel} successfully!`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Conversion Failed',
        message: 'Could not convert image format.',
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
    setDownloadUrl(null);
    setConvertedSize(null);
  };

  const currentOption = FORMAT_OPTIONS.find((f) => f.value === targetFormat) || FORMAT_OPTIONS[0];

  return (
    <div className="space-y-6">
      {!imageSrc ? (
        <FileUploadDropzone
          accept="image/*"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Upload an image to convert format"
          subtitle="Convert between PNG, JPEG, WebP, BMP, GIF, ICO, SVG, and PDF • Free up to 1024MB (1GB)"
        />
      ) : (
        <div className="space-y-6">
          {/* File Overview Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              <img
                src={imageSrc}
                alt="Source preview"
                className="w-14 h-14 object-cover rounded-lg border border-light-border dark:border-dark-border"
              />
              <div>
                <p className="font-semibold text-sm text-light-text dark:text-dark-text">{file?.name}</p>
                <p className="text-xs text-light-muted dark:text-dark-muted uppercase font-mono">
                  Source format: {file?.type ? file.type.replace('image/', '') : 'image'} •{' '}
                  {file ? formatFileSize(file.size) : ''}
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

          {/* Format Selection Grid */}
          <div className="p-5 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-light-border dark:border-dark-border space-y-4">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-brand-purple" />
              <label className="text-xs font-bold uppercase tracking-wider text-light-text dark:text-dark-text">
                Target Output Format ({FORMAT_OPTIONS.length} Available)
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTargetFormat(opt.value)}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    targetFormat === opt.value
                      ? 'border-brand-purple bg-brand-purple/10 ring-1 ring-brand-purple'
                      : 'border-light-border dark:border-dark-border hover:border-brand-purple/40 bg-white/40 dark:bg-black/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-light-text dark:text-dark-text">{opt.label}</span>
                    {opt.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-purple/15 text-brand-purple font-semibold">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-light-muted dark:text-dark-muted line-clamp-2 leading-relaxed">
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Sub-options for specific formats */}
            {(targetFormat === 'image/jpeg' || targetFormat === 'image/webp') && (
              <div className="pt-2 border-t border-light-border dark:border-dark-border space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-light-text dark:text-dark-text flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-brand-purple" />
                    Compression Quality: {quality}%
                  </span>
                  <span className="text-light-muted dark:text-dark-muted">
                    {quality >= 85 ? 'High Quality' : quality >= 60 ? 'Balanced' : 'Small File'}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                  className="w-full accent-brand-purple cursor-pointer"
                />
              </div>
            )}

            {targetFormat === 'image/x-icon' && (
              <div className="pt-2 border-t border-light-border dark:border-dark-border">
                <label className="block text-xs font-semibold text-light-text dark:text-dark-text mb-2">
                  Favicon Icon Dimensions:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[16, 32, 48, 64, 128, 256].map((dim) => (
                    <button
                      key={dim}
                      type="button"
                      onClick={() => setIcoSize(dim)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        icoSize === dim
                          ? 'bg-brand-purple text-white border-brand-purple'
                          : 'border-light-border dark:border-dark-border text-light-muted hover:text-light-text'
                      }`}
                    >
                      {dim}×{dim} px
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-accent disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <span>Convert to {currentOption.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download={`converted-${file?.name.replace(/\.[^/.]+$/, '')}.${currentOption.ext}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>
                  Download as {currentOption.ext.toUpperCase()} (
                  {convertedSize !== null ? formatFileSize(convertedSize) : ''})
                </span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
