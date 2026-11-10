'use client';
import { RiLoader5Line } from '@remixicon/react';
import { Button as RACButton, type ButtonProps as RACButtonProps } from 'react-aria-components/Button';
import { composeRenderProps } from 'react-aria-components/composeRenderProps';
import { tv } from 'tailwind-variants';

interface ButtonProps extends RACButtonProps {
  /**
   * The visual style of the button (Vanilla CSS implementation specific).
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'quiet' | 'custom'
}

const buttonStyles = tv({
  base: 'h-[36px] px-3 py-2 rounded-[var(--border-radius-ui)] cursor-pointer flex items-center justify-center gap-2',
  variants: {
    variant: {
      primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/60 text-white',
      secondary: 'bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/60 text-white',
      danger: 'bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/60 text-white',
      warning: 'bg-[var(--color-warning)] hover:bg-[var(--color-warning)]/60 text-white',
      quiet: 'bg-transparent hover:bg-[var(--color-secondary)]/10',
      custom: ''
    },
    isDisabled: {
      true: 'opacity-60 cursor-default'
    },
    isPending: {
      true: 'opacity-60'
    }
  },
  defaultVariants: {
    variant: 'primary'
  },
});

export function Button(props: ButtonProps) {

  return (
    <RACButton {...props} 
      className={composeRenderProps(props.className, (className, state) => buttonStyles({ ...state, variant: props.variant, className }))}
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
