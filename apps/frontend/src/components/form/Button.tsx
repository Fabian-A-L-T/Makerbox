'use client';
import { RiLoader5Line } from '@remixicon/react';
import { Button as RACButton, type ButtonProps as RACButtonProps } from 'react-aria-components/Button';
import { composeRenderProps } from 'react-aria-components/composeRenderProps';

interface ButtonProps extends RACButtonProps {
  /**
   * The visual style of the button (Vanilla CSS implementation specific).
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'quiet' | 'custom'
}

const variantStyles = {
  primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/60 border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/40 text-white',
  secondary: 'bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/60 border-[var(--color-secondary)]/20 hover:border-[var(--color-secondary)]/40 text-white',
  danger: 'bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/60 border-[var(--color-danger)]/20 hover:border-[var(--color-danger)]/40 text-white',
  warning: 'bg-[var(--color-warning)] hover:bg-[var(--color-warning)]/60 border-[var(--color-warning)]/20 hover:border-[var(--color-warning)]/40 text-white',
  quiet: 'bg-transparent hover:bg-[var(--color-primary)]/10 border-transparent',
  custom: ''
};

const baseClasses = 'h-[40px] px-3 py-1.5 rounded-[var(--border-radius-ui)] border-2 cursor-pointer flex items-center justify-between font-semibold'

export function Button(props: ButtonProps) {
  const variant = props.variant || 'primary';
  const variantClass = variantStyles[variant];

  return (
    <RACButton {...props} 
      className={composeRenderProps(props.className, (className, state) => {
        return `${variantClass} ${baseClasses} ${className} ${state.isPending && '!cursor-not-allowed text-current/30 !bg-current/30 border-current/30'} ${state.isPressed || state.isFocused || state.isFocusVisible ? 'border-[var(--color-primary)]' : ''}` 
      })}
      data-variant={variant}
    >
      {composeRenderProps(props.children, (children, {isPending}) => (
        <>
          {children}
          {isPending &&
            <RiLoader5Line className='transition-transform duration-300 animate-spin' size={20} />
          }
        </>
      ))}
    </RACButton>
  );
}
