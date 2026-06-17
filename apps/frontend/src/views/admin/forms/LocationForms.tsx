import TextField from '@components/form/TextField';
import { Select, SelectItem } from '@components/form/Select';
import * as v from 'valibot';
import { type Location } from '../../../interfaces/schemas';
import { join, split } from 'lodash';

const locationSchema = v.object({
    name: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ ][a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ ]+$/, 'Nombre inválido'), v.minLength(3, 'Nombre no puede tener menos de 3 caracteres'), v.maxLength(64, 'Nombre no puede tener mas de 64 caracteres')),
    description: v.pipe(v.string(), v.maxLength(64, 'Nombre no puede tener mas de 512 caracteres'))
})

const validate = (value: string | number | undefined, key: 'name' | 'description') => {
    const result = v.safeParse(locationSchema.entries[key], value);
    return result.issues?.[0]?.message || '';
}

interface LocationEditFormProps {
    target?: Location | null;
    allLocations: Location[];
}

export function LocationForm({target, allLocations}: LocationEditFormProps) {

    let filteredLocations: Location[] = allLocations;
    let parent: string | undefined;

    if(target){
        filteredLocations = allLocations.filter((value) => target?.id != value.id && !value.path.startsWith(target?.path as string));
        let splitted = split(target?.path, '.');
        splitted.pop();
        parent = join(splitted, '.');
    }
    
    return (
        <>
            <TextField
                autoFocus
                label="Nombre"
                isRequired
                {...(target ? {defaultValue: target.name} : {})}
                validate={(value) => validate(value, 'name')}
                name="name"
                placeholder="Ej: Escritorio"
            />
            <TextField
                label="Descripción"
                name="description"
                type='textarea'
                {...(target ? {defaultValue: target.description} : {})}
                validate={(value) => validate(value, 'description')}
            />
            {filteredLocations.length > 0 && (
                <Select
                    label="Ubicación padre"
                    name="parent"
                    placeholder="Seleccione una ubicación"
                    {...(target ? {defaultValue: parent} : {})}
                    items={filteredLocations}
                >
                    {item => <SelectItem id={item.path} >{item.name}</SelectItem>}
                </Select>
            )}
        </>
    );
}
