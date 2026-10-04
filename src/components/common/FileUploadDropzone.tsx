import React, { useRef, useState } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';

interface FileUploadDropzoneProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
}

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({
  accept,
  multiple = false,
  maxSizeMB = 1024,
  onFilesSelected,
  title = 'Click to upload or drag & drop files here',
  subtitle,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndPassFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const filesArray = Array.from(fileList);
    const validFiles: File[] = [];

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (const file of filesArray) {
      if (file.size > maxSizeBytes) {
        const sizeLabel = maxSizeMB >= 1024 ? `${(maxSizeMB / 1024).toFixed(0)}GB` : `${maxSizeMB}MB`;
        setError(`File "${file.name}" exceeds the maximum free limit of ${maxSizeMB}MB (${sizeLabel}).`);
        return;
      }
      validFiles.push(file);
    }

    if (!multiple && validFiles.length > 1) {
      onFilesSelected([validFiles[0]]);
    } else {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndPassFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndPassFiles(e.target.files);
    // Reset file input so same file can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const limitLabel = maxSizeMB >= 1024 ? `${maxSizeMB}MB (${(maxSizeMB / 1024).toFixed(0)}GB)` : `${maxSizeMB}MB`;

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-brand-purple bg-brand-purple/10 scale-[0.99]'
            : 'border-light-border dark:border-dark-border hover:border-brand-purple/50 bg-black/[0.01] dark:bg-white/[0.01] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Upload file"
        />

        <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 text-brand-purple dark:text-brand-accentLight mx-auto flex items-center justify-center mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold mb-2 border border-emerald-500/20">
          <span>✨ 100% Free • Up to {limitLabel}</span>
        </div>

        <p className="text-sm font-semibold text-light-text dark:text-dark-text">
          {title}
        </p>

        <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
          {subtitle || `${accept ? `Supported formats: ${accept}` : 'All files allowed'} • Free up to ${limitLabel}`}
        </p>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
