'use client';
import {
  TextField as AriaTextField,
  TextArea as AriaTextArea,
  type TextFieldProps as AriaTextFieldProps,
  type TextAreaProps,
  type ValidationResult,
} from 'react-aria-components/TextField';
import {Label, FieldError, Description, Input, FieldGroup} from './Form';

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

export default function TextField({ label, description, errorMessage, placeholder, icon, ...props }: TextFieldProps) {
  return (
    <AriaTextField {...props} className={`flex flex-col gap-2 ${props.className || ''}`}>
      <Label className="text-sm font-semibold">{label} {props.isRequired && <span className="text-[var(--color-danger)]">*</span>}</Label>
      <FieldGroup className={'bg-[var(--color-form-text-bg)] outline-[var(--color-border)] outline-2 rounded-[var(--border-radius-ui)] data-[focus-within]:outline-[var(--color-primary)] transition-colors duration-300'}>
        {props.type === 'textarea' 
          ? <TextArea className="outline-none" placeholder={placeholder} /> 
          : <Input className="outline-none" placeholder={placeholder}  />
        }
        {icon}
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
