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

export function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>) {
  return <AriaBreadcrumbs {...props} className={`flex gap-1 ${props.className}`} />;
}

export function Breadcrumb(props: BreadcrumbProps & Omit<LinkProps, 'className'>) {
  return (
    <AriaBreadcrumb {...props} className={`flex items-center gap-1 ${props.className}`}>
      {({ isCurrent }) => (
        <>
          <RouterLink
            to={(props as any).href ?? (props as any).to}
            className={'data-[current]:font-medium'}
          >
            {props.children as ReactNode}
          </RouterLink>
          {!isCurrent && <RiArrowRightSLine />}
        </>
      )}
    </AriaBreadcrumb>
  );
}