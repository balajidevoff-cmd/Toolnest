import React, { useState, useEffect } from 'react';
import { Copy, Check, Hash, FileCheck, Info, Loader2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { formatFileSize } from '../../../utils/format';

export const Sha256Tool: React.FC = () => {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [inputText, setInputText] = useState('TOVIX everyday utility hub');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hashResult, setHashResult] = useState<string>('');
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute SHA-256 from ArrayBuffer using browser native Web Crypto
  const computeSha256 = async (buffer: ArrayBuffer): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    if (activeTab === 'text') {
      if (!inputText) {
        setHashResult('');
        return;
      }
      const buffer = new TextEncoder().encode(inputText).buffer;
      computeSha256(buffer).then(setHashResult);
    }
  }, [inputText, activeTab]);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setIsHashing(true);

    try {
      const buffer = await file.arrayBuffer();
      const hash = await computeSha256(buffer);
      setHashResult(hash);
      addToast({
        type: 'success',
        title: 'File Hash Computed',
        message: 'SHA-256 digest generated successfully.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Hashing Error',
        message: 'Could not compute hash for this file.',
      });
    } finally {
      setIsHashing(false);
    }
  };

  const copyToClipboard = () => {
    if (!hashResult) return;
    navigator.clipboard.writeText(hashResult);
    setCopied(true);
    addToast({
      type: 'success',
      message: 'Hash copied to clipboard!',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Educational notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Cryptographic One-Way Hash Notice</p>
          <p className="text-light-muted dark:text-dark-muted mt-0.5 leading-relaxed">
            SHA-256 is a deterministic cryptographic hash algorithm designed for data integrity verification and digital signatures. It is a one-way digest, <strong>not encryption</strong>, and cannot be decrypted back to the original content.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activeTab === 'text'
              ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
              : 'border-light-border dark:border-dark-border text-light-muted hover:text-light-text'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          <span>Hash Text</span>
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activeTab === 'file'
              ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
              : 'border-light-border dark:border-dark-border text-light-muted hover:text-light-text'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Hash File</span>
        </button>
      </div>

      {activeTab === 'text' ? (
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
            Input Text
          </label>
          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste text to compute SHA-256 hash..."
            className="w-full p-3.5 rounded-xl font-mono text-xs sm:text-sm bg-black/[0.02] dark:bg-black/20 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:border-brand-purple focus:outline-none resize-none"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <FileUploadDropzone
            multiple={false}
            onFilesSelected={handleFileSelected}
            title="Upload any file to calculate SHA-256 hash"
            subtitle="Processed locally with browser Web Crypto API • Free up to 1024MB (1GB)"
          />

          {selectedFile && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
              <span className="text-xs font-semibold text-light-text dark:text-dark-text truncate">
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </span>
              {isHashing && (
                <div className="flex items-center gap-1.5 text-xs text-brand-purple font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Result Display */}
      <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-purple dark:text-brand-accentLight">
            SHA-256 Hex Digest (256-bit / 64 characters)
          </span>
          <button
            onClick={copyToClipboard}
            disabled={!hashResult}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold disabled:opacity-30"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Hash'}</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border font-mono text-xs sm:text-sm text-light-text dark:text-dark-text break-all select-all">
          {hashResult || 'Waiting for input...'}
        </div>
      </div>
    </div>
  );
};
