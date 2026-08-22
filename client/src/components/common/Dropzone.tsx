import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { formatFileSize } from '../../utils/formatters';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  isLoading?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileSelect,
  accept = 'image/jpeg,image/png,image/webp,application/pdf,text/plain,text/csv',
  maxSizeMB = 10,
  isLoading = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds limit of ${maxSizeMB}MB`);
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onClick={() => !isLoading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
          isDragOver
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-gray-700 hover:border-indigo-500/60 bg-gray-900/40 hover:bg-gray-900/80',
          isLoading && 'opacity-60 pointer-events-none'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
            <p className="text-xs text-gray-400 mt-1">{formatFileSize(selectedFile.size)}</p>
            <span className="mt-3 text-xs text-indigo-400 hover:underline">Click or drop another file to replace</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-base font-medium text-white">Drag & drop your receipt or statement here</p>
            <p className="text-xs text-gray-400 mt-1">Supports PNG, JPG, WEBP, PDF, TXT, CSV up to {maxSizeMB}MB</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
              <FileText className="w-3.5 h-3.5" />
              <span>AI OCR will auto-extract totals, date, and line items</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
