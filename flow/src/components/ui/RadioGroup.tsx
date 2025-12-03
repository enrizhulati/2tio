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
  className?: string;
}

function RadioGroup({
  name,
  value,
  onChange,
  children,
  label,
  className = '',
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ name, value, onChange }}>
      <div role="radiogroup" aria-label={label} className={className}>
        {label && (
          <h4 className="text-[22px] font-semibold text-[var(--color-darkest)] mb-4">
            {label}
          </h4>
        )}
        <div className="space-y-3">{children}</div>
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
  const bannerStyles = {
    default: 'bg-[var(--color-teal)] text-white',
    success: 'bg-[var(--color-success)] text-white',
    cheapest: 'bg-[var(--color-darkest)] text-white',
  };

  // Badge display text
  const badgeText = {
    CHEAPEST: 'Lowest Price!',
    GREEN: '100% Clean Energy!',
    RECOMMENDED: 'Recommended',
    POPULAR: 'Popular Choice!',
  };

  return (
    <label
      className={`
        block relative cursor-pointer
        rounded-lg border-2 overflow-hidden
        transition-all duration-150
        has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--color-teal)] has-[:focus-visible]:ring-offset-2
        ${
          isSelected
            ? 'border-[var(--color-teal)] bg-white'
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

      {/* Header banner for badge - full width like reference */}
      {badge && (
        <div
          className={`
            w-full px-3 py-1.5 text-center
            text-[14px] font-bold
            ${bannerStyles[badgeVariant]}
          `}
          onMouseEnter={() => badgeReason && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (badgeReason) setShowTooltip(!showTooltip);
          }}
        >
          {badgeText[badge as keyof typeof badgeText] || badge}
          {badgeReason && <Info className="w-3.5 h-3.5 inline ml-1 -mt-0.5" aria-hidden="true" />}

          {/* Tooltip */}
          {showTooltip && badgeReason && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-64 p-3 bg-[var(--color-darkest)] text-white text-[14px] font-normal text-left rounded-lg shadow-lg">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--color-darkest)] rotate-45" />
              <p className="relative z-10">{badgeReason}</p>
            </div>
          )}
        </div>
      )}

      {/* Main content area */}
      <div className="p-3 flex items-start gap-3">
        {/* Radio circle - Practical UI: 24px minimum for radio buttons */}
        <div
          className={`
            flex-shrink-0 w-5 h-5 mt-1
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
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-teal)]" />
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
