import { useState } from "react";
import type { Project } from "../../../interfaces/schemas";
import TextField from "@components/form/TextField";
import { DropZone, Text, type DropEvent } from "@components/ReactAria/DropZone";
import * as v from 'valibot';
import { RiImageLine } from "@remixicon/react";
import { NumberField } from "@components/form/NumberField";
import { validateImgSize } from "@utils/Utils";
import { CalendarDate, getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { Select, SelectItem } from "@components/form/Select";
import { AsyncImg } from "@utils/Utils";
import { DatePicker } from "@components/form/DatePicker";

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
        <div className="w-3xl flex flex-col gap-5">
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
                    <Select
                        label="Estado"
                        name="state"
                        isRequired
                        placeholder="Seleccione un estado"
                        validate={(value) => validate(value, 'state')}
                        isDisabled={isPending}
                        {...(target ? {defaultValue: target.state}: {})}
                    >
                        <SelectItem id='planning'>En planificación</SelectItem>
                        <SelectItem id='active'>Activo</SelectItem>
                        <SelectItem id='paused'>Pausado</SelectItem>
                        <SelectItem id='completed'>Finalizado</SelectItem>
                        <SelectItem id='cancelled'>Cancelado</SelectItem>
                    </Select>
                    <NumberField
                        label="Presupuesto"
                        name="budget"
                        minValue={0}
                        maxValue={999999999999}
                        isDisabled={isPending}
                        {...(target ? {defaultValue: Number(target.budget)}: {})}
                    />
                    <TextField
                        label="URL del repositorio"
                        name="repository_url"
                        minLength={3}
                        maxLength={200}
                        validate={(value) => validate(value, 'repository_url')}
                        isDisabled={isPending}
                        {...(target ? {defaultValue: target.repository_url}: {})}
                    />
                    
                </div>
                
            </div>
            <TextField
                label="Descripción"
                name="description"
                type="textarea"
                maxLength={1000}
                validate={(value) => validate(value, 'description')}
                isDisabled={isPending}
                {...(target ? {defaultValue: target.description}: {})}
            />
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
    );
}
