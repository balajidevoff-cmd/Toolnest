import React, { useState } from 'react';
import jsQR from 'jsqr';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { Copy, Check, ExternalLink, RefreshCw, AlertTriangle, Scan, CheckCircle2 } from 'lucide-react';

export const QrReaderTool: React.FC = () => {
  const { addToast } = useApp();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [decodedData, setDecodedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    setDecodedData(null);

    const file = files[0];
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

    const img = new Image();
    img.src = preview;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context unavailable');

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          setDecodedData(code.data);
          addToast({
            type: 'success',
            title: 'QR Code Decoded',
            message: 'Successfully extracted QR data!',
          });
        } else {
          setError('No readable QR code found in this image. Ensure the code is clear, unblurred, and has sufficient contrast.');
        }
      } catch {
        setError('An error occurred while analyzing the image.');
      }
    };
  };

  const copyToClipboard = () => {
    if (!decodedData) return;
    navigator.clipboard.writeText(decodedData);
    setCopied(true);
    addToast({
      type: 'success',
      message: 'Decoded data copied to clipboard!',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const isUrl = (str: string) => {
    try {
      const parsed = new URL(str);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const resetAll = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setDecodedData(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {!imagePreview ? (
        <FileUploadDropzone
          accept="image/*"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Upload an image containing a QR code"
          subtitle="Decoded 100% locally in browser without automatic URL navigation • Free up to 1024MB (1GB)"
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              <img src={imagePreview} alt="QR image" className="w-12 h-12 object-cover rounded-lg border" />
              <span className="text-xs font-semibold text-light-text dark:text-dark-text">Analyzing Image</span>
            </div>

            <button
              onClick={resetAll}
              className="flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted hover:text-light-text"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Test different image
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Detection Notice</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {decodedData && (
            <div className="space-y-4 p-5 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Decoded Content
                </span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>

              {/* Decoded content display */}
              <div className="p-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] font-mono text-sm text-light-text dark:text-dark-text break-all select-all">
                {decodedData}
              </div>

              {/* Security check: If URL, show safe external link with warning */}
              {isUrl(decodedData) && (
                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-purple dark:text-brand-accentLight">
                    <Scan className="w-4 h-4" />
                    <span>Safe Link Verification</span>
                  </div>
                  <p className="text-xs text-light-muted dark:text-dark-muted">
                    This QR code points to an external destination. You can safely open it in a new tab if you trust the source:
                  </p>
                  <a
                    href={decodedData}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-accent text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <span>Visit Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
