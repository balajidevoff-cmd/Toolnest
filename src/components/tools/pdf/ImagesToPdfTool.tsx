import React, { useState } from 'react';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { Download, Loader2, Image as ImageIcon, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
}

export const ImagesToPdfTool: React.FC = () => {
  const { addToast } = useApp();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Fit'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setError(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    const validImages = newFiles.filter((f) =>
      ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(f.type) ||
      /\.(jpe?g|png|webp)$/i.test(f.name)
    );

    if (validImages.length < newFiles.length) {
      addToast({
        type: 'warning',
        message: 'Non-image files were skipped.',
      });
    }

    const items: ImageItem[] = validImages.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));

    setImages((prev) => [...prev, ...items]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setImages(updated);
  };

  const convertToPdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const item of images) {
        const arrayBuffer = await item.file.arrayBuffer();
        let pdfImage;

        // Try embedding directly or converting canvas if WebP/other
        try {
          if (item.file.type === 'image/png' || item.name.toLowerCase().endsWith('.png')) {
            pdfImage = await pdfDoc.embedPng(arrayBuffer);
          } else {
            pdfImage = await pdfDoc.embedJpg(arrayBuffer);
          }
        } catch {
          // Fallback: draw through canvas to get clean JPEG bytes for webp or unstandardized jpg
          const imgBitmap = await createImageBitmap(item.file);
          const canvas = document.createElement('canvas');
          canvas.width = imgBitmap.width;
          canvas.height = imgBitmap.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not initialize canvas context');
          ctx.drawImage(imgBitmap, 0, 0);
          const jpgBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
          if (!jpgBlob) throw new Error('Could not convert image format');
          const jpgBuffer = await jpgBlob.arrayBuffer();
          pdfImage = await pdfDoc.embedJpg(jpgBuffer);
        }

        const { width: imgW, height: imgH } = pdfImage;

        if (pageSize === 'Fit') {
          const page = pdfDoc.addPage([imgW, imgH]);
          page.drawImage(pdfImage, { x: 0, y: 0, width: imgW, height: imgH });
        } else {
          let [pageW, pageH] = pageSize === 'A4' ? PageSizes.A4 : PageSizes.Letter;
          if (orientation === 'landscape') {
            const temp = pageW;
            pageW = pageH;
            pageH = temp;
          }

          const page = pdfDoc.addPage([pageW, pageH]);
          // Scale image to fit page with margins
          const margin = 20;
          const maxW = pageW - margin * 2;
          const maxH = pageH - margin * 2;
          const scale = Math.min(maxW / imgW, maxH / imgH, 1);
          const drawW = imgW * scale;
          const drawH = imgH * scale;
          const posX = (pageW - drawW) / 2;
          const posY = (pageH - drawH) / 2;

          page.drawImage(pdfImage, {
            x: posX,
            y: posY,
            width: drawW,
            height: drawH,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      addToast({
        type: 'success',
        title: 'PDF Created',
        message: `Successfully combined ${images.length} image(s) into a PDF!`,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to convert images to PDF.';
      setError(errMsg);
      addToast({
        type: 'error',
        title: 'Conversion Failed',
        message: errMsg,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileUploadDropzone
        accept="image/png,image/jpeg,image/webp"
        multiple={true}
        onFilesSelected={handleFilesSelected}
        title="Upload images to convert to PDF"
        subtitle="Select PNG, JPG, or WebP images"
      />

      {images.length > 0 && (
        <div className="space-y-6">
          {/* Options toolbar */}
          <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">
                Page Size
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as 'A4' | 'Letter' | 'Fit')}
                className="w-full px-3 py-2 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-xs font-medium text-light-text dark:text-dark-text focus:outline-none"
              >
                <option value="A4">A4 (Standard Document)</option>
                <option value="Letter">US Letter</option>
                <option value="Fit">Fit to Image Dimensions</option>
              </select>
            </div>

            {pageSize !== 'Fit' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">
                  Page Orientation
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                      orientation === 'portrait'
                        ? 'bg-brand-purple text-white border-brand-purple'
                        : 'border-light-border dark:border-dark-border text-light-muted hover:text-light-text'
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                      orientation === 'landscape'
                        ? 'bg-brand-purple text-white border-brand-purple'
                        : 'border-light-border dark:border-dark-border text-light-muted hover:text-light-text'
                    }`}
                  >
                    Landscape
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Selected Images List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-light-text dark:text-dark-text uppercase">
                Selected Images ({images.length})
              </span>
              <button
                onClick={() => {
                  images.forEach((i) => URL.revokeObjectURL(i.previewUrl));
                  setImages([]);
                  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
                  setDownloadUrl(null);
                }}
                className="text-xs text-rose-500 hover:underline"
              >
                Remove all
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((item, idx) => (
                <div
                  key={item.id}
                  className="relative group rounded-xl overflow-hidden border border-light-border dark:border-dark-border bg-black/[0.02] dark:bg-white/[0.02] p-2 flex flex-col items-center"
                >
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                  <p className="text-[11px] font-medium text-light-text dark:text-dark-text truncate w-full text-center">
                    {idx + 1}. {item.name}
                  </p>

                  <div className="flex items-center gap-1 mt-2">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveImage(idx, 'up')}
                      className="p-1 rounded bg-black/10 dark:bg-white/10 disabled:opacity-20 text-xs"
                      title="Move earlier"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      disabled={idx === images.length - 1}
                      onClick={() => moveImage(idx, 'down')}
                      className="p-1 rounded bg-black/10 dark:bg-white/10 disabled:opacity-20 text-xs"
                      title="Move later"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeImage(item.id)}
                      className="p-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={convertToPdf}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-accent disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  <span>Create PDF Document</span>
                </>
              )}
            </button>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download="images-document.pdf"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Generated PDF</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
