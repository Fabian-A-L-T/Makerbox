'use client';
import {
  type ListBoxItemProps,
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue,
  type ValidationResult,
} from 'react-aria-components/Select';

import {Button} from './Button';
import {ListBoxItem, ListBox} from './ListBox';
import { RiArrowDownSLine } from '@remixicon/react';
import {Popover} from './Popover';
import {Label, FieldError, Description} from './Form';

const buttonStyle = 'text-[var(--color-text)] bg-[var(--color-form-select-bg)] hover:bg-[var(--color-form-select-bg)]/60 border-[var(--color-border)] rounded-[var(--border-radius-ui)] outline-none';

export interface SelectProps<T extends object, M extends 'single' | 'multiple'> extends Omit<AriaSelectProps<T, M>, 'children'> {
  label?: string
  description?: string
  errorMessage?: string | ((validation: ValidationResult) => string)
  items?: Iterable<T>
  children: React.ReactNode | ((item: T) => React.ReactNode)
  isLoading?: boolean
}

export function Select<T extends object, M extends 'single' | 'multiple' = 'single'>(
  { label, description, errorMessage, children, items, isLoading, ...props }: SelectProps<T, M>
) {
  return (
    (
      <AriaSelect {...props} className={`flex flex-col gap-2 w-full ${props.className || ''}`}>
        {label && <Label className="text-base font-semibold">{label} {props.isRequired && <span className="text-[var(--color-danger)]">*</span>}</Label>}
        <Button className={buttonStyle} variant='custom'>
            {({ isPressed }) => (
              <>
                <SelectValue className={'flex justify-between items-center w-full font-normal mr-4'}/>
                {isLoading 
                  ? <span className="animate-spin rounded-full border-2 border-white/40 border-t-transparent" style={{ width: 20, height: 20, display: 'inline-block' }}/> 
                  : <RiArrowDownSLine className={`transition-transform duration-300 ${isPressed ? 'rotate-180' : ''}`} size={20} />}
              </>
            )}
        </Button>
        {description && <Description>{description}</Description>}
        <FieldError>{errorMessage}</FieldError>
        <Popover>
          <ListBox items={items}>
            {children}
          </ListBox>
        </Popover>
      </AriaSelect>
    )
  );
}

export function SelectItem(props: ListBoxItemProps) {
  return <ListBoxItem {...props} className='flex flex-col' />;
}
