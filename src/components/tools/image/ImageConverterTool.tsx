import React, { useState } from 'react';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { Download, RefreshCw, Loader2, ArrowRight } from 'lucide-react';

export const ImageConverterTool: React.FC = () => {
  const { addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
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

      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, targetFormat, 0.92));
      if (!blob) throw new Error('Conversion failed');

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setConvertedSize(blob.size);

      const ext = targetFormat === 'image/jpeg' ? 'JPG' : targetFormat === 'image/png' ? 'PNG' : 'WebP';
      addToast({
        type: 'success',
        title: 'Conversion Complete',
        message: `Converted to ${ext} successfully!`,
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

  const getExt = (mime: string) => {
    if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
    if (mime.includes('png')) return 'png';
    if (mime.includes('webp')) return 'webp';
    return 'img';
  };

  return (
    <div className="space-y-6">
      {!imageSrc ? (
        <FileUploadDropzone
          accept="image/png,image/jpeg,image/webp"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Upload an image to convert format"
          subtitle="Convert between PNG, JPEG, and modern WebP formats"
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
                <p className="text-xs text-light-muted dark:text-dark-muted uppercase font-mono">
                  Current format: {file?.type ? file.type.replace('image/', '') : 'image'} •{' '}
                  {file ? (file.size / 1024).toFixed(1) : ''} KB
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

          {/* Format selection */}
          <div className="p-5 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-light-border dark:border-dark-border space-y-3">
            <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
              Select Target Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'image/png', label: 'PNG', desc: 'Lossless quality, transparent backgrounds' },
                { id: 'image/jpeg', label: 'JPEG', desc: 'Widely compatible photographic format' },
                { id: 'image/webp', label: 'WebP', desc: 'Modern web format with superior compression' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setTargetFormat(fmt.id as typeof targetFormat)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    targetFormat === fmt.id
                      ? 'bg-brand-purple/10 border-brand-purple text-brand-purple dark:text-brand-accentLight'
                      : 'border-light-border dark:border-dark-border hover:border-brand-purple/40'
                  }`}
                >
                  <p className="font-bold text-sm text-light-text dark:text-dark-text">{fmt.label}</p>
                  <p className="text-[11px] text-light-muted dark:text-dark-muted mt-0.5">{fmt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-accent disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <span>Convert Format</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download={`converted-${file?.name.replace(/\.[^/.]+$/, '')}.${getExt(targetFormat)}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>
                  Download as {getExt(targetFormat).toUpperCase()} (
                  {convertedSize ? (convertedSize / 1024).toFixed(1) : ''} KB)
                </span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
