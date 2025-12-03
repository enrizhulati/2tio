'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = '', id, checked, ...props }, ref) => {
    const inputId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;

    // Practical UI: Checkboxes need clear visual feedback and sufficient touch targets
    return (
      <label
        htmlFor={inputId}
        className={`
          flex items-start gap-3 cursor-pointer
          group min-h-[48px] py-1
          ${className}
        `}
      >
        {/* Custom checkbox - Practical UI: Minimum 24px for checkboxes */}
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`
              w-6 h-6 rounded border-2
              flex items-center justify-center
              transition-all duration-150
              peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[var(--color-teal)]
              ${
                checked
                  ? 'bg-[var(--color-teal)] border-[var(--color-teal)]'
                  : 'bg-white border-[var(--color-dark)] group-hover:border-[var(--color-darkest)]'
              }
            `}
          >
            {checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
          </div>
        </div>

        {/* Label and description */}
        <div className="flex-1">
          <span className="text-[var(--color-darkest)] text-[18px] leading-snug">{label}</span>
          {description && (
            <p className="text-[var(--color-dark)] text-[16px] mt-1">{description}</p>
          )}
        </div>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
export type { CheckboxProps };
