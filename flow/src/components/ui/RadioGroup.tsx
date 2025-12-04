'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { Info } from 'lucide-react';

interface RadioGroupContextValue {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  label?: string;
  labelId?: string;
  className?: string;
}

function RadioGroup({
  name,
  value,
  onChange,
  children,
  label,
  labelId,
  className = '',
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ name, value, onChange }}>
      <div role="radiogroup" aria-label={label} className={className}>
        {label && (
          <h4 id={labelId} className="text-[22px] font-bold text-[var(--color-darkest)] mb-4">
            {label}
          </h4>
        )}
        {/* Practical UI: S=16px spacing between options */}
        <div className="space-y-4">{children}</div>
      </div>
    </RadioGroupContext.Provider>
  );
}

interface RadioOptionProps {
  value: string;
  children: ReactNode;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'cheapest';
  badgeReason?: string;
  className?: string;
}

function RadioOption({
  value,
  children,
  badge,
  badgeVariant = 'default',
  badgeReason,
  className = '',
}: RadioOptionProps) {
  const context = useContext(RadioGroupContext);
  const [showTooltip, setShowTooltip] = useState(false);

  if (!context) {
    throw new Error('RadioOption must be used within a RadioGroup');
  }

  const { name, value: selectedValue, onChange } = context;
  const isSelected = value === selectedValue;

  // Header banner styles - full width colored banner like reference design
  // Uses brand colors: Coral for best value, Success green for eco, Teal for default
  const bannerStyles = {
    default: 'bg-[var(--color-teal)] text-white',
    success: 'bg-[var(--color-success)] text-white',
    cheapest: 'bg-[var(--color-coral)] text-white',
  };

  // Badge display text
  const badgeText = {
    'BEST FIT': 'Best Fit',
    CHEAPEST: 'Lowest Price!',
    GREEN: '100% Clean Energy!',
    RECOMMENDED: 'Recommended',
    POPULAR: 'Popular Choice!',
  };

  return (
    <label
      className={`
        block cursor-pointer
        rounded-xl border-2
        transition-all duration-150
        has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--color-teal)] has-[:focus-visible]:ring-offset-2
        ${
          isSelected
            ? 'border-[var(--color-teal)] bg-white shadow-sm'
            : 'border-[var(--color-light)] hover:border-[var(--color-medium)] bg-white'
        }
        ${className}
      `}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={isSelected}
        onChange={() => onChange(value)}
        className="sr-only peer"
      />

      {/* Header banner for badge - Practical UI: Better padding, readable text */}
      {badge && (
        <div
          className={`
            relative w-full px-4 py-2 text-center rounded-t-lg
            text-[14px] font-bold tracking-wide
            ${bannerStyles[badgeVariant]}
          `}
        >
          <span>{badgeText[badge as keyof typeof badgeText] || badge}</span>
          {badgeReason && (
            <button
              type="button"
              className="inline-flex items-center ml-2 align-middle p-3 -m-3 min-h-[44px]"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowTooltip(!showTooltip);
              }}
              aria-label="More info"
            >
              <Info className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          {/* Tooltip - positioned BELOW banner but OUTSIDE card overflow */}
          {showTooltip && badgeReason && (
            <div
              role="tooltip"
              className="absolute left-4 right-4 top-full mt-1 z-[100] p-3 bg-[var(--color-darkest)] text-white text-[16px] font-normal text-left rounded-lg shadow-xl leading-snug"
            >
              <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[var(--color-darkest)] rotate-45" />
              <p className="relative z-10">{badgeReason}</p>
            </div>
          )}
        </div>
      )}

      {/* Main content area - Practical UI: M=24px padding, S=16px gaps */}
      <div className="p-4 sm:p-5 flex items-start gap-4">
        {/* Radio circle - Practical UI: 24px for better touch target */}
        <div
          className={`
            flex-shrink-0 w-6 h-6 mt-0.5
            rounded-full border-2
            flex items-center justify-center
            transition-colors duration-150
            ${
              isSelected
                ? 'border-[var(--color-teal)]'
                : 'border-[var(--color-dark)]'
            }
          `}
        >
          {isSelected && (
            <div className="w-3 h-3 rounded-full bg-[var(--color-teal)]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </label>
  );
}

export { RadioGroup, RadioOption };
export type { RadioGroupProps, RadioOptionProps };
