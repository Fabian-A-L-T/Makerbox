import { useState } from "react";
import type { Component, Category, Manufacturer } from "@utils/schemas";
import TextField from "@components/form/TextField";
import { Select, SelectItem } from "@components/form/Select";
import { DropZone, Text, type DropEvent } from "@components/ReactAria/DropZone";
import * as v from 'valibot';
import { RiImageLine, RiFileTextLine, RiFileWord2Line } from "@remixicon/react";
import { NumberField } from "@components/form/NumberField";
import { last, split } from "lodash";

const componentSchema = v.object({
    name: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.maxLength(64, 'El nombre debe tener menos de 64 caracteres')),
    sku: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.maxLength(10, 'El SKU debe tener menos de 10 caracteres')),
    description: v.optional(v.pipe(v.string(), v.maxLength(512, 'La descripción debe tener menos de 512 caracteres'))),
    category_id: v.number(),
    manufacturer_id: v.number(),
    stock: v.pipe(v.number('Debe ser un número valido'), v.minValue(0, 'El stock debe ser un número positivo'), v.maxValue(9999, 'El stock debe ser un número menor a 9999')),
    stock_min: v.pipe(v.number('Debe ser un número valido'), v.minValue(0, 'El stock mínimo debe ser un número positivo'), v.maxValue(9998, 'El stock mínimo debe ser un número menor a 9998')),
    metric: v.optional(v.pipe(v.string(), v.maxLength(20, 'La unidad de medida debe tener menos de 20 caracteres'))),
    datasheet_url: v.union([v.pipe(v.string(), v.domain('URL inválida')), v.literal('')]),
    image_url: v.union([v.pipe(v.string(), v.domain('URL inválida')), v.literal('')]),
    notes: v.optional(v.pipe(v.string(), v.maxLength(512, 'Las notas deben tener menos de 512 caracteres')))
})

const validate = (value: string | number | undefined, key: 'name' | 'sku' | 'description' | 'category_id' | 'manufacturer_id' | 'stock' | 'stock_min' | 'metric' | 'datasheet_url' | 'image_url' | 'notes') => {
    const result = v.safeParse(componentSchema.entries[key], value);
    return result.issues?.[0]?.message || '';
}

interface ComponentFormProps {
    target?: Component | null;
    allCategories: Category[];
    allManufacturers: Manufacturer[];
    setImage: (image: File | null) => void;
    setFile: (file: File | null) => void;
}

function validateImgSize(image: File){
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(image);
        
        img.onload = () => {
            URL.revokeObjectURL(img.src);

            if (img.width  > 1600 || img.height > 1600) {
                reject('Las dimensiones no deben ser mayores a 1600x1600px');
            } 
            else {
                resolve(image);
            }
        };
        
        img.onerror = () => reject('Formato invalido');
    });
}

