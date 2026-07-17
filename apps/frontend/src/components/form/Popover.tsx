'use client';
import { OverlayArrow, Popover as AriaPopover, type PopoverProps as AriaPopoverProps } from 'react-aria-components/Popover';

export interface PopoverProps extends Omit<AriaPopoverProps, 'children'> {
  children: React.ReactNode;
  hideArrow?: boolean;
}

export function Popover({ children, hideArrow, ...props }: PopoverProps) {
  return (
    (
      <AriaPopover {...props} className={`transition-opacity duration-300 data-[entering]:opacity-0 data-[exiting]:opacity-0 flex bg-[var(--color-form-select-bg)] min-w-(--trigger-width) overflow-y-auto border border-[var(--color-border)] shadow-xl rounded-[var(--border-radius-ui)] ${props.className || ''}`}>
        {({trigger}) => <>
          {!hideArrow && trigger !== 'MenuTrigger' && trigger !== 'SubmenuTrigger' && (
            <OverlayArrow>
              <svg width={12} height={12} viewBox="0 0 12 12">
                <path d="M0 0 L6 6 L12 0" />
              </svg>
            </OverlayArrow>
          )}
          {children}
        </>}
      </AriaPopover>
    )
  );
}
