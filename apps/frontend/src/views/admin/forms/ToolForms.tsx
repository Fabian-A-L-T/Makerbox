import { useState } from "react";
import type { Tool, Category, Manufacturer, Location } from "../../../interfaces/schemas";
import TextField from "@components/form/TextField";
import { Select, SelectItem } from "@components/form/Select";
import { DropZone, Text, type DropEvent } from "@components/ReactAria/DropZone";
import * as v from 'valibot';
import { RiImageLine, RiFileTextLine, RiFileWord2Line, RiCloseLine } from "@remixicon/react";
import { last, split } from "lodash";
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { fetchData, paginationLimit, validateImgSize } from "@utils/Utils";
import { useAsyncList } from "react-aria-components";
import { AsyncImg } from "@utils/Utils";
import { DatePicker } from "@components/form/DatePicker";
import QuillTextEditor from "@components/form/QuillTextEditor";
import { Separator } from "@components/ui/Separator";
import { Button } from "@components/form/Button";

const toolSchema = v.object({
    name: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.maxLength(64, 'El nombre debe tener menos de 64 caracteres')),
    sku: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.maxLength(10, 'El SKU debe tener menos de 10 caracteres')),
    model: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.minLength(3, 'El modelo debe tener al menos 3 caracteres'), v.maxLength(100, 'El modelo debe tener menos de 100 caracteres')),
    serial_number: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.minLength(3, 'El modelo debe tener al menos 3 caracteres'), v.maxLength(100, 'El modelo debe tener menos de 100 caracteres')),
    category_id: v.number(),
    manufacturer_id: v.number(),
    location_id: v.number(),
    manual_url: v.union([v.pipe(v.string(), v.domain('URL inválida')), v.literal('')]),
    image_url: v.union([v.pipe(v.string(), v.domain('URL inválida')), v.literal('')]),
    state: v.picklist(['available', 'in_use', 'maintenance', 'disposed', 'lent']),
    acquisition_date: v.date(),
    description: v.optional(v.pipe(v.string(), v.maxLength(5000, 'La descripción debe tener menos de 5000 caracteres'))),
    notes: v.optional(v.pipe(v.string(), v.maxLength(500, 'Las notas deben tener menos de 500 caracteres')))
});

const validate = (value: string | number | Date | undefined, key: 'name' | 'sku' | 'model' | 'serial_number' | 'category_id' | 'manufacturer_id' | 'location_id' | 'manual_url' | 'image_url' | 'state' | 'acquisition_date' | 'notes') => {
    const result = v.safeParse(toolSchema.entries[key], value);
    return result.issues?.[0]?.message || '';
}

interface ToolFormProps {
    target?: Tool | null;
    isPending: boolean;
    setImage: (image: File | null) => void;
    setFile: (file: File | null) => void;
}

export default function ToolForm({ target, setImage, isPending, setFile }: ToolFormProps) {
    const [imgContent, setImgContent] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState(target?.image_url || '');
    const [deletedImageUrl, setDeletedImageUrl] = useState('');
    const [fileContent, setFileContent] = useState<{name: string, type: string} | null>(null);
    const [manualUrl, setManualUrl] = useState(target?.manual_url || '');
    const [deletedManualUrl, setDeletedManualUrl] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fileErrorMsg, setFileErrorMsg] = useState<string | null>(null);
    const [targetCategoryFlag, setTargetCategoryFlag] = useState(false);
    const [targetManufacturerFlag, setManufacturerFlag] = useState(false);
    const [targetLocationFlag, setLocationFlag] = useState(false);

    let fAcquisitionDate;
    if(target) {
        if(target.acquisition_date) fAcquisitionDate = new Date(target.acquisition_date).toISOString().split('T')[0];
    }
    
    const categories = useAsyncList<Category>({
        async load({cursor}){
            const data = await fetchData<Category>(cursor || `/api/tool-categories?limit=${paginationLimit + 1}&offset=0${target ? `&exclude=${target.category_id}` : ''}`);
            
            if(target && !targetCategoryFlag) {
                let res = await fetchData<Category>(`/api/tool-categories/${target.category_id}`);
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
            const data = await fetchData<Manufacturer>(cursor || `/api/manufacturers?limit=${paginationLimit + 1}&offset=0${target ? `&exclude=${target.manufacturer_id}` : ''}`);
            
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

    const locations = useAsyncList<Location>({
        async load({cursor}){
            const data = await fetchData<Location>(cursor || `/api/locations?limit=${paginationLimit + 1}&offset=0${target ? `&exclude=${target.location_id}` : ''}`);
            
            if(target && !targetLocationFlag) {
                let res = await fetchData<Location>(`/api/locations/${target.location_id}`);
                setLocationFlag(true);
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
                <div className='flex gap-5'>
                    <div className='flex flex-col gap-1 w-2xs aspect-square'>
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
                                        <AsyncImg className="w-full h-full !bg-transparent" src={imgContent || ('/' + imageUrl)} alt=""/>
                                    </div>
                                    :(
                                        <>
                                            <RiImageLine className="mx-auto" size={64} color="var(--color-text-muted)"/>
                                            <span>Arrastra la imagen aquí</span>
                                        </>
                                    )}
                            </Text>
                            <TextField isDisabled={isPending} name="image_url" value={imageUrl} hidden/>
                            <TextField isDisabled={isPending} name="deleted_image_url" value={deletedImageUrl} hidden/>
                        </DropZone>
                        {errorMessage && <span className="text-[var(--color-danger)] text-xs">{errorMessage}</span>}
                    </div>
                    <div className="flex-auto flex flex-col gap-5">
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
                        <TextField
                            label="Modelo"
                            isRequired
                            name="model"
                            isDisabled={isPending}
                            validate={(value) => validate(value, 'model')}
                            {...(target ? {defaultValue: target.model}: {})}
                        />
                        <TextField
                            label="Número de serie"
                            isRequired
                            name="serial_number"
                            isDisabled={isPending}
                            validate={(value) => validate(value, 'serial_number')}
                            {...(target ? {defaultValue: target.serial_number}: {})}
                        />
                    </div>
                </div>
                <Select
                    label="Categoría"
                    name="category_id"
                    isRequired
                    items={categories.items}
                    isDisabled={isPending}
                    placeholder="Seleccione una categoría"
                    validate={(value) => validate(value, 'category_id')}
                    {...(target ? {defaultValue: target.category_id}: {})}
                    {...(!categories.items.length && categories.loadingState !== 'loading' ? { isInvalid: true } : {})}
                    errorMessage={({ validationErrors}) => {
                        if(!categories.items.length) return "No se han encontrado categorías registradas en el sistema. Ir a Categorías > Herramientas para registrar uno";
                        else if (validationErrors && validationErrors.length > 0) return validationErrors.flat().join(', ');
                        return "Campo requerido";
                    }}
                    loadingState={categories.loadingState}
                    onLoadMore={categories.loadMore}
                >
                    { (item) => <SelectItem id={item.id} >{item.name}</SelectItem>}
                </Select>
                <Select
                    label="Fabricante"
                    name="manufacturer_id"
                    isRequired
                    isDisabled={isPending}
                    items={manufacturers.items}
                    {...(!manufacturers.items.length && manufacturers.loadingState !== 'loading' ? { isInvalid: true } : {})}
                    errorMessage={({validationErrors}) => {
                        if(!manufacturers.items.length) return "No se han encontrado fabricantes registrados en el sistema. Ir a Fabricantes para registrar uno";
                        else if (validationErrors && validationErrors.length > 0) return validationErrors.flat().join(', ');
                        return "Campo requerido";
                    }}
                    placeholder="Seleccione un fabricante"
                    validate={(value) => validate(value, 'manufacturer_id')}
                    {...(target ? {defaultValue: target.manufacturer_id}: {})}
                    loadingState={manufacturers.loadingState}
                    onLoadMore={manufacturers.loadMore}
                >
                    {(item) => <SelectItem id={item.id} >{item.name}</SelectItem>}
                </Select>
                <Select
                    label="Ubicaciones"
                    name="location_id"
                    isRequired
                    isDisabled={isPending}
                    items={locations.items}
                    placeholder="Seleccione una ubicación"
                    {...(!locations.items.length && locations.loadingState !== 'loading' ? { isInvalid: true } : {})}
                    validate={(value) => {
                        if(value) validate(value, 'location_id');
                        else return "Campo requerido";
                    }}
                    {...(target ? {defaultValue: target.location_id}: {})}
                    errorMessage={({validationErrors}) => {
                        if(!locations.items.length) return "No se han encontrado ubicaciones registradas en el sistema. Ir a Ubicaciones para registrar uno";
                        else if (validationErrors && validationErrors.length > 0) return validationErrors.flat().join(', ');
                        return "Ha ocurrido un error";
                    }}
                    loadingState={locations.loadingState}
                    onLoadMore={locations.loadMore}
                >
                    {(item) => <SelectItem id={item.id} >{item.name}</SelectItem>}
                </Select>
                <Select
                    label="Estado"
                    name="state"
                    isRequired
                    isDisabled={isPending}
                    placeholder="Seleccione un estado"
                    validate={(value) => validate(value, 'state')}
                    {...(target ? {defaultValue: target.state}: {})}
                >
                    <SelectItem id='available'>Disponible</SelectItem>
                    <SelectItem id='in_use'>En uso</SelectItem>
                    <SelectItem id='maintenance'>En mantenimiento</SelectItem>
                    <SelectItem id='disposed'>Desechado</SelectItem>
                    <SelectItem id='lent'>Prestado</SelectItem>
                </Select>
                <DatePicker label="Fecha de adquisición"
                    name="acquisition_date"
                    isDisabled={isPending}
                    validate={(value) => validate(value.toDate('America/Santiago'), 'acquisition_date')}
                    {...(target?.acquisition_date ? {defaultValue: parseDate(fAcquisitionDate!)}: {})}
                    maxValue={today(getLocalTimeZone())}
                    isRequired />
                <div className='flex flex-col gap-1'>
                    <span className="text-base" >Manual</span>
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
                            {fileContent || manualUrl
                                ? <div className="relative p-4">
                                    <div className="absolute top-2 right-2">
                                        <Button className="p-1 size-[30px]" onPress={() => {
                                            if(manualUrl) {
                                                setDeletedManualUrl(manualUrl);
                                                setManualUrl('');
                                            }
                                            setFileContent(null);
                                            setFile(null);
                                        }}>
                                            <RiCloseLine />
                                        </Button>
                                    </div>
                                    {fileContent?.type === 'application/pdf' || (manualUrl.endsWith('.pdf') || manualUrl.endsWith('.PDF') )
                                        ? <RiFileTextLine className="mx-auto mb-2" size={64} color="var(--color-success)"/>
                                        : <RiFileWord2Line className="mx-auto mb-2" size={64} color="var(--color-success)"/>}
                                    <span className="font-semibold italic text-[var(--color-success)]">{fileContent ? fileContent.name : last(split(manualUrl ,'\\'))}</span>
                                    </div>
                                : <div className="p-4">
                                    <RiFileTextLine className="mx-auto" size={64} color="var(--color-text-muted)"/>
                                    <span>Arrastra el manual aquí</span>
                                </div>
                            }
                        </Text>
                        <TextField isDisabled={isPending} name="manual_url" value={manualUrl} hidden/>
                        <TextField isDisabled={isPending} name="deleted_manual_url" value={deletedManualUrl} hidden/>
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
