'use client';
import {
  type ListBoxItemProps,
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue,
  type ValidationResult,
  ListBoxLoadMoreItem,
  Collection,
} from 'react-aria-components/Select';

import {Button} from './Button';
import {ListBoxItem, ListBox} from './ListBox';
import { RiArrowDownSLine, RiLoader5Line } from '@remixicon/react';
import {Popover} from './Popover';
import {Label, FieldError, Description} from './Form';

const buttonStyle = 'bg-[var(--color-form-select-bg)] hover:bg-[var(--color-form-select-bg)]/60 border-[var(--color-border)] rounded-[var(--border-radius-ui)] outline-none';

export interface SelectProps<T extends object, M extends 'single' | 'multiple'> extends Omit<AriaSelectProps<T, M>, 'children'> {
  label?: string
  description?: string
  errorMessage?: string | ((validation: ValidationResult) => string)
  items?: Iterable<T>
  children: React.ReactNode | ((item: T) => React.ReactNode)
  loadingState?: "error" | "loading" | "sorting" | "loadingMore" | "idle" | "filtering"
  onLoadMore?: () => any
}

export function Select<T extends object, M extends 'single' | 'multiple' = 'single'>(
  { label, description, errorMessage, children, items, loadingState, onLoadMore, ...props }: SelectProps<T, M>
) {
  return (
    (
      <AriaSelect {...props} className={`flex flex-col gap-2 w-full ${props.className || ''}`}>
        {label && <Label className="text-base font-semibold">{label} {props.isRequired && <span className="text-[var(--color-danger)]">*</span>}</Label>}
        <Button className={buttonStyle} variant='custom' isPending={loadingState === 'loading' || loadingState === 'filtering'} isDisabled={loadingState === 'loading' || loadingState === 'filtering'}>
            {({ isPressed }) => (
              <>
                <SelectValue className={'flex justify-between items-center w-full font-normal mr-4'}/>
                {(loadingState !== 'loading' && loadingState !== 'filtering') && <RiArrowDownSLine className={`transition-transform duration-300 ${isPressed ? 'rotate-180' : ''}`} size={20} />}
              </>
            )}
        </Button>
        {description && <Description>{description}</Description>}
        <FieldError>{errorMessage}</FieldError>
        <Popover hideArrow>
          <ListBox className='max-h-[188px]' renderEmptyState={() => (<p className='text-center font-italic text-[var(--color-text)]/50'>Sin datos</p>)}>
            <Collection items={items}>
              {children}
            </Collection>
            <ListBoxLoadMoreItem onLoadMore={onLoadMore} isLoading={loadingState === 'loadingMore'} scrollOffset={0.5}>
              <div className='flex px-2 p-4 justify-center'>
                <RiLoader5Line className={`transition-transform duration-300 ${loadingState === 'loadingMore' ? 'animate-spin' : ''}`} size={20} />
              </div>
            </ListBoxLoadMoreItem>
          </ListBox>
        </Popover>
      </AriaSelect>
    )
  );
}

export function SelectItem(props: ListBoxItemProps) {
  return <ListBoxItem {...props} className='flex flex-col' />;
}
