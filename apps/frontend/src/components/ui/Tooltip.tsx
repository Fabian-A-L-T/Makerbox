import React from 'react';
import {
  Tooltip as AriaTooltip,
  type TooltipProps as AriaTooltipProps,
  OverlayArrow
} from 'react-aria-components/Tooltip';

export interface TooltipProps extends Omit<AriaTooltipProps, 'children'> {
  children: React.ReactNode;
}

export function Tooltip({children, ...props}: TooltipProps) {
  return (
    <AriaTooltip
      {...props}
      offset={10}
      className={`bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-text)] rounded-lg drop-shadow-lg will-change-transform px-3 py-1.5 box-border ${props.className ?? ''}`}>
      <OverlayArrow>
        <svg
          width={8}
          height={8}
          viewBox="0 0 8 8"
          className="block fill-[var(--color-background)] forced-colors:fill-[Canvas] stroke-[var(--color-border)] forced-colors:stroke-[ButtonBorder] group-placement-bottom:rotate-180 group-placement-left:-rotate-90 group-placement-right:rotate-90">
          <path d="M0 0 L4 4 L8 0" />
        </svg>
      </OverlayArrow>
      {children}
    </AriaTooltip>
  );
}
