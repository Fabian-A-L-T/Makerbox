import { useState } from "react";
import type { Tool, Category, Manufacturer, Location } from "../../../interfaces/schemas";
import TextField from "@components/form/TextField";
import { Select, SelectItem } from "@components/form/Select";
import { DropZone, Text, type DropEvent } from "@components/ReactAria/DropZone";
import * as v from 'valibot';
import { RiImageLine, RiFileTextLine, RiFileWord2Line } from "@remixicon/react";
import { last, split } from "lodash";
import { DateField } from "@components/form/DateField";
import { parseDate } from '@internationalized/date';
import { fetchData, paginationLimit, validateImgSize } from "@utils/Utils";
import { useAsyncList } from "react-aria-components";
import { AsyncImg } from "@utils/Utils";

const toolSchema = v.object({
    name: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.maxLength(64, 'El nombre debe tener menos de 64 caracteres')),
    sku: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.maxLength(10, 'El SKU debe tener menos de 10 caracteres')),
    model: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.minLength(3, 'El modelo debe tener almenos 3 caracteres'), v.maxLength(100, 'El modelo debe tener menos de 100 caracteres')),
    serial_number: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.minLength(3, 'El modelo debe tener almenos 3 caracteres'), v.maxLength(100, 'El modelo debe tener menos de 100 caracteres')),
    category_id: v.number(),
    manufacturer_id: v.number(),
    location_id: v.number(),
    manual_url: v.union([v.pipe(v.string(), v.domain('URL inválida')), v.literal('')]),
    image_url: v.union([v.pipe(v.string(), v.domain('URL inválida')), v.literal('')]),
    state: v.picklist(['available', 'in_use', 'maintenance', 'disposed', 'lent']),
    acquisition_date: v.date(),
    calibration_required: v.pipe(v.string(), v.toBoolean()),
    next_calibration_date: v.date(),
    notes: v.optional(v.pipe(v.string(), v.maxLength(512, 'Las notas deben tener menos de 512 caracteres')))
});

const validate = (value: string | number | Date | undefined, key: 'name' | 'sku' | 'model' | 'serial_number' | 'category_id' | 'manufacturer_id' | 'location_id' | 'manual_url' | 'image_url' | 'state' | 'acquisition_date' | 'calibration_required' | 'next_calibration_date' | 'notes') => {
    const result = v.safeParse(toolSchema.entries[key], value);
    return result.issues?.[0]?.message || '';
}

interface ToolFormProps {
    target?: Tool | null;
    setImage: (image: File | null) => void;
    setFile: (file: File | null) => void;
}

export default function ToolForm({ target, setImage, setFile }: ToolFormProps) {
    const [imgContent, setImgContent] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<{name: string, type: string} | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fileErrorMsg, setFileErrorMsg] = useState<string | null>(null);
    const [targetCategoryFlag, setTargetCategoryFlag] = useState(false);
    const [targetManufacturerFlag, setManufacturerFlag] = useState(false);
    const [targetLocationFlag, setLocationFlag] = useState(false);

    let fAcquisitionDate, fCalibDate;
    if(target) {
        if(target.acquisition_date) fAcquisitionDate = new Date(target.acquisition_date).toISOString().split('T')[0];
        if(target.next_calibration_date) fCalibDate = new Date(target.next_calibration_date).toISOString().split('T')[0];
    }
    
    const categories = useAsyncList<Category>({
        async load({cursor}){
            const { data } = await fetchData<Category>(cursor || `/tool-categories?limit=${paginationLimit + 1}&offset=0${target ? `&exclude=${target.category_id}` : ''}`);
            
            if(target && !targetCategoryFlag) {
                let res = await fetchData<Category>(`/tool-categories/${target.category_id}`);
                console.log(res.data)
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
            const { data } = await fetchData<Manufacturer>(cursor || `/manufacturers?limit=${paginationLimit + 1}&offset=0${target ? `&exclude=${target.manufacturer_id}` : ''}`);
            
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

    const locations = useAsyncList<Location>({
        async load({cursor}){
            const { data } = await fetchData<Location>(cursor || `/locations?limit=${paginationLimit + 1}&offset=0${target ? `&exclude=${target.location_id}` : ''}`);
            
            if(target && !targetLocationFlag) {
                let res = await fetchData<Location>(`/locations/${target.location_id}`);
                setLocationFlag(true);
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
        <>
            <div className='grid grid-cols-5 gap-8 '>
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
                                ? <AsyncImg className="w-full h-full !bg-transparent" src={imgContent || ('/' + target?.image_url)} alt=""/>
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
                <div className="flex flex-col gap-8 col-span-3">
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
                    <TextField
                        label="Modelo"
                        isRequired
                        name="model"
                        validate={(value) => validate(value, 'model')}
                        {...(target ? {defaultValue: target.model}: {})}
                    />
                    <TextField
                        label="Número de serie"
                        isRequired
                        name="serial_number"
                        validate={(value) => validate(value, 'serial_number')}
                        {...(target ? {defaultValue: target.serial_number}: {})}
                    />
                </div>
            </div>
            <Select
                label="Categoría"
                name="category_id"
                isRequired
                errorMessage="Campo requerido"
                placeholder="Seleccione una categoría"
                isInvalid={categories.loadingState === 'loading'}
                validate={(value) => validate(value, 'category_id')}
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
                {...(target ? {defaultValue: target.manufacturer_id}: {})}
                loadingState={manufacturers.loadingState}
                onLoadMore={manufacturers.loadMore}
                allowsEmptyCollection
            >
                {manufacturers.items.map( (item) => <SelectItem key={item.id} id={item.id} >{item.name}</SelectItem>)}
            </Select>
            <Select
                label="Ubicaciones"
                name="location_id"
                isRequired
                errorMessage="Campo requerido"
                placeholder="Seleccione una ubicación"
                isInvalid={locations.loadingState === 'loading'}
                validate={(value) => validate(value, 'location_id')}
                {...(target ? {defaultValue: target.location_id}: {})}
                loadingState={locations.loadingState}
                onLoadMore={locations.loadMore}
                allowsEmptyCollection
            >
                {locations.items.map( (item) => <SelectItem key={item.id} id={item.id} >{item.name}</SelectItem>)}
            </Select>
            <Select
                label="Estado"
                name="state"
                isRequired
                errorMessage="Campo requerido"
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
            <DateField 
                label="Fecha de adquisición"
                name="acquisition_date"
                validate={(value) => validate(value.toDate('America/Santiago'), 'acquisition_date')}
                {...(target?.acquisition_date ? {defaultValue: parseDate(fAcquisitionDate!)}: {})}
            />
            <div className='flex flex-col gap-2'>
                <span className="text-sm font-semibold" >Manual</span>
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
                        {fileContent || target?.manual_url
                            ? <div>
                                {fileContent?.type === 'application/pdf' || (target?.manual_url.endsWith('.pdf') || target?.manual_url.endsWith('.PDF') )
                                    ? <RiFileTextLine className="mx-auto mb-2" size={64} color="var(--color-success)"/>
                                    : <RiFileWord2Line className="mx-auto mb-2" size={64} color="var(--color-success)"/>}
                                <span className="font-semibold italic text-[var(--color-success)]">{fileContent ? fileContent.name : last(split(target?.manual_url ,'\\'))}</span>
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
            <DateField 
                label="Próxima calibración"
                name="next_calibration_date"
                validate={(value) => validate(value.toDate('America/Santiago'), 'next_calibration_date')}
                {...(target?.next_calibration_date ? {defaultValue: parseDate(fCalibDate!)}: {})}
            />
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
