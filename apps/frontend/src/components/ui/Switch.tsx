import React from 'react';
import {
  SwitchField,
  SwitchButton,
  type SwitchFieldProps,
  type ValidationResult
} from 'react-aria-components/Switch';
import {tv} from 'tailwind-variants';
import {Description, FieldError} from '../form/Form';

export interface SwitchProps extends Omit<SwitchFieldProps, 'children'> {
  children: React.ReactNode;
  ActiveIcon?: React.ReactNode;
  InactiveIcon?: React.ReactNode;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

const track = tv({
  base: 'flex items-center h-5 w-9 px-px cursor-default rounded-full transition duration-200 ease-in-out border border-transparent bg-[var(--color-text)] border-[var(--color-text)]',
  variants: {
    isDisabled: {
      true: 'opacity-50 pointer-events-none'
    }
  }
});

const handle = tv({
  base: 'flex items-center justify-center h-4 w-4 transform rounded-full outline outline-1 -outline-offset-1 outline-transparent transition duration-200 ease-in-out bg-[var(--color-surface)]',
  variants: {
    isSelected: {
      false: 'translate-x-0',
      true: 'translate-x-[100%]'
    },
    isDisabled: {
      true: 'opacity-50 pointer-events-none'
    }
  }
});

export function Switch({children, ...props}: SwitchProps) {
  return (
    <SwitchField {...props} className="w-full flex flex-col gap-1 group">
      <SwitchButton
        className={`group relative flex gap-2 items-center text-sm transition [-webkit-tap-highlight-color:transparent] ${props.className || ''}`}>
        {renderProps => (
          <>
            <div className={track(renderProps)}>
              <span className={handle(renderProps)} >
                {renderProps.isSelected ? props.ActiveIcon : props.InactiveIcon}
              </span>
            </div>
            {children}
          </>
        )}
      </SwitchButton>
      {props.description && <Description>{props.description}</Description>}
      <FieldError>{props.errorMessage}</FieldError>
    </SwitchField>
  );
}
