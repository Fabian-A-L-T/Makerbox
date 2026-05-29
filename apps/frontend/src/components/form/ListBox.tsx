'use client';
import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  Header,
  type ListBoxItemProps,
  type ListBoxProps,
} from 'react-aria-components/ListBox';
import { composeRenderProps } from 'react-aria-components/composeRenderProps';
import {Text} from '../ReactAria/Content';

const listBoxItemClass = `px-3 py-2 cursor-pointer text-[var(--color-text)] rounded-[var(--border-radius-ui)] transition-colors`;

export function ListBox<T extends object>({ children, ...props }: ListBoxProps<T>) {
  return (
    <AriaListBox {...props} className={`w-full flex flex-col gap-2 p-2 bg-transparent rounded-[var(--border-radius-ui)] ${props.className || ''}`}>
      {children}
    </AriaListBox>
  );
}

export function ListBoxItem(props: ListBoxItemProps) {
  let textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaListBoxItem {...props} className={composeRenderProps(props.className, (className, state) => {
      return [
        listBoxItemClass,
        className || '',
        state.isFocused ? 'bg-[var(--color-secondary)]/60' : '',
        state.isSelected ? '!bg-[var(--color-primary)]/80 !text-white' : '',
        state.isDisabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ');
    })}  textValue={textValue}>
      {composeRenderProps(props.children, (children) => (
        typeof children === 'string' ? <Text slot="label">{children}</Text> : children
      ))}
    </AriaListBoxItem>
  );
}

export function DropdownListBox<T extends object>(props: ListBoxProps<T>) {
  return <AriaListBox {...props} />
}

export {Text, Header};
