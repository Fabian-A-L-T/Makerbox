import type { Manufacturer } from "@utils/schemas";
import TextField from "@components/form/TextField";
import * as v from 'valibot';

export const manufacturerSchema = v.object({
    name: v.pipe(v.string(), v.nonEmpty('El nombre es requerido'), v.maxLength(64, 'El nombre debe tener menos de 64 caracteres')),
    website: v.union([v.pipe(v.string(), v.url('URL inválida')), v.literal('')])
})

const validate = (value: string, key: 'name' | 'website') => {
    const result = v.safeParse(manufacturerSchema.entries[key], value);
    return result.issues?.[0]?.message || '';
}

export default function ManufacturerForm({target}: {target?: Manufacturer | null}) {
    return (
        <>
            <TextField
                label="Nombre"
                placeholder="Ej: Texas Instruments"
                isRequired
                validate={(value) => validate(value, 'name')}
                name="name"
                {...(target ? {defaultValue: target.name}: {})}
            />
            <TextField
                label="Sitio web del fabricante"
                placeholder="Ej: ejemplo.com"
                validate={(value) => validate(value, 'website')}
                name="website"
                {...(target ? {defaultValue: target.website}: {})}
            />
        </>
    )
}
