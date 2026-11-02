import { Heading } from "@components/ReactAria/Content";

interface ModalHeaderProps {
    title: string;
    description?: string;
    className?: string;
}

export default function ModalHeader({className, title, description}: ModalHeaderProps) {
  return (
    <div className={`flex gap-1 pb-2 border-b-2 border-[var(--color-border)] m-5 ${className || ''}`}>
        <div className="flex-auto flex flex-col gap-1">
            <Heading slot="title" className="text-xl">{title}</Heading>
            {description && <p className="text-[var(--color-text-muted)]">{description}</p>}
        </div>
    </div>
  );
}