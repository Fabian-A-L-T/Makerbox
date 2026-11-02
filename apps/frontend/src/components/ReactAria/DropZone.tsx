import { type DropZoneProps ,DropZone as RACDropZone, Text } from 'react-aria-components/DropZone';
import type { DropOperation, DropItem } from 'react-aria-components';
import { tv } from 'tailwind-variants';
// import './DropZone.css'

const dropZoneClasses = tv({
  base: "flex overflow-hidden flex-col justify-center items-center border-2 border-dashed border-[var(--color-border)] bg-[var(--color-form-text-bg)] rounded-lg data-[focused]:border-[var(--color-primary)] transition-colors duration-200",
  variants: {
    isDisabled: {
      true: 'opacity-60 '
    }
  }
})

export type DropEvent = {
    type: "drop";
    dropOperation: DropOperation;
    items: DropItem[];
    x: number;
    y: number;
}

export function DropZone(props: DropZoneProps) {
  return <RACDropZone {...props} className={dropZoneClasses({isDisabled: props.isDisabled}) + ' ' + (props.className || '')} />;
}

export {Text};
