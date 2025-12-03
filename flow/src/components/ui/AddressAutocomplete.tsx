'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

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

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Extract apartment/unit from formatted address string
// Handles: "Apt 123", "Unit 4B", "#5", "Suite 100", "Ste 200"
function extractApartment(formattedAddress: string): { cleanAddress: string; unit?: string } {
  // Pattern to match apartment indicators followed by unit number
  // Must appear after street address (look for it after a comma or space)
  const aptPattern = /,?\s*(apt\.?|apartment|unit|suite|ste\.?|#)\s*([a-z0-9-]+)/i;

  const match = formattedAddress.match(aptPattern);
  if (match) {
    const unit = match[2];
    const cleanAddress = formattedAddress.replace(match[0], '').trim();
    return { cleanAddress, unit };
  }

  return { cleanAddress: formattedAddress };
}

export function AddressAutocomplete({
  onSelect,
  error,
  disabled,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<RadarAddress[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasSelected, setHasSelected] = useState(false);

  const debouncedValue = useDebounce(value, 300);

  // Fetch suggestions from Radar
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Skip fetching if user just selected an address
      if (hasSelected) {
        return;
      }

      if (!debouncedValue || debouncedValue.length < 3) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_RADAR_API_KEY;
      if (!apiKey) {
        console.warn('Radar API key not configured');
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.radar.io/v1/search/autocomplete?query=${encodeURIComponent(
            debouncedValue
          )}&country=US&layers=address`,
          {
            headers: {
              Authorization: apiKey,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.addresses || []);
          setShowDropdown(true);
          setHighlightedIndex(-1);
        }
      } catch (err) {
        console.error('Error fetching address suggestions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedValue, hasSelected]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setHasSelected(false);
    setShowDropdown(true);
  }, []);

  const handleSelect = useCallback(
    (address: RadarAddress) => {
      // Extract apartment/unit from the formatted address (e.g., "Apt 1214")
      const { unit: detectedUnit } = extractApartment(address.formattedAddress);

      const street = address.number && address.street
        ? `${address.number} ${address.street}`
        : address.street || address.addressLabel || '';

      const result: AddressResult = {
        street,
        unit: detectedUnit, // Now captures apartment from formatted address!
        city: address.city || '',
        state: address.stateCode || address.state || '',
        zip: address.postalCode || '',
        formatted: address.formattedAddress,
      };

      onSelect(result);
      setValue(address.formattedAddress);
      setHasSelected(true);
      setSuggestions([]);
      setShowDropdown(false);
    },
    [onSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
    }
  };

  const handleClear = () => {
    setValue('');
    setHasSelected(false);
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      <label className="block text-[14px] font-semibold text-[var(--color-darkest)] tracking-wide">
        Street address
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          disabled={disabled}
          placeholder="Start typing your address..."
          className={`w-full h-14 px-4 text-[16px] text-[var(--color-darkest)] bg-white border-2 rounded-xl transition-colors duration-150 placeholder:text-[var(--color-medium)] focus:outline-none focus:border-[var(--color-teal)] ${error ? 'border-[var(--color-error)] focus:border-[var(--color-error)]' : 'border-[var(--color-light)] hover:border-[var(--color-medium)]'} ${disabled ? 'bg-[var(--color-lightest)] text-[var(--color-medium)] cursor-not-allowed' : ''}`}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />

        {/* Loading or clear button */}
        {(isLoading || value) && !disabled && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-[var(--color-medium)] animate-spin" />
            ) : value ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-[var(--color-medium)] hover:text-[var(--color-dark)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            ) : null}
          </div>
        )}

        {/* Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-2 bg-white border-2 border-[var(--color-light)] rounded-xl shadow-lg overflow-hidden"
            role="listbox"
          >
            {suggestions.map((address, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(address)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`
                  w-full px-4 py-3 text-left
                  transition-colors duration-100
                  ${
                    index === highlightedIndex
                      ? 'bg-[var(--color-teal-light)]'
                      : 'hover:bg-[var(--color-lightest)]'
                  }
                  ${index !== suggestions.length - 1 ? 'border-b border-[var(--color-light)]' : ''}
                `}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                <p className="text-[15px] text-[var(--color-darkest)] font-medium">
                  {address.addressLabel || address.street}
                </p>
                <p className="text-[14px] text-[var(--color-dark)]">
                  {address.city}, {address.stateCode} {address.postalCode}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[14px] text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
}
