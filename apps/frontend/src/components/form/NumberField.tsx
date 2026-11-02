import {
  NumberField as AriaNumberField,
  type NumberFieldProps as AriaNumberFieldProps,
  Button,
  type ButtonProps,
  type ValidationResult,
} from 'react-aria-components/NumberField';
import { Description, FieldError, FieldGroup, Label, Input } from './Form';
import { RiArrowUpSLine, RiArrowDownSLine } from '@remixicon/react';
import { tv } from 'tailwind-variants';

export interface NumberFieldProps extends AriaNumberFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string
}

const numberFieldStyle = tv({
  base: 'bg-[var(--color-form-text-bg)] border-[var(--color-border)] border rounded-[var(--border-radius-ui)] data-[focus-within]:border-[var(--color-primary)] transition-colors duration-300',
  variants: {
    isDisabled: {
      true: 'opacity-60 cursor-default'
    }
  }
});


export function NumberField(
  { label, description, errorMessage, placeholder, ...props }: NumberFieldProps
) {
  return (
    <AriaNumberField {...props} className={`group flex flex-col gap-1 font-sans ${props.className ?? ''}`}>
      {label && <Label className="text-base">{label}</Label>}
      <FieldGroup className={numberFieldStyle({isDisabled: props.isDisabled})}>
        <>
          <Input className="h-[34px] border-none outline-none" placeholder={placeholder} />
          <div className='flex flex-col'>
            <StepperButton slot="increment">
               <RiArrowUpSLine size={16} /> 
            </StepperButton>
            <StepperButton slot="decrement">
              <RiArrowDownSLine size={16} />
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
