import {
  DateField as AriaDateField,
  type DateFieldProps as AriaDateFieldProps,
  DateInput as AriaDateInput,
  type DateInputProps,
  DateSegment,
  type DateValue,
  type ValidationResult,
} from 'react-aria-components/DateField';
import { Description, FieldError, Label } from './Form';

export interface DateFieldProps<T extends DateValue> extends AriaDateFieldProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DateField<T extends DateValue>(
  { label, description, errorMessage, ...props }: DateFieldProps<T>
) {
  return (
    <AriaDateField {...props} className={`flex flex-col gap-1 ${props.className}`}>
      {label && <Label className="text-base font-medium">{label} {props.isRequired && <span className="text-[var(--color-danger)]">*</span>}</Label>}
      <DateInput />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaDateField>
  );
}
/*
const segmentStyles = tv({
  base: 'inline p-0.5 whitespace-nowrap type-literal:p-0 rounded-xs outline outline-0 forced-color-adjust-none caret-transparent text-neutral-800 dark:text-neutral-200 forced-colors:text-[ButtonText] [-webkit-tap-highlight-color:transparent]',
  variants: {
    isPlaceholder: {
      true: 'text-neutral-600 dark:text-neutral-400'
    },
    isDisabled: {
      true: 'text-neutral-200 dark:text-neutral-600 forced-colors:text-[GrayText]'
    },
    isFocused: {
      true: 'bg-blue-600 text-white dark:text-white forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]'
    }
  }
});
*/
export function DateInput(props: Omit<DateInputProps, 'children'>) {
  return (
    <AriaDateInput {...props} className={`h-[34px] w-full px-3 py-2 bg-[var(--color-form-text-bg)] border border-[var(--color-border)] rounded-[var(--border-radius-ui)] focus:border-[var(--color-primary)] transition-colors duration-300 ${props.className}`} >
      {(segment) => <DateSegment segment={segment} className={`px-1 whitespace-nowrap outline outline-0 data-[focused]:text-[var(--color-primary)] cursor-pointer data-[disabled]:cursor-default`}/>}
    </AriaDateInput>
  );
}
