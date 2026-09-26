import React, { useState } from 'react';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { CheckCircle2, XCircle, Copy, Check, FileCheck, Loader2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const ChecksumVerifierTool: React.FC = () => {
  const { addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [computedHash, setComputedHash] = useState<string>('');
  const [expectedHash, setExpectedHash] = useState<string>('');
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setIsComputing(true);
    setComputedHash('');

    try {
      const buffer = await selected.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setComputedHash(hex);
      addToast({
        type: 'success',
        title: 'Checksum Generated',
        message: 'SHA-256 digest computed successfully.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not calculate file checksum.',
      });
    } finally {
      setIsComputing(false);
    }
  };

  const cleanComputed = computedHash.trim().toLowerCase();
  const cleanExpected = expectedHash.trim().toLowerCase();
  const isMatch = cleanComputed && cleanExpected && cleanComputed === cleanExpected;
  const isMismatch = cleanComputed && cleanExpected && cleanComputed !== cleanExpected;

  const copyHash = () => {
    if (!computedHash) return;
    navigator.clipboard.writeText(computedHash);
    setCopied(true);
    addToast({
      type: 'success',
      message: 'SHA-256 Checksum copied!',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* File Upload */}
      <FileUploadDropzone
        multiple={false}
        onFilesSelected={handleFileSelected}
        title="Upload any file to compute SHA-256 checksum"
        subtitle="Computed locally on your device via Web Crypto API"
      />

      {file && (
        <div className="space-y-6">
          {/* File summary */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              <FileCheck className="w-5 h-5 text-brand-purple" />
              <div>
                <p className="font-semibold text-sm text-light-text dark:text-dark-text">{file.name}</p>
                <p className="text-xs text-light-muted dark:text-dark-muted">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            {isComputing && (
              <div className="flex items-center gap-1.5 text-xs text-brand-purple font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Computing...</span>
              </div>
            )}
          </div>

          {/* Computed Checksum Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
                Calculated SHA-256 Hash
              </label>
              <button
                onClick={copyHash}
                disabled={!computedHash}
                className="text-xs text-brand-purple hover:underline flex items-center gap-1 disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border font-mono text-xs text-light-text dark:text-dark-text break-all select-all">
              {computedHash || (isComputing ? 'Calculating SHA-256 digest...' : 'Waiting for file...')}
            </div>
          </div>

          {/* Expected Checksum Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
              Paste Expected Checksum to Verify
            </label>
            <input
              type="text"
              value={expectedHash}
              onChange={(e) => setExpectedHash(e.target.value)}
              placeholder="e.g. e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
              className="w-full px-4 py-2.5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border font-mono text-xs text-light-text dark:text-dark-text focus:border-brand-purple focus:outline-none"
            />
          </div>

          {/* Verification Result Banner */}
          {isMatch && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold text-sm">Checksum Verified Match</p>
                <p className="text-xs mt-0.5">The file matches the expected SHA-256 checksum exactly. Integrity intact.</p>
              </div>
            </div>
          )}

          {isMismatch && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-3">
              <XCircle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold text-sm">Checksum Mismatch</p>
                <p className="text-xs mt-0.5">The calculated hash does not match the expected hash. The file may be altered or incomplete.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
