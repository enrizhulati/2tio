'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - full width on mobile, constrained on desktop */}
      <div
        className={`
          relative w-full ${sizeClasses[size]} bg-white shadow-xl
          animate-slide-up max-h-[95vh] sm:max-h-[90vh] flex flex-col
          rounded-t-2xl sm:rounded-2xl
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header - responsive padding */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[var(--color-light)]">
          <h2 id="modal-title" className="text-[20px] sm:text-[22px] font-bold text-[var(--color-darkest)]">
            {title}
          </h2>
          {/* Close button with 48px touch target */}
          <button
            onClick={onClose}
            className="w-12 h-12 -mr-2 flex items-center justify-center rounded-lg hover:bg-[var(--color-lightest)] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-[var(--color-dark)]" />
          </button>
        </div>

        {/* Content - responsive padding */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export { Modal };
