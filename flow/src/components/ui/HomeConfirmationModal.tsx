'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { X, Home, MapPin } from 'lucide-react';
import { Button } from './Button';

// Format number with commas
const formatNumber = (num: number): string => num.toLocaleString();

// Format date for display
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

interface HomeConfirmationModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
  onConfirm: () => Promise<void>;
  onChangeAddress: () => void;
  address: {
    street: string;
    unit?: string;
    city: string;
    state: string;
    zip: string;
  };
  moveInDate: string;
  homeDetails?: {
    foundDetails?: boolean;
    squareFootage?: number;
    yearBuilt?: number;
    annualKwh?: number;
  };
}

// Compact map preview for the modal
function CompactMapPreview() {
  return (
    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[var(--color-lightest)] flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#E8F4F8] to-[#D4E8ED]">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-medium) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-medium) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        {/* Roads */}
        <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-white opacity-60" />
        <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-white opacity-40" />
        {/* Location marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
          <div className="relative">
            <div className="w-6 h-6 bg-[var(--color-coral)] rounded-full flex items-center justify-center shadow-md">
              <MapPin className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            </div>
            <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--color-coral)] rotate-45" />
          </div>
        </div>
        {/* Pulse animation */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-coral)] opacity-20 animate-ping" />
        </div>
      </div>
    </div>
  );
}

// Loading state content
function LoadingContent({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      {/* Pulsing house icon */}
      <div className="relative mb-8">
        {/* Outer pulse ring */}
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-[var(--color-coral)] opacity-20 animate-ping" />
        {/* Icon container with gentle pulse */}
        <div
          className="relative w-20 h-20 rounded-full bg-[var(--color-coral-light)] flex items-center justify-center"
          style={{
            animation: 'gentle-pulse 2s ease-in-out infinite',
          }}
        >
          <Home className="w-10 h-10 text-[var(--color-coral)]" aria-hidden="true" />
        </div>
      </div>

      {/* Loading message with fade animation */}
      <p
        key={message}
        className="text-[18px] text-[var(--color-dark)] text-center animate-fade-in"
      >
        {message}
      </p>
    </div>
  );
}

// Confirmation state content
function ConfirmationContent({
  address,
  moveInDate,
  homeDetails,
  isConfirming,
  onConfirm,
  onChangeAddress,
}: {
  address: HomeConfirmationModalProps['address'];
  moveInDate: string;
  homeDetails?: HomeConfirmationModalProps['homeDetails'];
  isConfirming: boolean;
  onConfirm: () => void;
  onChangeAddress: () => void;
}) {
  return (
    <div className="animate-fade-in">
      {/* Celebration icon */}
      <div className="flex justify-center mb-5">
        <div className="w-16 h-16 rounded-full bg-[var(--color-coral-light)] flex items-center justify-center">
          <Home className="w-8 h-8 text-[var(--color-coral)]" aria-hidden="true" />
        </div>
      </div>

      {/* Heading */}
      <h2
        id="home-confirmation-title"
        className="text-[28px] font-bold text-[var(--color-darkest)] text-center mb-6 leading-tight"
      >
        We found your home!
      </h2>

      {/* Address card */}
      <div className="p-4 rounded-xl border-2 border-[var(--color-light)] bg-[var(--color-lightest)]">
        <div className="flex items-start gap-4">
          {/* Address info */}
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-semibold text-[var(--color-darkest)] leading-snug">
              {address.street}
              {address.unit && `, ${address.unit}`}
            </p>
            <p className="text-[16px] text-[var(--color-dark)]">
              {address.city}, {address.state} {address.zip}
            </p>
            <p className="text-[16px] text-[var(--color-dark)] mt-2">
              Move-in: {formatDate(moveInDate)}
            </p>

            {/* Home details if available */}
            {homeDetails?.foundDetails && (
              <div className="flex items-center gap-1.5 mt-3 text-[16px] text-[var(--color-teal)]">
                <Home className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span className="font-medium">
                  {formatNumber(homeDetails.squareFootage || 0)} sq ft
                  {homeDetails.yearBuilt ? ` • Built ${homeDetails.yearBuilt}` : ''}
                  {homeDetails.annualKwh ? ` • ~${formatNumber(homeDetails.annualKwh)} kWh/yr` : ''}
                </span>
              </div>
            )}
          </div>

          {/* Compact map */}
          <CompactMapPreview />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-4">
        <Button
          data-confirm-button
          onClick={onConfirm}
          disabled={isConfirming}
          isLoading={isConfirming}
          loadingText="Confirming..."
          fullWidth
          size="large"
          colorScheme="coral"
        >
          Yes, this is my home
        </Button>

        <button
          onClick={() => !isConfirming && onChangeAddress()}
          disabled={isConfirming}
          className="w-full text-center text-[var(--color-teal)] text-[16px] font-medium underline hover:text-[var(--color-teal-hover)] transition-colors py-2 disabled:opacity-50"
        >
          No, change address
        </button>
      </div>
    </div>
  );
}

export function HomeConfirmationModal({
  isOpen,
  isLoading = false,
  loadingMessage = 'Finding your address...',
  onConfirm,
  onChangeAddress,
  address,
  moveInDate,
  homeDetails,
}: HomeConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      // Don't allow escape during loading or confirming
      if (e.key === 'Escape' && !isConfirming && !isLoading) {
        onChangeAddress();
      }
    },
    [onChangeAddress, isConfirming, isLoading]
  );

  // Focus trap
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
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTabKey);
      document.body.style.overflow = 'hidden';

      // Focus the primary confirm button (only when not loading)
      if (!isLoading) {
        setTimeout(() => {
          const confirmButton = modalRef.current?.querySelector<HTMLButtonElement>('[data-confirm-button]');
          confirmButton?.focus();
        }, 100);
      }
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = 'unset';
      previousActiveElement.current?.focus();
    };
  }, [isOpen, isLoading, handleEscape, handleTabKey]);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop - non-clickable during loading */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isConfirming && !isLoading && onChangeAddress()}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white shadow-xl animate-slide-up max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby={isLoading ? undefined : "home-confirmation-title"}
        aria-label={isLoading ? loadingMessage : undefined}
      >
        {/* Close button - hidden during loading */}
        {!isLoading && (
          <button
            onClick={() => !isConfirming && onChangeAddress()}
            disabled={isConfirming}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--color-lightest)] transition-colors z-10 disabled:opacity-50"
            aria-label="Close and change address"
          >
            <X className="w-5 h-5 text-[var(--color-dark)]" aria-hidden="true" />
          </button>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-8 sm:py-10">
          {isLoading ? (
            <LoadingContent message={loadingMessage} />
          ) : (
            <ConfirmationContent
              address={address}
              moveInDate={moveInDate}
              homeDetails={homeDetails}
              isConfirming={isConfirming}
              onConfirm={handleConfirm}
              onChangeAddress={onChangeAddress}
            />
          )}
        </div>
      </div>

      {/* Custom keyframe styles */}
      <style jsx>{`
        @keyframes gentle-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }
      `}</style>
    </div>
  );
}
