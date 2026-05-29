'use client';
import {
  TextField as AriaTextField,
  TextArea as AriaTextArea,
  type TextFieldProps as AriaTextFieldProps,
  type TextAreaProps,
  type ValidationResult,
} from 'react-aria-components/TextField';
import {Label, FieldError, Description, Input} from './Form';

export interface TextFieldProps extends AriaTextFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string
}

export function TextArea(props: TextAreaProps) {
    return <AriaTextArea {...props} className="w-full p-2 bg-[var(--color-form-text-bg)] outline-[var(--color-border)] outline-2 rounded-[var(--border-radius-ui)] focus:outline-[var(--color-primary)] transition-colors duration-300" />
}

export default function TextField({ label, description, errorMessage, placeholder, ...props }: TextFieldProps) {
  return (
    <AriaTextField {...props} className={`flex flex-col gap-2 ${props.className || ''}`}>
      <Label className="text-sm font-semibold">{label} {props.isRequired && <span className="text-[var(--color-danger)]">*</span>}</Label>
      {props.type === 'textarea' 
        ? <TextArea placeholder={placeholder} /> 
        : <Input placeholder={placeholder} className={'bg-[var(--color-form-text-bg)] outline-[var(--color-border)] outline-2 rounded-[var(--border-radius-ui)] focus:outline-[var(--color-primary)] transition-colors duration-300'} />
      }
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
