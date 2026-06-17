'use client';
import { Form as RACForm, type FormProps } from 'react-aria-components/Form';
import { type LabelProps, Label as RACLabel } from 'react-aria-components/Label';
import { type FieldErrorProps, FieldError as RACFieldError } from 'react-aria-components/FieldError';
import { type ButtonProps, Button } from 'react-aria-components/Button';
import { type TextProps } from 'react-aria-components/Text';
import { Text } from '../ReactAria/Content';
import { Group, type GroupProps } from 'react-aria-components';
import { Input as RACInput, type InputProps } from 'react-aria-components/Input';

export function Form(props: FormProps) {
  return <RACForm {...props} />;
}

export function Label(props: LabelProps) {
  return <RACLabel {...props} />;
}

export function FieldError(props: FieldErrorProps) {
  return <RACFieldError {...props} className={`${props.className || ''} text-[var(--color-danger)] text-xs`} />;
}

export function Description(props: TextProps) {
  return <Text slot="description" {...props} className={`${props.className || ''} text-[var(--color-text-muted)] text-xs`} />
}

export function FieldButton(props: ButtonProps) {
  return <Button {...props} className="field-Button" />;
}

export function FieldGroup(props: GroupProps) {
  return <Group {...props} className={`${props.className || ''} flex items-center`} />;
}

export function Input(props: InputProps){
  return <RACInput {...props} className={`${props.className || ''} w-full p-2`}/>
}
