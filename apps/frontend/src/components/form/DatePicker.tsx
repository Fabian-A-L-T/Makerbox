import {
  DatePicker as AriaDatePicker,
  type DatePickerProps as AriaDatePickerProps,
  type DateValue,
  type ValidationResult
} from 'react-aria-components/DatePicker';
import {DateInput} from './DateField';
import {Description, FieldError, FieldGroup, Label} from './Form';
import {Popover} from './Popover';
import {Button} from './Button';
import { RiCalendar2Line } from '@remixicon/react';
import { Calendar } from './Calendar';
import { tv } from 'tailwind-variants';

export interface DatePickerProps<T extends DateValue> extends AriaDatePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

const datePickerStyle = tv({
  base: 'bg-[var(--color-form-text-bg)] border-[var(--color-border)] border rounded-[var(--border-radius-ui)] data-[focus-within]:border-[var(--color-primary)]',
  variants: {
    isDisabled : {
      true: '!bg-[var(--color-form-text-bg)]/60 text-[var(--color-text)]/60 border-[var(--color-border)]/60 cursor-default'
    }
  }
})


export function DatePicker<T extends DateValue>({
  label,
  description,
  errorMessage,
  ...props
}: DatePickerProps<T>) {
    return (
        <AriaDatePicker {...props} className={`group flex flex-col gap-1 [&[data-invalid="true"]>div]:border-[var(--color-danger)] ${props.className}`}>
            {label && <Label className="text-base">{label} {props.isRequired && <span className="text-[var(--color-danger)]">*</span>}</Label>}
            <FieldGroup className={datePickerStyle({isDisabled: props.isDisabled})}>
                <DateInput className="flex-1 text-sm !border-none" />
                <Button variant='quiet' className="!h-[34px] !p-0 aspect-square justify-center">
                    <RiCalendar2Line size={18}/>
                </Button>
            </FieldGroup>
            {description && <Description>{description}</Description>}
            <FieldError>{errorMessage}</FieldError>
            <Popover placement="bottom end" className="p-2 !min-w-max">
                <Calendar firstDayOfWeek='mon'/>
            </Popover>
        </AriaDatePicker>
    );
}
