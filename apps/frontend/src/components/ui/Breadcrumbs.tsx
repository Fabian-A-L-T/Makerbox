import { RiArrowRightSLine } from '@remixicon/react';
import type { ReactNode } from 'react';
import {
  Breadcrumb as AriaBreadcrumb,
  Breadcrumbs as AriaBreadcrumbs,
  type BreadcrumbProps,
  type BreadcrumbsProps,
  type LinkProps,
} from 'react-aria-components/Breadcrumbs';
import { Link as RouterLink } from '@tanstack/react-router';
import { tv } from 'tailwind-variants';

export function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>) {
  return <AriaBreadcrumbs {...props} className={`flex items-center ${props.className}`} />;
}

const breadcrumbStyles = tv({
  base: 'text-[var(--color-text-muted)] text-[var(--color-text)]',
  variants: {
    isCurrent: {
      true: 'font-semibold cursor-default',
      false: 'hover:text-[var(--color-primary)] cursor-pointer'
    }
  }
});

export function Breadcrumb(props: BreadcrumbProps & Omit<LinkProps, 'className'>) {
  return (
    <AriaBreadcrumb {...props} className={'flex items-center ' + (props.className || '') }>
      {({ isCurrent }) => (
        <>
          <RouterLink
            to={(props as any).href ?? (props as any).to}
            className={breadcrumbStyles({ isCurrent })}
            disabled={isCurrent}
          >
            {props.children as ReactNode}
          </RouterLink>
          {!isCurrent && <RiArrowRightSLine size={20} color="var(--color-text-muted)" />}
        </>
      )}
    </AriaBreadcrumb>
  );
}