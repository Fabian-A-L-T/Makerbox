import { RiArrowRightSLine } from '@remixicon/react';
import { Link } from '@tanstack/react-router';
import {
  Breadcrumb as AriaBreadcrumb,
  Breadcrumbs as AriaBreadcrumbs,
  type BreadcrumbProps,
  type BreadcrumbsProps,
  type LinkProps,
} from 'react-aria-components/Breadcrumbs';

export function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>) {
  return <AriaBreadcrumbs {...props} className={`flex gap-1 ${props.className}`} />;
}

export function Breadcrumb(props: BreadcrumbProps & Omit<LinkProps, 'className'>, link: string) {
  return (
    <AriaBreadcrumb {...props} className={`flex items-center gap-1 ${props.className}`}>
      {({isCurrent}) => (<>
       <Link to={link}/>
        {!isCurrent && <RiArrowRightSLine className="w-3 h-3 text-neutral-600 dark:text-neutral-400" />}
      </>)}
    </AriaBreadcrumb>
  );
}