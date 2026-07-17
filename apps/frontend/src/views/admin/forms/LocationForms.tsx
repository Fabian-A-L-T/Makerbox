import TextField from '@components/form/TextField';
import { Select, SelectItem } from '@components/form/Select';
import * as v from 'valibot';
import { type Location } from '../../../interfaces/schemas';
import { join, split } from 'lodash';
import { useAsyncList } from 'react-aria-components';
import { fetchData, paginationLimit } from '@utils/Utils';
import { useState } from 'react';

const locationSchema = v.object({
    name: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ ][a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ ]+$/, 'Nombre inválido'), v.minLength(3, 'Nombre no puede tener menos de 3 caracteres'), v.maxLength(64, 'Nombre no puede tener mas de 64 caracteres')),
    description: v.pipe(v.string(), v.maxLength(64, 'Nombre no puede tener mas de 512 caracteres'))
})

const validate = (value: string | number | undefined, key: 'name' | 'description') => {
    const result = v.safeParse(locationSchema.entries[key], value);
    return result.issues?.[0]?.message || '';
}

export function LocationForm({target}:{target?: Location | null;}) {
    const [parent, setParent] = useState<{path: string, name: string} | undefined>();
    const [initialLocationsFlag, setInitialLocationsFlag] = useState(false);

    //If target data exists, then extract the parent path and name
    if(!parent && target) {
        let splitted = split(target.path, '.');
        splitted.pop();
        if(splitted.length){
            const parentPath = join(splitted, '.');
            const parentName = splitted.pop()?.replaceAll('_', ' ');
            setParent({path: parentPath, name: parentName || ''})
        }
    }

    //Fetch locations for select field
    const locations = useAsyncList<Location>({
        async load({cursor}){
            let filteredData: Location[] | undefined;
            const { data } = await fetchData<Location>(cursor || `/locations?limit=${paginationLimit}&offset=0${target ? `&exclude=${target.id}` : ''}`);
            
            if(!initialLocationsFlag) {
                setInitialLocationsFlag(true);
                data.content.unshift({id: 0, description: '', path: ' ', name: 'Sin categoría padre'});
                if (parent) data.content.unshift({id: -1, description: '', path: parent.path, name: parent.name});
            }

            if(target) filteredData = data.content.filter((value) => !value.path.startsWith(target.path) && value.id !== -1);

            return {
                items: filteredData || data.content,
                cursor: data.links?.next
            }
        },
    });

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
            <Select
                label="Ubicación padre"
                name="parent"
                isInvalid={locations.loadingState === 'loading'}
                {...(parent ? {defaultValue: parent.path} : {defaultValue: ''})}
                placeholder="Seleccione una ubicación"
                loadingState={locations.loadingState}
                onLoadMore={locations.loadMore}
            >
                {locations.items.map( (item) => <SelectItem key={item.id} id={item.path} >{item.name}</SelectItem>)}
            </Select>
        </>
    );
}
