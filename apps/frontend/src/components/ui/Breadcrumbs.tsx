import { RiArrowRightSLine } from '@remixicon/react';
import {
  Breadcrumb as AriaBreadcrumb,
  Breadcrumbs as AriaBreadcrumbs,
  type BreadcrumbProps,
  type BreadcrumbsProps,
  type LinkProps,
  Link
} from 'react-aria-components/Breadcrumbs';

export function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>) {
  return <AriaBreadcrumbs {...props} className={`flex gap-1 ${props.className}`} />;
}

export function Breadcrumb(props: BreadcrumbProps & Omit<LinkProps, 'className'>) {
  return (
    <AriaBreadcrumb {...props} className={`flex items-center gap-1 ${props.className}`}>
      {({isCurrent}) => (<>
       <Link {...props} className={'data-[current]:font-medium'}/>
        {!isCurrent && <RiArrowRightSLine />}
      </>)}
    </AriaBreadcrumb>
  );
}