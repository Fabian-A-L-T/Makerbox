import { Breadcrumbs } from "./Breadcrumbs";

interface PageHeaderProps {
    title: string;
    description?: string;
    headerSize?: 'h1' | 'h2' | 'h3';
    className?: string;
    children?: React.ReactNode;
}

export default function PageHeader({className, title, description, headerSize = 'h1', children }: PageHeaderProps) {
  return (
    <div className={`flex gap-1 pb-2 border-b-2 border-[var(--color-border)] ${headerSize === 'h1' ? 'm-5' : headerSize === 'h2' ? 'm-4' : 'm-3'} ${className || ''}`}>
        <div className="flex-auto flex flex-col gap-1">
            {headerSize === 'h1' && <h1 className="text-3xl">{title}</h1>}
            {headerSize === 'h2' && <h2 className="text-2xl">{title}</h2>}
            {headerSize === 'h3' && <h3 className="text-xl">{title}</h3>}
            {description && <p className="text-[var(--color-text-muted)]">{description}</p>}
        </div>
        <Breadcrumbs className="h-max">
            {children}
        </Breadcrumbs>
    </div>
  );
}