'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      optional = false,
      leftIcon,
      rightIcon,
      className = '',
      id,
      type,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const hasError = !!error;
    const isDateType = type === 'date';

    return (
      <div className="w-full">
        {/* Label - always visible above field */}
        <label
          htmlFor={inputId}
          className="block text-[14px] font-semibold text-[var(--color-darkest)] tracking-wide mb-2"
        >
          {label}
          {props.required && !optional && (
            <span className="text-[var(--color-error)] ml-0.5" aria-hidden="true">*</span>
          )}
          {optional && (
            <span className="text-[var(--color-dark)] font-normal ml-1">
              (optional)
            </span>
          )}
        </label>

        {/* Hint - above field per Practical UI */}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-[var(--color-dark)] text-[14px] mb-2">{hint}</p>
        )}

        {/* Error message - above field per Practical UI */}
        {error && (
          <div id={`${inputId}-error`} className="flex items-center gap-2 text-[var(--color-error)] text-[14px] mb-2" role="alert">
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-medium)]">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`
              w-full h-14 px-4
              text-[16px] text-[var(--color-darkest)]
              bg-white
              border-2 rounded-xl
              transition-colors duration-150
              placeholder:text-[var(--color-medium)]
              focus:outline-none focus:border-[var(--color-teal)]
              disabled:bg-[var(--color-lightest)] disabled:text-[var(--color-medium)] disabled:cursor-not-allowed
              ${leftIcon ? 'pl-12' : ''}
              ${rightIcon ? 'pr-12' : ''}
              ${isDateType ? 'appearance-none cursor-pointer' : ''}
              ${
                hasError
                  ? 'border-[var(--color-error)] focus:border-[var(--color-error)]'
                  : 'border-[var(--color-light)] hover:border-[var(--color-medium)] focus:border-[var(--color-teal)]'
              }
              ${className}
            `}
            aria-invalid={hasError}
            aria-required={props.required}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-medium)]">
              {rightIcon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
