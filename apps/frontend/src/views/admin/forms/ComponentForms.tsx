import { useState } from "react";
import type { Component, Category, Manufacturer } from "../../../interfaces/schemas";
import TextField from "@components/form/TextField";
import { Select, SelectItem } from "@components/form/Select";
import { DropZone, Text, type DropEvent } from "@components/ReactAria/DropZone";
import * as v from 'valibot';
import { RiImageLine, RiFileTextLine, RiFileWord2Line } from "@remixicon/react";
import { NumberField } from "@components/form/NumberField";
import QuillTextEditor from "@components/form/QuillTextEditor";
import { last, split } from "lodash";
import { fetchData, paginationLimit, validateImgSize } from "@utils/Utils";
import { useAsyncList } from "react-aria-components";
import { AsyncImg } from "@utils/Utils";

const componentSchema = v.object({
    name: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.maxLength(64, 'El nombre debe tener menos de 64 caracteres')),
    sku: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.maxLength(10, 'El SKU debe tener menos de 10 caracteres')),
    description: v.optional(v.pipe(v.string(), v.maxLength(512, 'La descripción debe tener menos de 512 caracteres'))),
    category_id: v.number(),
    manufacturer_id: v.number(),
    stock: v.pipe(v.number('Debe ser un número valido'), v.minValue(0, 'El stock debe ser un número positivo'), v.maxValue(9999, 'El stock debe ser un número menor a 9999')),
    stock_min: v.pipe(v.number('Debe ser un número valido'), v.minValue(0, 'El stock mínimo debe ser un número positivo'), v.maxValue(9998, 'El stock mínimo debe ser un número menor a 9998')),
    datasheet_url: v.union([v.pipe(v.string(), v.domain('URL inválida')), v.literal('')]),
    image_url: v.union([v.pipe(v.string(), v.domain('URL inválida')), v.literal('')]),
    notes: v.optional(v.pipe(v.string(), v.maxLength(512, 'Las notas deben tener menos de 512 caracteres')))
})

const validate = (value: string | number | undefined, key: 'name' | 'sku' | 'description' | 'category_id' | 'manufacturer_id' | 'stock' | 'stock_min' | 'datasheet_url' | 'image_url' | 'notes') => {
    const result = v.safeParse(componentSchema.entries[key], value);
    return result.issues?.[0]?.message || '';
}

interface ComponentFormProps {
    target?: Component | null;
    setImage: (image: File | null) => void;
    setFile: (file: File | null) => void;
}

export default function ComponentForm({ target, setImage, setFile }: ComponentFormProps) {
    const [imgContent, setImgContent] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<{name: string, type: string} | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fileErrorMsg, setFileErrorMsg] = useState<string | null>(null);
    const [targetCategoryFlag, setTargetCategoryFlag] = useState(false);
    const [targetManufacturerFlag, setManufacturerFlag] = useState(false);

    const categories = useAsyncList<Category>({
        async load({cursor}){
            const { data } = await fetchData<Category>(cursor || `/component-categories?limit=${paginationLimit + 1}&offset=0${target ? `&exclude=${target.category_id}` : ''}`);
            
            if(target && !targetCategoryFlag) {
                let res = await fetchData<Category>(`/component-categories/${target.category_id}`);
                setTargetCategoryFlag(true);
                data.content.unshift(res.data.content[0]);
            }
            return {
                items: data.content,
                cursor: data.links?.next
            }
        },
    });

    const manufacturers = useAsyncList<Manufacturer>({
        async load({cursor}){
            const { data } = await fetchData<Manufacturer>(cursor || `/manufacturers?limit=${paginationLimit}&offset=0${target ? `&exclude=${target.manufacturer_id}` : ''}`);
            
            if(target && !targetManufacturerFlag) {
                let res = await fetchData<Manufacturer>(`/manufacturers/${target.manufacturer_id}`);
                setManufacturerFlag(true);
                data.content.unshift(res.data.content[0]);
            }
            return {
                items: data.content,
                cursor: data.links?.next
            }
        },
    });

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
        <div className="w-full flex gap-8">
            <div className="w-3/8 flex flex-col gap-8">
                <div className='grid grid-cols-2 gap-8 '>
                    <div className='flex flex-col gap-2  aspect-square'>
                        <span className="text-base font-semibold" >Imagen</span>
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
                                    ? <AsyncImg className="w-full h-full !bg-transparent" src={imgContent || ('/' + target?.image_url)} alt=""/>
                                    :(
                                        <>
                                            <RiImageLine className="mx-auto" size={64} color="var(--color-text-muted)"/>
                                            <span>Arrastra o pega la imagen aquí</span>
                                        </>
                                    )}
                            </Text>
                        </DropZone>
                        {errorMessage && <span className="text-[var(--color-danger)] text-xs">{errorMessage}</span>}
                    </div>
                    <div className="flex flex-col gap-8">
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
                            isInvalid={categories.loadingState === 'loading'}
                            placeholder="Seleccione una categoría"
                            {...(target ? {defaultValue: target.category_id}: {})}
                            loadingState={categories.loadingState}
                            onLoadMore={categories.loadMore}
                            allowsEmptyCollection
                        >
                            {categories.items.map( (item) => <SelectItem key={item.id} id={item.id} >{item.name}</SelectItem>)}
                        </Select>
                        <Select
                            label="Fabricante"
                            name="manufacturer_id"
                            isRequired
                            errorMessage="Campo requerido"
                            placeholder="Seleccione un fabricante"
                            isInvalid={manufacturers.loadingState === 'loading'}
                            validate={(value) => validate(value, 'manufacturer_id')}
                            loadingState={manufacturers.loadingState}
                            onLoadMore={manufacturers.loadMore}
                            {...(target ? {defaultValue: target.manufacturer_id}: {})}
                            allowsEmptyCollection
                        >
                            {manufacturers.items.map( (item) => <SelectItem key={item.id} id={item.id} >{item.name}</SelectItem>)}
                        </Select>
                    </div>
                </div>
                
                <NumberField
                    label="Stock mínimo"
                    name="stock_min"
                    minValue={0}
                    maxValue={9999}
                    validate={(value) => validate(value, 'stock_min')}
                    {...(target ? {defaultValue: target.stock_min}: {defaultValue: 0})}
                />
                
                <div className='flex flex-col gap-2'>
                    <span className="text-base font-semibold" >Datasheet</span>
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
            </div>
            <div className="w-5/8 border-l-[2px] border-[var(--color-border)] pl-8">
                <QuillTextEditor
                    label="Descripción"
                    name="description"
                    defaultValue={target?.description || ''}
                />
            </div>
        </div>
    );
}
