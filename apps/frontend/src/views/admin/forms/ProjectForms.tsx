import { useState } from "react";
import type { Project } from "../../../interfaces/schemas";
import TextField from "@components/form/TextField";
import { DropZone, Text, type DropEvent } from "@components/ReactAria/DropZone";
import * as v from 'valibot';
import { RiCloseLine, RiImageLine } from "@remixicon/react";
import { validateImgSize } from "@utils/Utils";
import { CalendarDate, getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { AsyncImg } from "@utils/Utils";
import { DatePicker } from "@components/form/DatePicker";
import QuillTextEditor from "@components/form/QuillTextEditor";
import { Separator } from "@components/ui/Separator";
import { Button } from "@components/form/Button";

const projectSchema = v.object({
    name: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.maxLength(64, 'El nombre debe tener menos de 64 caracteres')),
    description: v.optional(v.pipe(v.string(), v.maxLength(512, 'La descripción debe tener menos de 512 caracteres'))),
    start_date: v.date(),
    state: v.picklist(['planning', 'active', 'paused', 'completed', 'cancelled']),
    end_date_estimated: v.date(),
    end_date_real: v.date(),
    budget: v.pipe(v.number(), v.minValue(0), v.maxValue(999999999999)),
    repository_url: v.union([v.pipe(v.string(), v.domain('URL inválida')), v.literal('')]),
    image_url: v.union([v.pipe(v.string(), v.domain('URL inválida')), v.literal('')]),
})

const validate = (value: string | number | Date | undefined, key: 'name' | 'description' | 'state' |'start_date' | 'end_date_estimated' | 'repository_url' | 'image_url') => {
    const result = v.safeParse(projectSchema.entries[key], value);
    return result.issues?.[0]?.message || '';
}

interface ProjectFormProps {
    target: Project;
    isPending: boolean;
    setImage: (image: File | null) => void;
}

export default function ProjectForm({ target, isPending, setImage }: ProjectFormProps) {
    const [imgContent, setImgContent] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState(target?.image_url || '');
    const [deletedImageUrl, setDeletedImageUrl] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    let fStartDate, fEstimatedEndDate;
    if(target.start_date) fStartDate = new Date(target.start_date).toISOString().split('T')[0];
    if(target.end_date_estimated) fEstimatedEndDate = new Date(target.end_date_estimated).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState<CalendarDate | null>(target?.start_date ? parseDate(fStartDate!) : null);
    const [endDate, setEndDate] = useState<CalendarDate | null>(target?.end_date_estimated ? parseDate(fEstimatedEndDate!) : null);

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
                    <div className='flex flex-col gap-1 w-2xs aspect-square col-span-2'>
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
                    <div className="flex-auto flex flex-col gap-5 col-span-3">
                        <TextField
                            autoFocus
                            label="Nombre del proyecto"
                            minLength={3}
                            maxLength={200}
                            isRequired
                            name="name"
                            isDisabled={isPending}
                            validate={(value) => validate(value, 'name')}
                            {...(target ? {defaultValue: target.name}: {})}
                        />
                        {/* <NumberField
                            label="Presupuesto"
                            name="budget"
                            formatOptions={{style: "currency", currency: "CLP", currencyDisplay: "narrowSymbol"}}
                            minValue={0}
                            maxValue={999999999999}
                            isDisabled={isPending}
                            {...(target ? {defaultValue: Number(target.budget)}: {})}
                        /> */}
                        <TextField
                            label="URL del repositorio"
                            name="repository_url"
                            type="url"
                            minLength={3}
                            maxLength={200}
                            isDisabled={isPending}
                            {...(target ? {defaultValue: target.repository_url}: {})}
                        />
                        
                    </div>
                    
                </div>
                <DatePicker label="Fecha de inicio del proyecto"
                    name="start_date"
                    value={startDate}
                    isRequired
                    onChange={(value) => {
                        setStartDate(value);
                        setEndDate(null);
                    }}
                    isDisabled={isPending}
                    validate={(value) => validate(value.toDate('America/Santiago'), 'start_date')}
                    {...(target?.start_date ? {defaultValue: parseDate(fStartDate!)}: {})}
                    maxValue={today(getLocalTimeZone())} />
                {startDate &&
                    <DatePicker label="Fecha estimada de finalización"
                        name="end_date_real"
                        value={endDate}
                        onChange={(value) => setEndDate(value)}
                        minValue={startDate}
                        isDisabled={isPending}
                        validate={(value) => validate(value.toDate('America/Santiago'), 'end_date_estimated')}
                        {...(target?.end_date_estimated ? {defaultValue: parseDate(fEstimatedEndDate!)}: {})}/>
                }
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
