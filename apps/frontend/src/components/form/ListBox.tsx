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

const listBoxItemClass = `p-2 cursor-pointer rounded-[var(--border-radius-ui)] transition-colors`;

export function ListBox<T extends object>({ children, ...props }: ListBoxProps<T>) {
  return (
    <AriaListBox {...props} className={`w-full max-h-[217px] flex flex-col gap-1 p-2 rounded-[var(--border-radius-ui)] ${props.className || ''}`}>
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

export {Text, Header};
