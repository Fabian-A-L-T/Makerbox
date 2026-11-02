'use client';
import {
  TextField as AriaTextField,
  TextArea as AriaTextArea,
  type TextFieldProps as AriaTextFieldProps,
  type TextAreaProps,
  type ValidationResult,
} from 'react-aria-components/TextField';
import {Label, FieldError, Description, Input, FieldGroup} from './Form';
import { tv } from 'tailwind-variants';

export interface TextFieldProps extends AriaTextFieldProps {
  label?: string
  description?: string
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string
  icon?: React.ReactNode
}

export function TextArea(props: TextAreaProps) {
    return <AriaTextArea {...props} />
}

const textFieldStyles = tv({
  base: 'bg-[var(--color-form-text-bg)] border border-[var(--color-border)] rounded-[var(--border-radius-ui)] data-[invalid]:border-[var(--color-danger)]  data-[focus-within]:border-[var(--color-primary)] transition-colors duration-200',
  variants: {
    isDisabled: {
      true: 'opacity-60',
    },
  }})

export default function TextField({ label, description, errorMessage, placeholder, icon, ...props }: TextFieldProps) {
  return (
    <AriaTextField {...props} className={`flex flex-col gap-1 ${props.className || ''}`}>
      <Label className="text-base font-medium">{label} {props.isRequired && <span className="text-[var(--color-danger)]">*</span>}</Label>
      <FieldGroup className={textFieldStyles({ isDisabled: props.isDisabled })}>
        {props.type === 'textarea' 
          ? <TextArea className="min-h-[34px] outline-none w-full p-2" placeholder={placeholder} /> 
          : <>
              {icon}
              <Input className="h-[34px] outline-none" placeholder={placeholder}  />
            </>
        }
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
