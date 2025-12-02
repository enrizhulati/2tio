'use client';

import { useEffect, useRef, useState } from 'react';

export interface AddressResult {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  formatted: string;
}

interface RadarAddress {
  formattedAddress: string;
  addressLabel: string;
  number?: string;
  street?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  postalCode?: string;
}

interface AddressAutocompleteProps {
  onSelect: (address: AddressResult) => void;
  error?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    Radar?: {
      initialize: (key: string) => void;
      ui: {
        autocomplete: (options: {
          container: string;
          showMarkers?: boolean;
          markerColor?: string;
          responsive?: boolean;
          width?: string;
          maxHeight?: string;
          placeholder?: string;
          limit?: number;
          minCharacters?: number;
          near?: string | null;
          onSelection?: (address: RadarAddress) => void;
        }) => void;
      };
    };
  }
}

export function AddressAutocomplete({
  onSelect,
  error,
  disabled,
}: AddressAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const initializedRef = useRef(false);

  // Load Radar SDK
  useEffect(() => {
    // Check if already loaded
    if (window.Radar) {
      setIsLoaded(true);
      return;
    }

    // Load CSS
    const link = document.createElement('link');
    link.href = 'https://js.radar.com/v4.5.3/radar.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://js.radar.com/v4.5.3/radar.min.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize autocomplete when SDK is loaded
  useEffect(() => {
    if (!isLoaded || !window.Radar || initializedRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_RADAR_API_KEY;
    if (!apiKey) {
      console.warn('Radar API key not configured');
      return;
    }

    window.Radar.initialize(apiKey);

    window.Radar.ui.autocomplete({
      container: 'radar-autocomplete',
      showMarkers: true,
      markerColor: '#20C997', // teal color
      responsive: true,
      width: '100%',
      maxHeight: '400px',
      placeholder: 'Start typing your address...',
      limit: 6,
      minCharacters: 3,
      near: null,
      onSelection: (address: RadarAddress) => {
        const street = address.number && address.street
          ? `${address.number} ${address.street}`
          : address.street || address.addressLabel || '';

        const result: AddressResult = {
          street,
          city: address.city || '',
          state: address.stateCode || address.state || '',
          zip: address.postalCode || '',
          formatted: address.formattedAddress,
        };

        onSelect(result);
      },
    });

    initializedRef.current = true;
  }, [isLoaded, onSelect]);

  return (
    <div className="space-y-2">
      <label className="block text-[14px] font-semibold text-[var(--color-darkest)] tracking-wide">
        Street address
      </label>
      <div
        ref={containerRef}
        id="radar-autocomplete"
        className={`
          radar-autocomplete-wrapper
          ${disabled ? 'opacity-50 pointer-events-none' : ''}
          ${error ? 'radar-error' : ''}
        `}
      />
      {error && (
        <p className="text-[14px] text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
}
