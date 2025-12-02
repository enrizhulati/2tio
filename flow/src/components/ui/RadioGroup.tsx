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
  badgeVariant?: 'default' | 'success';
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

  const badgeStyles = {
    default: 'bg-[var(--color-teal-light)] text-[var(--color-teal)]',
    success: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
  };

  return (
    <label
      className={`
        block relative cursor-pointer
        p-4 rounded-lg border-2
        transition-all duration-150
        ${
          isSelected
            ? 'border-[var(--color-teal)] bg-[var(--color-teal-light)]'
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
        className="sr-only"
      />

      <div className="flex items-start gap-3">
        {/* Radio circle */}
        <div
          className={`
            flex-shrink-0 w-5 h-5 mt-0.5
            rounded-full border-2
            flex items-center justify-center
            transition-colors duration-150
            ${
              isSelected
                ? 'border-[var(--color-teal)]'
                : 'border-[var(--color-medium)]'
            }
          `}
        >
          {isSelected && (
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-teal)]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>

        {/* Badge with tooltip */}
        {badge && (
          <div className="relative flex-shrink-0">
            <div
              className={`
                flex items-center gap-1 px-2 py-1
                text-[12px] font-bold uppercase tracking-wide
                rounded cursor-help
                ${badgeStyles[badgeVariant]}
              `}
              onMouseEnter={() => badgeReason && setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (badgeReason) setShowTooltip(!showTooltip);
              }}
            >
              {badge}
              {badgeReason && <Info className="w-3 h-3" />}
            </div>

            {/* Tooltip */}
            {showTooltip && badgeReason && (
              <div className="absolute right-0 top-full mt-2 z-50 w-64 p-3 bg-[var(--color-darkest)] text-white text-[13px] font-normal normal-case tracking-normal rounded-lg shadow-lg">
                <div className="absolute -top-1.5 right-4 w-3 h-3 bg-[var(--color-darkest)] rotate-45" />
                <p className="relative z-10">{badgeReason}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </label>
  );
}

export { RadioGroup, RadioOption };
export type { RadioGroupProps, RadioOptionProps };
