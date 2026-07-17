import { type DropZoneProps ,DropZone as RACDropZone, Text } from 'react-aria-components/DropZone';
import type { DropOperation, DropItem } from 'react-aria-components';
// import './DropZone.css'

const dropZoneClasses = "p-2 flex flex-col justify-center items-center border-2 border-dashed border-[var(--color-border)] bg-[var(--color-form-select-bg)] rounded-lg data-[focused]:border-[var(--color-primary)] transition-colors duration-300"

export type DropEvent = {
    type: "drop";
    dropOperation: DropOperation;
    items: DropItem[];
    x: number;
    y: number;
}

export function DropZone(props: DropZoneProps) {
  return <RACDropZone {...props} className={`${dropZoneClasses} ${props.className || ''}`} />;
}

export {Text};
