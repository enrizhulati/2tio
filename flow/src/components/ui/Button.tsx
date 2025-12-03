'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
type ButtonColorScheme = 'teal' | 'coral';
type ButtonSize = 'default' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  colorScheme?: ButtonColorScheme;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      colorScheme = 'teal',
      size = 'default',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-semibold rounded-xl
      transition-all duration-150 ease-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      active:scale-[0.98]
    `;

    // Static variant structural styles (no colors)
    const variantStructuralStyles = {
      primary: 'text-white',
      secondary: 'bg-transparent border-2',
      tertiary: 'bg-transparent underline underline-offset-2',
    };

    const sizeStyles = {
      default: 'h-12 px-6 text-[16px]',
      large: 'h-14 px-8 text-[18px]',
    };

    const widthStyle = fullWidth ? 'w-full' : '';
    // Practical UI: Disabled buttons should have 3:1 contrast minimum
    // Using opacity-50 + specific colors rather than just opacity for better contrast control
    const disabledStyle = isDisabled ? 'cursor-not-allowed' : 'cursor-pointer';

    // Color values based on colorScheme
    const colorValues = {
      teal: {
        main: 'var(--color-teal)',
        hover: 'var(--color-teal-hover)',
        light: 'var(--color-teal-light)',
      },
      coral: {
        main: 'var(--color-coral)',
        hover: 'var(--color-coral-hover)',
        light: 'var(--color-coral-light)',
      },
    };

    const colors = colorValues[colorScheme];

    // Build inline styles for color-dependent properties
    // Practical UI: Disabled buttons need 3:1 contrast minimum + explanation text nearby
    const getInlineStyles = (): CSSProperties => {
      if (isDisabled) {
        return {
          ...style,
          // Using --color-dark (#6C757D) for better contrast than --color-medium
          backgroundColor: variant === 'primary' ? 'var(--color-light)' : 'transparent',
          borderColor: variant === 'secondary' ? 'var(--color-light)' : undefined,
          color: variant === 'primary' ? 'var(--color-dark)' : 'var(--color-medium)',
        };
      }

      switch (variant) {
        case 'primary':
          return {
            ...style,
            backgroundColor: colors.main,
            '--hover-bg': colors.hover,
          } as CSSProperties;
        case 'secondary':
          return {
            ...style,
            borderColor: colors.main,
            color: colors.main,
            '--hover-bg': colors.light,
          } as CSSProperties;
        case 'tertiary':
          return {
            ...style,
            color: colors.main,
          };
        default:
          return style || {};
      }
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          ${baseStyles}
          ${variantStructuralStyles[variant]}
          ${sizeStyles[size]}
          ${widthStyle}
          ${disabledStyle}
          ${colorScheme === 'teal' ? 'focus-visible:ring-[var(--color-teal)]' : 'focus-visible:ring-[var(--color-coral)]'}
          ${!isDisabled && variant === 'primary' ? 'hover:brightness-95 active:brightness-90' : ''}
          ${!isDisabled && variant === 'secondary' ? (colorScheme === 'teal' ? 'hover:bg-[var(--color-teal-light)]' : 'hover:bg-[var(--color-coral-light)]') : ''}
          ${!isDisabled && variant === 'tertiary' ? 'hover:opacity-80' : ''}
          ${className}
        `}
        style={getInlineStyles()}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonColorScheme };
