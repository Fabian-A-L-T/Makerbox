import { useState } from "react";
import type { Component, Category, Manufacturer } from "../../../interfaces/schemas";
import TextField from "@components/form/TextField";
import { Select, SelectItem } from "@components/form/Select";
import { DropZone, Text, type DropEvent } from "@components/ReactAria/DropZone";
import * as v from 'valibot';
import { RiImageLine, RiFileTextLine, RiFileWord2Line, RiCloseLine } from "@remixicon/react";
import { NumberField } from "@components/form/NumberField";
import QuillTextEditor from "@components/form/QuillTextEditor";
import { last, split } from "lodash";
import { fetchData, paginationLimit, validateImgSize } from "@utils/Utils";
import { useAsyncList } from "react-aria-components";
import { AsyncImg } from "@utils/Utils";
import { Separator } from "@components/ui/Separator";
import { Button } from "@components/form/Button";

const componentSchema = v.object({
    name: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.maxLength(64, 'El nombre debe tener menos de 64 caracteres')),
    sku: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.maxLength(10, 'El SKU debe tener menos de 10 caracteres')),
    description: v.optional(v.pipe(v.string(), v.maxLength(5000, 'La descripción debe tener menos de 5000 caracteres'))),
    category_id: v.number(),
    manufacturer_id: v.number(),
    stock: v.pipe(v.number('Debe ser un número valido'), v.minValue(0, 'El stock debe ser un número positivo'), v.maxValue(9999, 'El stock debe ser un número menor a 9999')),
    stock_min: v.pipe(v.number('Debe ser un número valido'), v.minValue(0, 'El stock mínimo debe ser un número positivo'), v.maxValue(9998, 'El stock mínimo debe ser un número menor a 9998')),
    unit_cost: v.pipe(v.number('Debe ser un número valido'), v.minValue(0, 'El stock mínimo debe ser un número positivo'), v.maxValue(999999999, 'El stock mínimo debe ser un número menor a 9998')),
    datasheet_url: v.union([v.pipe(v.string(), v.domain('URL inválida')), v.literal('')]),
    image_url: v.union([v.pipe(v.string(), v.domain('URL inválida')), v.literal('')]),
    notes: v.optional(v.pipe(v.string(), v.maxLength(500, 'Las notas deben tener menos de 500 caracteres')))
})

const validate = (value: string | number | undefined, key: 'name' | 'sku' | 'description' | 'category_id' | 'manufacturer_id' | 'stock' | 'stock_min' | 'unit_cost' |'datasheet_url' | 'image_url' | 'notes') => {
    const result = v.safeParse(componentSchema.entries[key], value);
    return result.issues?.[0]?.message || '';
}

interface ComponentFormProps {
    isPending: boolean;
    target?: Component | null;
    setImage: (image: File | null) => void;
    setFile: (file: File | null) => void;
}

export default function ComponentForm({ target, isPending, setImage, setFile }: ComponentFormProps) {
    const [imgContent, setImgContent] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState(target?.image_url || '');
    const [deletedImageUrl, setDeletedImageUrl] = useState('');
    const [fileContent, setFileContent] = useState<{name: string, type: string} | null>(null);
    const [datasheetUrl, setDatasheetUrl] = useState(target?.datasheet_url || '');
    const [deletedDatasheetUrl, setDeletedDatasheetUrl] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fileErrorMsg, setFileErrorMsg] = useState<string | null>(null);
    const [targetCategoryFlag, setTargetCategoryFlag] = useState(false);
    const [targetManufacturerFlag, setManufacturerFlag] = useState(false);

    const categories = useAsyncList<Category>({
        async load({cursor}){
            const data = await fetchData<Category>(cursor || `/api/component-categories?limit=${paginationLimit + 1}&offset=0${target ? `&exclude=${target.category_id}` : ''}`);
            
            if(target && !targetCategoryFlag) {
                let res = await fetchData<Category>(`/api/component-categories/${target.category_id}`);
                setTargetCategoryFlag(true);
                data.content.unshift(res.content[0]);
            }
            return {
                items: data.content,
                cursor: data.links?.next
            }
        },
    });

    const manufacturers = useAsyncList<Manufacturer>({
        async load({cursor}){
            const data = await fetchData<Manufacturer>(cursor || `/api/manufacturers?limit=${paginationLimit}&offset=0${target ? `&exclude=${target.manufacturer_id}` : ''}`);
            
            if(target && !targetManufacturerFlag) {
                let res = await fetchData<Manufacturer>(`/api/manufacturers/${target.manufacturer_id}`);
                setManufacturerFlag(true);
                data.content.unshift(res.content[0]);
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
                setDeletedDatasheetUrl('');
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
                setDeletedImageUrl('');
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
        <div className="flex gap-5">
            <div className="2xl:w-2xl xl:w-xl lg:w-lg flex flex-col gap-5">
                <div className='grid grid-cols-2 gap-5 '>
                    <div className='flex flex-col gap-1  aspect-square'>
                        <span className="text-base" >Imagen</span>
                        <DropZone
                            className='h-full'
                            getDropOperation={types => (
                                ['image/jpeg', 'image/png', 'image.gif', 'image/webp'].some(t => types.has(t))
                                ? 'copy'
                                : 'cancel'
                            )}
                            isDisabled={isPending}
                            onDrop={imageDropHandler}
                        >
                            <Text slot="label" className="text-sm text-center text-[var(--color-text-muted)]">
                                {imgContent || imageUrl
                                    ? <div className="relative">
                                        <div className="absolute top-2 right-2">
                                            <Button className="p-1 size-[30px]" onPress={() => {
                                                if(imageUrl) {
                                                    setDeletedImageUrl(imageUrl);
                                                    setImageUrl('');
                                                }
                                                setImgContent(null);
                                                setImage(null);
                                            }}>
                                                <RiCloseLine />
                                            </Button>
                                        </div>
                                        <AsyncImg className="w-full h-full !bg-transparent" src={imgContent || ('/' + imageUrl)} alt="Imagen del componente"/>
                                    </div>
                                    :(
                                        <>
                                            <RiImageLine className="mx-auto" size={64} color="var(--color-text-muted)"/>
                                            <span>Arrastra o pega la imagen aquí</span>
                                        </>
                                    )}
                            </Text>
                            <TextField isDisabled={isPending} name="image_url" value={imageUrl} hidden/>
                            <TextField isDisabled={isPending} name="deleted_image_url" value={deletedImageUrl} hidden/>
                        </DropZone>
                        {errorMessage && <span className="text-[var(--color-danger)] text-xs">{errorMessage}</span>}
                    </div>
                    <div className="flex flex-col gap-5">
                        <TextField
                            autoFocus
                            label="Nombre"
                            isRequired
                            name="name"
                            placeholder="Ej: Resistor"
                            isDisabled={isPending}
                            validate={(value) => validate(value, 'name')}
                            {...(target ? {defaultValue: target.name}: {})}
                        />
                        <TextField
                            label="SKU"
                            isRequired
                            name="sku"
                            placeholder="Ej: C-R-0001"
                            isDisabled={isPending}
                            validate={(value) => validate(value, 'sku')}
                            {...(target ? {defaultValue: target.sku}: {})}
                        />
                        <Select
                            label="Categoría"
                            name="category_id"
                            isRequired
                            errorMessage={({validationErrors}) => {
                                if(!categories.items.length) return "No se han encontrado categorías registradas en el sistema";
                                else if (validationErrors && validationErrors.length > 0) return validationErrors.flat().join(', ');
                                return "Ha ocurrido un error";
                            }}
                            isDisabled={isPending}
                            {...(!categories.items.length && categories.loadingState !== 'loading' ? { isInvalid: true } : {})}
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
                            isDisabled={isPending}
                            errorMessage={({validationErrors}) => {
                                if(!manufacturers.items.length) return "No se han encontrado fabricantes registrados en el sistema";
                                else if (validationErrors && validationErrors.length > 0) return validationErrors.flat().join(', ');
                                return "Ha ocurrido un error";
                            }}
                            placeholder="Seleccione un fabricante"
                            {...(!manufacturers.items.length && manufacturers.loadingState !== 'loading' ? { isInvalid: true } : {})}
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
                    isDisabled={isPending}
                    validate={(value) => validate(value, 'stock_min')}
                    {...(target ? {defaultValue: target.stock_min}: {defaultValue: 0})}
                />

                <NumberField
                    label="Costo unitario"
                    name="unit_cost"
                    formatOptions={{style: "currency", currency: "CLP", currencyDisplay: "narrowSymbol"}}
                    minValue={0}
                    maxValue={999999999}
                    isDisabled={isPending}
                    validate={(value) => validate(value, 'unit_cost')}
                    {...(target ? {defaultValue: target.unit_cost}: {defaultValue: 0})}
                />
                
                <div className='flex flex-col gap-1'>
                    <span className="text-base" >Datasheet</span>
                    <DropZone
                        className='h-full'
                        getDropOperation={types => (
                            ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'].some(t => types.has(t))
                            ? 'copy'
                            : 'cancel'
                        )}
                        isDisabled={isPending}
                        onDrop={fileDropHandler}
                    >
                        <Text slot="label" className="text-sm text-center text-[var(--color-text-muted)]">
                            {fileContent || datasheetUrl
                                ? <div className="relative p-4">
                                    <div className="absolute top-2 right-2">
                                        <Button className="p-1 size-[30px]" onPress={() => {
                                            if(datasheetUrl) {
                                                setDeletedDatasheetUrl(datasheetUrl);
                                                setDatasheetUrl('');
                                            }
                                            setFileContent(null);
                                            setFile(null);
                                        }}>
                                            <RiCloseLine />
                                        </Button>
                                    </div>
                                    {fileContent?.type === 'application/pdf' || (datasheetUrl.endsWith('.pdf') || datasheetUrl.endsWith('.PDF') )
                                        ? <RiFileTextLine className="mx-auto mb-2" size={64} color="var(--color-success)"/>
                                        : <RiFileWord2Line className="mx-auto mb-2" size={64} color="var(--color-success)"/>}
                                    <span className="font-semibold italic text-[var(--color-success)]">{fileContent ? fileContent.name : last(split(datasheetUrl ,'\\'))}</span>
                                    </div>
                                : 
                                    <div className="p-4">
                                        <RiFileTextLine className="mx-auto" size={64} color="var(--color-text-muted)"/>
                                        <span>Arrastra el datasheet aquí</span>
                                    </div>
                            }
                        </Text>
                        <TextField isDisabled={isPending} name="datasheet_url" value={datasheetUrl} hidden/>
                        <TextField isDisabled={isPending} name="deleted_datasheet_url" value={deletedDatasheetUrl} hidden/>
                    </DropZone>
                    {fileErrorMsg && <span className="text-[var(--color-danger)] text-xs">{fileErrorMsg}</span>}
                </div>
                <TextField
                    label="Notas"
                    name="notes"
                    type="textarea"
                    isDisabled={isPending}
                    validate={(value) => validate(value, 'notes')}
                    {...(target ? {defaultValue: target.notes}: {})}
                />
            </div>
            <Separator orientation="vertical" className="!h-auto !w-[2px]"/>
            <div className="2xl:w-4xl xl:w-2xl lg:w-xl">
                <QuillTextEditor
                    label="Descripción"
                    name="description"
                    defaultValue={target?.description || ''}
                />
            </div>
        </div>
    );
}