export default function ComponentForm({ target, allCategories, allManufacturers, setImage, setFile }: ComponentFormProps) {
    const [imgContent, setImgContent] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<{name: string, type: string} | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fileErrorMsg, setFileErrorMsg] = useState<string | null>(null);

    async function fileDropHandler(event: DropEvent){
        let item = event.items.find(item => {
            return item.kind === 'file' && item.type.startsWith('application/')
        });
        if (item?.kind === 'file') {
            try {
                let file = await item.getFile();
                setFileErrorMsg(null);
                setFileContent({name: item.name, type: item.type});
                setFile(file);
            }
            catch(err: any){
                setFileErrorMsg(err);
            }
        }
        else{
            setFileErrorMsg('Formato invalido');
        }
    }

    async function imageDropHandler(event: DropEvent){
        let item = event.items.find(item => {
            return item.kind === 'file' && item.type.startsWith('image/')
        });

        if (item?.kind === 'file') {
            try {
                let file = await item.getFile();
                await validateImgSize(file);
                setErrorMessage(null);
                let url = URL.createObjectURL(file);
                setImgContent(url);
                setImage(file);
            }
            catch(err: any){
                setErrorMessage(err);
            }
        }
        else{
            setErrorMessage('Formato invalido');
        }
    }

    return (
        <>
            <div className='grid grid-cols-5 gap-4 '>
                <div className='flex flex-col gap-2 w-2xs aspect-square col-span-2'>
                    <span className="text-sm font-semibold" >Imagen</span>
                    <DropZone
                        className='h-full'
                        getDropOperation={types => (
                            ['image/jpeg', 'image/png', 'image.gif', 'image/webp'].some(t => types.has(t))
                            ? 'copy'
                            : 'cancel'
                        )}
                        onDrop={imageDropHandler}
                    >
                        <Text slot="label" className="text-sm text-center text-[var(--color-text-muted)]">
                            {imgContent || target?.image_url 
                                ? <img src={imgContent || ('/' + target?.image_url)} alt="" style={{maxWidth: '100%'}} /> 
                                :(
                                    <>
                                        <RiImageLine className="mx-auto" size={64} color="var(--color-text-muted)"/>
                                        <span>Arrastra la imagen aquí</span>
                                    </>
                                )}
                        </Text>
                    </DropZone>
                    {errorMessage && <span className="text-[var(--color-danger)] text-xs">{errorMessage}</span>}
                </div>
                <div className="flex flex-col gap-4 col-span-3">
                    <TextField
                        autoFocus
                        label="Nombre"
                        isRequired
                        name="name"
                        placeholder="Ej: Resistor"
                        validate={(value) => validate(value, 'name')}
                        {...(target ? {defaultValue: target.name}: {})}
                    />
                    <TextField
                        label="SKU"
                        isRequired
                        name="sku"
                        placeholder="Ej: C-R-0001"
                        validate={(value) => validate(value, 'sku')}
                        {...(target ? {defaultValue: target.sku}: {})}
                    />
                    <Select
                        label="Categoría"
                        name="category_id"
                        isRequired
                        errorMessage="Campo requerido"
                        placeholder="Seleccione una categoría"
                        validate={(value) => validate(value, 'category_id')}
                        {...(target ? {defaultValue: target.category_id}: {})}
                    >
                        {allCategories.map((cat) => (
                            <SelectItem key={cat.id} id={cat.id}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </Select>
                    <Select
                        label="Fabricante"
                        name="manufacturer_id"
                        isRequired
                        errorMessage="Campo requerido"
                        placeholder="Seleccione un fabricante"
                        validate={(value) => validate(value, 'manufacturer_id')}
                        {...(target ? {defaultValue: target.manufacturer_id}: {})}
                    >
                        {allManufacturers.map((man) => (
                            <SelectItem key={man.id} id={man.id}>
                                {man.name}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <NumberField
                    label="Stock actual"
                    name="stock"
                    validate={(value) => validate(value, 'stock')}
                    {...(target ? {defaultValue: target.stock}: {defaultValue: 0})}
                />
                <NumberField
                    label="Stock mínimo"
                    name="stock_min"
                    validate={(value) => validate(value, 'stock_min')}
                    {...(target ? {defaultValue: target.stock_min}: {defaultValue: 0})}
                />
            </div>
            <TextField
                label="Unidad de medida"
                type="text"
                name="metric"
                placeholder="Ej: mm"
                validate={(value) => validate(value, 'metric')}
                {...(target ? {defaultValue: target.metric}: {})}
            />
            <TextField
                label="Descripción"
                name="description"
                type="textarea"
                placeholder="Ej: Resistor de 1K Ohm..."
                validate={(value) => validate(value, 'description')}
                {...(target ? {defaultValue: target.description}: {})}
            />
            <div className='flex flex-col gap-2'>
                <span className="text-sm font-semibold" >Datasheet</span>
                <DropZone
                    className='h-full'
                    getDropOperation={types => (
                        ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'].some(t => types.has(t))
                        ? 'copy'
                        : 'cancel'
                    )}
                    onDrop={fileDropHandler}
                >
                    <Text slot="label" className="text-sm text-center text-[var(--color-text-muted)]">
                        {fileContent || target?.datasheet_url
                            ? <div>
                                {fileContent?.type === 'application/pdf' || (target?.datasheet_url.endsWith('.pdf') || target?.datasheet_url.endsWith('.PDF') )
                                    ? <RiFileTextLine className="mx-auto mb-2" size={64} color="var(--color-success)"/>
                                    : <RiFileWord2Line className="mx-auto mb-2" size={64} color="var(--color-success)"/>}
                                <span className="font-semibold italic text-[var(--color-success)]">{fileContent ? fileContent.name : last(split(target?.datasheet_url ,'\\'))}</span>
                                </div>
                            : <>
                                <RiFileTextLine className="mx-auto" size={64} color="var(--color-text-muted)"/>
                                <span>Arrastra el datasheet aquí</span>
                                </>
                        }
                    </Text>
                </DropZone>
                {fileErrorMsg && <span className="text-[var(--color-danger)] text-xs">{fileErrorMsg}</span>}
            </div>
            <TextField
                label="Notas"
                name="notes"
                type="textarea"
                validate={(value) => validate(value, 'notes')}
                {...(target ? {defaultValue: target.notes}: {})}
            />
        </>
    );
}
