'use client';

import { Home, Building, Building2, Castle } from 'lucide-react';
import type { DwellingType } from '@/types/flow';

interface DwellingOption {
  type: Exclude<DwellingType, null>;
  icon: typeof Home;
  label: string;
  description: string;
}

const DWELLING_OPTIONS: DwellingOption[] = [
  {
    type: 'single_family',
    icon: Home,
    label: 'House',
    description: 'Single-family home',
  },
  {
    type: 'townhouse',
    icon: Building,
    label: 'Townhouse',
    description: 'Attached home',
  },
  {
    type: 'multi_unit',
    icon: Castle,
    label: 'Duplex/Fourplex',
    description: '2-4 units',
  },
  {
    type: 'apartment',
    icon: Building2,
    label: 'Apartment',
    description: 'Large building',
  },
];

interface DwellingTypeSelectorProps {
  value: DwellingType;
  onChange: (type: Exclude<DwellingType, null>) => void;
  className?: string;
}

export function DwellingTypeSelector({
  value,
  onChange,
  className = '',
}: DwellingTypeSelectorProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <p className="text-[18px] font-semibold text-[var(--color-darkest)]">
        What type of home is this?
      </p>

      {/* 2x2 grid on mobile, 4 columns on larger screens - Practical UI: 16px gap (S spacing) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {DWELLING_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.type;

          return (
            <button
              key={option.type}
              type="button"
              onClick={() => onChange(option.type)}
              className={`
                flex flex-col items-center justify-center p-4 rounded-xl
                border-2 transition-all duration-150
                min-h-[100px]
                ${isSelected
                  ? 'border-[var(--color-teal)] bg-[var(--color-teal)]/5 shadow-sm'
                  : 'border-[var(--color-light)] bg-white hover:border-[var(--color-medium)]'
                }
              `}
              aria-pressed={isSelected}
            >
              <Icon
                className={`w-8 h-8 mb-2 ${
                  isSelected ? 'text-[var(--color-teal)]' : 'text-[var(--color-dark)]'
                }`}
                aria-hidden="true"
              />
              <span
                className={`text-[16px] font-semibold ${
                  isSelected ? 'text-[var(--color-teal)]' : 'text-[var(--color-darkest)]'
                }`}
              >
                {option.label}
              </span>
              <span className="text-[16px] text-[var(--color-dark)]">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Ownership question for multi_unit dwellings
interface OwnershipQuestionProps {
  value: 'owner' | 'renter' | null;
  onChange: (status: 'owner' | 'renter') => void;
  className?: string;
}

export function OwnershipQuestion({
  value,
  onChange,
  className = '',
}: OwnershipQuestionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <p className="text-[18px] font-semibold text-[var(--color-darkest)]">
        Are you the owner or renting?
      </p>

      {/* Practical UI: 16px gap (S spacing), 48px+ touch targets */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { value: 'owner' as const, label: 'I own this property' },
          { value: 'renter' as const, label: "I'm renting" },
        ].map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-150
                text-[16px] font-medium min-h-[56px]
                ${isSelected
                  ? 'border-[var(--color-teal)] bg-[var(--color-teal)]/5 text-[var(--color-teal)]'
                  : 'border-[var(--color-light)] bg-white hover:border-[var(--color-medium)] text-[var(--color-darkest)]'
                }
              `}
              aria-pressed={isSelected}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DwellingTypeSelector;
