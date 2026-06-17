import {
  NumberField as AriaNumberField,
  type NumberFieldProps as AriaNumberFieldProps,
  Button,
  type ButtonProps,
  type ValidationResult,
} from 'react-aria-components/NumberField';
import { Description, FieldError, FieldGroup, Label, Input } from './Form';
import { RiArrowUpSLine, RiArrowDownSLine } from '@remixicon/react';

export interface NumberFieldProps extends AriaNumberFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string
}

export function NumberField(
  { label, description, errorMessage, placeholder, ...props }: NumberFieldProps
) {
  return (
    <AriaNumberField {...props} className='group flex flex-col gap-1 font-sans'>
      <Label className="text-base font-semibold">{label}</Label>
      <FieldGroup className={'bg-[var(--color-form-text-bg)] outline-[var(--color-border)] outline-2 rounded-[var(--border-radius-ui)] data-[focus-within]:outline-[var(--color-primary)] transition-colors duration-300'}>
        <>
          <Input className="outline-none" placeholder={placeholder} />
          <div className='flex flex-col'>
            <StepperButton slot="increment">
               <RiArrowUpSLine size={18} /> 
            </StepperButton>
            <StepperButton slot="decrement">
              <RiArrowDownSLine size={18} />
            </StepperButton>
          </div>
        </>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaNumberField>
  );
}

function StepperButton(props: ButtonProps) {
  return <Button {...props} className="flex border-0 py-0 px-0.5 flex-1 box-border cursor-default text-neutral-500 bg-transparent pressed:bg-neutral-100 group-disabled:text-neutral-200 dark:text-neutral-400 dark:pressed:bg-neutral-800 dark:group-disabled:text-neutral-600 forced-colors:group-disabled:text-[GrayText] [-webkit-tap-highlight-color:transparent]" />
}
