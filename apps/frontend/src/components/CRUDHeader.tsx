import { Button } from "@components/form/Button";
import { RiAddLine } from "@remixicon/react";

interface CRUDHeaderProps {
    title: string;
    subtitle?: string;
    action?: Function;
    buttonText?: string;
}

export default function CRUDHeader({ title, subtitle, action, buttonText }: CRUDHeaderProps) {
    return (
        <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-[var(--color-text)]">{title}</h1>
                {subtitle && <span className="text-[var(--color-text-muted)]">{subtitle}</span>}
            </div>
            {action && 
                <Button onPress={() => action()}>
                    <RiAddLine className="mr-2" size={20} color="#fff" />
                    {buttonText ?? 'Acción'}
                </Button>
            }
        </div>
    )
}