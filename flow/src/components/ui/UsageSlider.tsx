'use client';

import { useState, useCallback, useEffect } from 'react';
import { Home, Building2, Castle } from 'lucide-react';

interface UsageSliderProps {
  /** Current monthly kWh value */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Whether we have real home data (vs default) */
  hasHomeData?: boolean;
  /** Loading state while recalculating */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// Usage presets with icons and descriptions
const PRESETS = [
  { value: 600, label: 'Small', description: 'Apartment or small home', icon: Building2 },
  { value: 1000, label: 'Medium', description: 'Average home', icon: Home },
  { value: 1500, label: 'Large', description: 'Large home', icon: Castle },
];

const MIN_USAGE = 400;
const MAX_USAGE = 2500;
const STEP = 50;

/**
 * UsageSlider - Allows users to adjust their estimated monthly electricity usage
 *
 * Practical UI principles applied:
 * - Clear label and current value display
 * - 48pt minimum touch targets on preset buttons
 * - Immediate visual feedback
 * - Accessible with keyboard navigation
 */
export type { UsageSliderProps };

export function UsageSlider({
  value,
  onChange,
  hasHomeData = false,
  isLoading = false,
  className = '',
}: UsageSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  // Sync local value with prop
  useEffect(() => {
    if (!isDragging) {
      setLocalValue(value);
    }
  }, [value, isDragging]);

  // Debounce the onChange callback to avoid too many API calls
  const handleChange = useCallback((newValue: number) => {
    setLocalValue(newValue);
  }, []);

  // Commit the change when user stops dragging
  const handleChangeEnd = useCallback(() => {
    setIsDragging(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  }, [localValue, value, onChange]);

  // Handle preset button click
  const handlePresetClick = useCallback((presetValue: number) => {
    setLocalValue(presetValue);
    onChange(presetValue);
  }, [onChange]);

  // Calculate slider position percentage
  const percentage = ((localValue - MIN_USAGE) / (MAX_USAGE - MIN_USAGE)) * 100;

  // Find closest preset for highlighting
  const closestPreset = PRESETS.reduce((prev, curr) =>
    Math.abs(curr.value - localValue) < Math.abs(prev.value - localValue) ? curr : prev
  );

  return (
    <div className={`bg-[var(--color-lightest)] rounded-xl p-4 sm:p-5 ${className}`}>
      {/* Header with current value - Practical UI: Clear hierarchy */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[16px] font-semibold text-[var(--color-darkest)]">
            Adjust your usage estimate
          </p>
          <p className="text-[14px] text-[var(--color-dark)] mt-0.5">
            {hasHomeData
              ? 'Based on similar properties. Adjust if needed.'
              : 'We\'ll use this to rank plans for you.'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[28px] font-bold text-[var(--color-coral)] tabular-nums">
            {localValue.toLocaleString()}
          </p>
          <p className="text-[14px] text-[var(--color-dark)]">kWh/month</p>
        </div>
      </div>

      {/* Preset buttons - Practical UI: 48pt touch targets, clear labels */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isActive = closestPreset.value === preset.value &&
            Math.abs(localValue - preset.value) < 150;

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
              <span className="text-[14px] font-semibold">{preset.label}</span>
              <span className={`text-[12px] ${isActive ? 'text-white/80' : 'text-[var(--color-dark)]'}`}>
                ~{preset.value.toLocaleString()} kWh
              </span>
            </button>
          );
        })}
      </div>

      {/* Slider - Practical UI: Accessible, visual feedback */}
      <div className="relative">
        {/* Track background */}
        <div className="h-2 bg-[var(--color-light)] rounded-full">
          {/* Filled portion */}
          <div
            className="h-full bg-[var(--color-teal)] rounded-full transition-all duration-100"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Range input - styled but accessible */}
        <input
          type="range"
          min={MIN_USAGE}
          max={MAX_USAGE}
          step={STEP}
          value={localValue}
          onChange={(e) => {
            setIsDragging(true);
            handleChange(Number(e.target.value));
          }}
          onMouseUp={handleChangeEnd}
          onTouchEnd={handleChangeEnd}
          onKeyUp={handleChangeEnd}
          disabled={isLoading}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Monthly electricity usage in kWh"
          aria-valuemin={MIN_USAGE}
          aria-valuemax={MAX_USAGE}
          aria-valuenow={localValue}
          aria-valuetext={`${localValue} kilowatt hours per month`}
        />

        {/* Custom thumb indicator */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 w-5 h-5
            bg-white border-2 border-[var(--color-teal)] rounded-full
            shadow-md pointer-events-none transition-all duration-100
            ${isDragging ? 'scale-110 shadow-lg' : ''}
          `}
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between mt-2 text-[12px] text-[var(--color-medium)]">
        <span>{MIN_USAGE.toLocaleString()} kWh</span>
        <span>{MAX_USAGE.toLocaleString()} kWh</span>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-3 flex items-center justify-center gap-2 text-[14px] text-[var(--color-teal)]">
          <div className="w-4 h-4 border-2 border-[var(--color-teal)] border-t-transparent rounded-full animate-spin" />
          <span>Updating plan estimates...</span>
        </div>
      )}
    </div>
  );
}

export default UsageSlider;
