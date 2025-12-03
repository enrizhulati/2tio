'use client';

import { useCallback, type ChangeEvent, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, Check } from 'lucide-react';
import type { UploadedDocument } from '@/types/flow';

interface FileUploadProps {
  label: string;
  hint?: string;
  requirement?: string;
  accept?: string;
  maxSizeMB?: number;
  document?: UploadedDocument;
  onUpload: (file: File) => void;
  onRemove: () => void;
  error?: string;
}

function FileUpload({
  label,
  hint,
  requirement,
  accept = '.jpg,.jpeg,.png,.pdf',
  maxSizeMB = 10,
  document,
  onUpload,
  onRemove,
  error,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          // Error handling would go here
          return;
        }
        onUpload(file);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [onUpload, maxSizeMB]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {/* Card container - Practical UI: 3:1 contrast for borders */}
      <div className="p-4 rounded-xl border-2 border-[var(--color-border)] bg-white">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-lg bg-[var(--color-lightest)]">
            <FileText className="w-5 h-5 text-[var(--color-dark)]" />
          </div>
          <div className="flex-1">
            <h4 className="text-[18px] font-semibold text-[var(--color-darkest)]">
              {label}
            </h4>
            {requirement && (
              <p className="text-[14px] text-[var(--color-dark)] mt-1">
                {requirement}
              </p>
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 text-[var(--color-error)] text-[14px] mb-3 p-2 rounded-lg bg-[var(--color-error-light)]">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload states */}
        {!document ? (
          // Empty state - upload button
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="
              w-full p-6
              border-2 border-dashed border-[var(--color-medium)] rounded-lg
              flex flex-col items-center justify-center gap-2
              text-[var(--color-dark)]
              hover:border-[var(--color-teal)] hover:bg-[var(--color-teal-light)]
              hover:text-[var(--color-teal)]
              transition-all duration-150
              cursor-pointer
            "
          >
            <Upload className="w-6 h-6" />
            <span className="text-[16px] font-medium">Take photo or upload file</span>
          </button>
        ) : document.status === 'uploading' ? (
          // Uploading state
          <div className="p-4 rounded-lg bg-[var(--color-lightest)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] text-[var(--color-darkest)] truncate flex-1 mr-4">
                {document.name}
              </span>
              <button
                type="button"
                onClick={onRemove}
                className="text-[var(--color-dark)] hover:text-[var(--color-error)] transition-colors underline"
              >
                Cancel
              </button>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-light)] overflow-hidden">
              <div
                className="h-full bg-[var(--color-teal)] transition-all duration-200"
                style={{ width: `${document.progress || 0}%` }}
              />
            </div>
            <span className="text-[14px] text-[var(--color-dark)] mt-1 block">
              {document.progress}%
            </span>
          </div>
        ) : document.status === 'uploaded' ? (
          // Uploaded state
          <div className="p-4 rounded-lg bg-[var(--color-success-light)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-[var(--color-success)]" />
              <div>
                <span className="text-[14px] text-[var(--color-darkest)] font-medium block">
                  {document.name}
                </span>
                <span className="text-[14px] text-[var(--color-dark)]">
                  {formatFileSize(document.size)} • Uploaded
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="
                min-w-12 min-h-12 p-3 rounded-lg
                flex items-center justify-center
                text-[var(--color-dark)] hover:text-[var(--color-error)]
                hover:bg-[var(--color-error-light)]
                transition-all duration-150
              "
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          // Error state for upload
          <div className="p-4 rounded-lg bg-[var(--color-error-light)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--color-error)]" />
              <span className="text-[14px] text-[var(--color-error)]">
                {document.errorMessage || 'Upload failed'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-[14px] text-[var(--color-teal)] font-medium underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Hint */}
        {hint && !document && (
          <p className="text-[14px] text-[var(--color-dark)] mt-3">{hint}</p>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="sr-only"
        aria-label={label}
      />
    </div>
  );
}

export { FileUpload };
export type { FileUploadProps };
