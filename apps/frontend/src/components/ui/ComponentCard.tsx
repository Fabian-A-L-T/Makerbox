import { Button } from "@components/form/Button";
import { NumberField } from "@components/form/NumberField";
import { RiAddLine, RiCircleFill } from "@remixicon/react";
import { AsyncImg } from "@utils/Utils";
import type { ListComponentData } from "@views/NewProject";
import { useState, type Dispatch, type SetStateAction } from "react";

interface ComponentCardProps {
    id: number,
    name: string,
    image?: string,
    manufacturer: string,
    cost: number,
    stock: number,
    minStock: number,
    setList: Dispatch<SetStateAction<Record<number,ListComponentData>>>,
    setBudget: Dispatch<SetStateAction<number>>
}

export default function ComponentCard({id, name, image, manufacturer, cost, stock, minStock, setList, setBudget}: ComponentCardProps){

    const [selectedStock, setSelectedStock] = useState<number>(1);
    let status = {text: '', color: ''}

    switch (true) {
        case (stock === 0):
            status.text = 'Sin stock';
            status.color = 'var(--color-danger)'
            break;
        case (stock <= minStock):
            status.text = 'Quedan pocos';
            status.color = 'var(--color-warning)'
            break;
        default:
            status.text = 'Disponible';
            status.color = 'var(--color-success)'
            break;
    }

    return (
        <div className="flex w-full gap-4">
            <div className="w-[150px]"><AsyncImg className='w-full aspect-square object-cover rounded-[var(--border-radius-ui)]' src={image ? '/' + image : undefined} alt={name + ' imagen'} notfoundsubtitle="Imagen no disponible"/></div>
            <div className="flex-auto flex flex-col justify-between">
                <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                        <span className="text-lg">{name}</span>
                        <span className="text-sm text-[var(--color-text-muted)]">{manufacturer}</span>
                    </div>
                    <span className="text-xl">{'$' + cost.toLocaleString()}</span>
                </div>
                <div className="flex gap-4">
                    <div className="w-full h-auto px-4 flex justify-between items-center bg-[var(--color-border)] rounded-[var(--border-radius-ui)]">
                        <div className="flex items-center gap-1">
                            <RiCircleFill size={14} color={status.color}/> 
                            <span>{status.text}</span>
                        </div>
                        <span>{stock}</span>
                    </div>
                    <NumberField className='w-[100px]' value={selectedStock} onChange={setSelectedStock} minValue={1} maxValue={Math.min(50, stock)} aria-label="cantidad"/>
                    <div><Button className='!w-max h-full' variant="primary" isDisabled={stock === 0} 
                        onPress={() => {
                            if(stock > 0) {
                                let duplicatedIdComp: ListComponentData | undefined;
                                setList((prev) => {
                                    if(Object.hasOwn(prev, id)) duplicatedIdComp = prev[id];
                                    return ({...prev, [id]:{id, name, cost, selectedStock}});
                                });
                                setBudget((prev) => prev + (cost * selectedStock) - (duplicatedIdComp ? (duplicatedIdComp.cost * duplicatedIdComp.selectedStock) : 0));
                            }
                    }}>
                        <RiAddLine />
                        <span>Agregar a lista</span>
                    </Button></div>
                </div>
            </div>
        </div>
    )
}