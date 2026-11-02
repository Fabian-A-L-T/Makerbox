import { Button } from "@components/form/Button";
import type { PressEvent } from "react-aria-components/Button";

interface CRUDActionProps {
    icon?: React.ReactNode;
    action: (event: PressEvent) => void;
    text: string;
}

export default function CRUDAction({icon, action, text }: CRUDActionProps) {
    return (
        <div className="flex justify-end items-center m-5">
            <Button onPress={action} className={'gap-2'}>
                {icon}
                {text ?? 'Acción'}
            </Button>
        </div>
    )
}