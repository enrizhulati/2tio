'use client';

import { useEffect, useCallback, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  // Focus trap - keep focus within modal
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Store current active element to restore later
      previousActiveElement.current = document.activeElement as HTMLElement;

      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTabKey);
      document.body.style.overflow = 'hidden';

      // Focus the close button when modal opens
      const closeButton = modalRef.current?.querySelector<HTMLButtonElement>('button[aria-label="Close modal"]');
      closeButton?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = 'unset';

      // Restore focus to previous element when modal closes
      previousActiveElement.current?.focus();
    };
  }, [isOpen, handleEscape, handleTabKey]);

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
        ref={modalRef}
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
            <X className="w-5 h-5 text-[var(--color-dark)]" aria-hidden="true" />
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
