'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Home, Building2, Building, Castle, Info } from 'lucide-react';
import type { DwellingType } from '@/types/flow';
import { DWELLING_ENERGY_DEFAULTS } from '@/types/flow';

interface UsageSliderProps {
  /** Current monthly kWh value */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Original estimate from home data (for reset functionality) */
  originalEstimate?: number;
  /** Whether we have real home data (vs default) */
  hasHomeData?: boolean;
  /** Dwelling type for smart defaults (replaces isApartment) */
  dwellingType?: DwellingType;
  /** @deprecated Use dwellingType instead */
  isApartment?: boolean;
  /** Loading state while recalculating */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// Usage presets with icons and descriptions - aligned with dwelling types
const PRESETS = [
  { value: 750, label: 'Apartment', description: '~750 kWh', icon: Building2, dwellingTypes: ['apartment'] as DwellingType[] },
  { value: 1200, label: 'Mid-size', description: '~1,200 kWh', icon: Building, dwellingTypes: ['townhouse', 'multi_unit'] as DwellingType[] },
  { value: 2000, label: 'House', description: '~2,000 kWh', icon: Home, dwellingTypes: ['single_family'] as DwellingType[] },
];

const BASE_MIN = 400;
const BASE_MAX = 5000;
const STEP = 100;
const DEFAULT_USAGE = 1200; // Default when dwelling unknown

// Helper to get human-readable dwelling label
function getDwellingLabel(dwelling: Exclude<DwellingType, null>): string {
  switch (dwelling) {
    case 'apartment': return 'apartment';
    case 'townhouse': return 'townhouse';
    case 'multi_unit': return 'duplex';
    case 'single_family': return 'house';
    default: return 'home';
  }
}

export type { UsageSliderProps };

export function UsageSlider({
  value,
  onChange,
  originalEstimate,
  hasHomeData = false,
  dwellingType,
  isApartment = false, // Deprecated - use dwellingType
  isLoading = false,
  className = '',
}: UsageSliderProps) {
  // Normalize dwelling type (support legacy isApartment prop)
  const effectiveDwellingType: DwellingType = dwellingType ?? (isApartment ? 'apartment' : null);

  // Dynamic range - extends to accommodate any incoming value
  const { minUsage, maxUsage } = useMemo(() => {
    const min = BASE_MIN;
    // Max extends if incoming value is higher (rounded up to nearest 1000)
    const max = Math.max(BASE_MAX, Math.ceil(value / 1000) * 1000 + 1000);
    return { minUsage: min, maxUsage: max };
  }, [value]);

  const [localValue, setLocalValue] = useState(value);

  // Sync local value with prop
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Auto-select dwelling-based default on first render (when no real home data)
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  useEffect(() => {
    if (effectiveDwellingType && !hasAutoSelected && !hasHomeData) {
      const dwellingDefault = DWELLING_ENERGY_DEFAULTS[effectiveDwellingType];
      setLocalValue(dwellingDefault);
      onChange(dwellingDefault);
      setHasAutoSelected(true);
    }
  }, [effectiveDwellingType, hasAutoSelected, hasHomeData, onChange]);

  // Handle preset button click
  const handlePresetClick = useCallback((presetValue: number) => {
    console.log('[UsageSlider] Preset clicked:', presetValue);
    setLocalValue(presetValue);
    onChange(presetValue);
  }, [onChange]);

  // Determine reset target: always use original estimate if available
  const resetTarget = originalEstimate || DEFAULT_USAGE;
  const resetLabel = hasHomeData
    ? `Reset to home estimate (${resetTarget.toLocaleString()} kWh/mo)`
    : `Reset to initial estimate (${resetTarget.toLocaleString()} kWh/mo)`;

  // Handle reset to original estimate or default
  const handleReset = useCallback(() => {
    setLocalValue(resetTarget);
    onChange(resetTarget);
  }, [resetTarget, onChange]);

  // Show reset option when user has deviated from reset target
  const showResetOption = Math.abs(localValue - resetTarget) > 50;

  // Handle slider change
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setLocalValue(newValue);
  }, []);

  // Commit value on mouse/touch up
  const handleCommit = useCallback(() => {
    console.log('[UsageSlider] handleCommit called, localValue:', localValue, 'value:', value);
    if (localValue !== value) {
      console.log('[UsageSlider] Values differ, calling onChange with:', localValue);
      onChange(localValue);
    } else {
      console.log('[UsageSlider] Values are equal, skipping onChange');
    }
  }, [localValue, value, onChange]);

  // Calculate slider position percentage
  const percentage = Math.min(100, Math.max(0, ((localValue - minUsage) / (maxUsage - minUsage)) * 100));

  // Find closest preset for highlighting
  const closestPreset = PRESETS.reduce((prev, curr) =>
    Math.abs(curr.value - localValue) < Math.abs(prev.value - localValue) ? curr : prev
  );

  return (
    <div className={`bg-[var(--color-lightest)] rounded-xl p-4 sm:p-5 ${className}`}>
      {/* Header with current value - Practical UI: 18px+ headings, 16px body */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[18px] font-semibold text-[var(--color-darkest)]">
              Does this look right?
            </p>
            <div className="relative group">
              <Info className="w-4 h-4 text-[var(--color-medium)] cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-[var(--color-darkest)] text-white text-[14px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 shadow-lg pointer-events-none leading-relaxed">
                {hasHomeData
                  ? 'We estimated your usage based on your home\'s size, age, and similar properties in your area.'
                  : 'We\'ll use this estimate to find plans that best match your needs.'}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[var(--color-darkest)]" />
              </div>
            </div>
          </div>
          <p className="text-[16px] text-[var(--color-dark)] mt-1">
            {effectiveDwellingType && !hasHomeData
              ? `Based on typical ${getDwellingLabel(effectiveDwellingType)} usage. Adjust if needed.`
              : hasHomeData
                ? 'We estimated this for you. Only adjust if it seems off.'
                : 'Select your typical monthly usage to rank plans.'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[28px] font-bold text-[var(--color-coral)] tabular-nums">
            {localValue.toLocaleString()}
          </p>
          <p className="text-[16px] text-[var(--color-dark)]">kWh/month</p>
        </div>
      </div>

      {/* Preset buttons - Practical UI: 8px gap (XS), 48px+ touch targets */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isActive = closestPreset.value === preset.value &&
            Math.abs(localValue - preset.value) < 400;

          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePresetClick(preset.value)}
              disabled={isLoading}
              className={`
                flex flex-col items-center justify-center p-3 rounded-lg
                min-h-[72px] transition-all duration-150
                ${isActive
                  ? 'bg-[var(--color-teal)] text-white shadow-md'
                  : 'bg-white border border-[var(--color-light)] text-[var(--color-darkest)] hover:border-[var(--color-teal)] hover:bg-[var(--color-teal-light)]'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              aria-pressed={isActive}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-white' : 'text-[var(--color-teal)]'}`} aria-hidden="true" />
              <span className="text-[16px] font-semibold">{preset.label}</span>
              <span className={`text-[14px] ${isActive ? 'text-white/80' : 'text-[var(--color-dark)]'}`}>
                {preset.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slider with visible track and thumb */}
      <div className="relative h-6 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-2 bg-[var(--color-light)] rounded-full">
          {/* Filled portion */}
          <div
            className="h-full bg-[var(--color-teal)] rounded-full transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Custom thumb */}
        <div
          className="absolute w-6 h-6 bg-white border-2 border-[var(--color-teal)] rounded-full shadow-md pointer-events-none z-10"
          style={{ left: `calc(${percentage}% - 12px)` }}
        />

        {/* Actual range input - full height, visible cursor */}
        <input
          type="range"
          min={minUsage}
          max={maxUsage}
          step={STEP}
          value={localValue}
          onChange={handleSliderChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          onKeyUp={handleCommit}
          disabled={isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
          aria-label="Monthly electricity usage in kWh"
          aria-valuemin={minUsage}
          aria-valuemax={maxUsage}
          aria-valuenow={localValue}
        />
      </div>

      {/* Min/Max labels - Practical UI: 14px minimum for legibility */}
      <div className="flex justify-between mt-2 text-[14px] text-[var(--color-medium)]">
        <span>{minUsage.toLocaleString()} kWh</span>
        <span>{maxUsage.toLocaleString()} kWh</span>
      </div>

      {/* Reset link - Practical UI: Tertiary button (underlined text), 16px minimum */}
      {showResetOption && (
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          className="mt-4 flex items-center gap-2 text-[16px] text-[var(--color-teal)] hover:text-[var(--color-teal-hover)] transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span className="underline">{resetLabel}</span>
        </button>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-[16px] text-[var(--color-teal)]">
          <div className="w-4 h-4 border-2 border-[var(--color-teal)] border-t-transparent rounded-full animate-spin" />
          <span>Updating plan estimates...</span>
        </div>
      )}
    </div>
  );
}

export default UsageSlider;
