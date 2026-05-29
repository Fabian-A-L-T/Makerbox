import { Button } from "./form/Button";
import { RiEditLine, RiDeleteBinLine, type RemixiconComponentType } from '@remixicon/react';

interface CRUDTableActionsProps {
    name: string,
    editAction: () => void,
    deleteAction: () => void,
    aditionalButtons?: [{
        RiIcon: RemixiconComponentType,
        ariaLabel: string,
        action: () => void
    }]
}

export default function CRUDTableActions({name, editAction, deleteAction, aditionalButtons}: CRUDTableActionsProps){
    return (
        <div className="flex items-center justify-center gap-2">
            {aditionalButtons?.map((item) => (
                <Button
                    key={item.ariaLabel}
                    variant="secondary"
                    aria-label={item.ariaLabel}
                    onClick={item.action}
                >
                    <item.RiIcon size={16} color="#fff" />
                </Button>
            ))}
            <Button
                variant="primary"
                aria-label={`Editar ${name}`}
                onClick={editAction}
            >
                <RiEditLine size={16} color="#fff" />
            </Button>
            <Button
                variant="danger"
                aria-label={`Eliminar ${name}`}
                onClick={deleteAction}
            >
                <RiDeleteBinLine size={16} color="#fff" />
            </Button>
        </div>
    );
}