'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Loader2, X, AlertCircle } from 'lucide-react';

export interface AddressResult {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  formatted: string;
  esiid?: string; // ESIID is now available from ERCOT search
}

// ERCOT address format from our API
interface ERCOTAddress {
  address: string;     // e.g., "3031 OLIVER ST APT 1214"
  city: string;        // e.g., "DALLAS"
  state: string;       // e.g., "TX"
  zipCode: string;     // e.g., "75205"
  esiid: string;       // ESIID for this address
  premiseType: string; // "Residential"
  formatted: string;   // Full formatted address
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

// Extract apartment/unit from ERCOT address format
// ERCOT stores apartments in the address field: "3031 OLIVER ST APT 1214"
function parseERCOTAddress(address: string): { street: string; unit?: string } {
  // Pattern to match apartment indicators in ERCOT format
  const aptPattern = /\s+(APT|UNIT|STE|#)\s*([A-Z0-9-]+)$/i;

  const match = address.match(aptPattern);
  if (match) {
    const unit = match[2];
    const street = address.replace(match[0], '').trim();
    return { street, unit };
  }

  return { street: address };
}

// Format street address to title case
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
  const [suggestions, setSuggestions] = useState<ERCOTAddress[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasSelected, setHasSelected] = useState(false);

  const debouncedValue = useDebounce(value, 300);

  // Fetch suggestions from ERCOT via our API
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

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/twotion?action=address-search&query=${encodeURIComponent(debouncedValue)}`
        );

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data || []);
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
    (address: ERCOTAddress) => {
      // Parse the ERCOT address to extract street and unit
      const { street, unit } = parseERCOTAddress(address.address);

      const result: AddressResult = {
        street: toTitleCase(street),
        unit,
        city: toTitleCase(address.city),
        state: address.state,
        zip: address.zipCode,
        formatted: address.formatted,
        esiid: address.esiid, // Include ESIID from search
      };

      onSelect(result);
      setValue(address.formatted);
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

  // Format display address (title case)
  const formatDisplayAddress = (address: ERCOTAddress) => {
    const { street, unit } = parseERCOTAddress(address.address);
    const streetDisplay = toTitleCase(street);
    return unit ? `${streetDisplay}, ${unit}` : streetDisplay;
  };

  // Practical UI: Proper label association with input
  const inputId = 'address-autocomplete-input';
  const listboxId = 'address-suggestions-listbox';

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-[16px] font-semibold text-[var(--color-darkest)] tracking-wide"
      >
        Street address
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          disabled={disabled}
          placeholder="Start typing your address..."
          className={`w-full h-14 px-4 text-[16px] text-[var(--color-darkest)] bg-white border-2 rounded-xl transition-colors duration-150 placeholder:text-[var(--color-medium)] focus:outline-none focus:border-[var(--color-teal)] ${error ? 'border-[var(--color-error)] focus:border-[var(--color-error)]' : 'border-[var(--color-border)] hover:border-[var(--color-dark)]'} ${disabled ? 'bg-[var(--color-lightest)] text-[var(--color-medium)] cursor-not-allowed' : ''}`}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={listboxId}
        />

        {/* Loading or clear button */}
        {(isLoading || value) && !disabled && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-[var(--color-medium)] animate-spin" aria-hidden="true" />
            ) : value ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-[var(--color-medium)] hover:text-[var(--color-dark)] transition-colors"
                aria-label="Clear address"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        )}

        {/* Dropdown - Practical UI: Proper ARIA for listbox */}
        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            id={listboxId}
            className="absolute z-50 w-full mt-2 bg-white border-2 border-[var(--color-light)] rounded-xl shadow-lg overflow-hidden"
            role="listbox"
            aria-label="Address suggestions"
          >
            {suggestions.map((address, index) => (
              <button
                key={`${address.esiid}-${index}`}
                type="button"
                onClick={() => handleSelect(address)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`
                  w-full px-4 py-4 text-left min-h-[56px]
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
                <p className="text-[16px] text-[var(--color-darkest)] font-medium">
                  {formatDisplayAddress(address)}
                </p>
                <p className="text-[16px] text-[var(--color-dark)]">
                  {toTitleCase(address.city)}, {address.state} {address.zipCode}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-[16px] text-[var(--color-error)]" role="alert">
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
