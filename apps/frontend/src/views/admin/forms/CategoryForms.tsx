import TextField from '@components/form/TextField';
import { Select, SelectItem } from '@components/form/Select';
import { join, split } from 'lodash';
import { type Category } from '../../../interfaces/schemas';
import * as v from 'valibot';
import { useAsyncList } from 'react-aria-components';
import { fetchData, paginationLimit } from '@utils/Utils';
import { useState } from 'react';

const categorySchema = v.object({
    name: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ ][a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ ]+$/, 'Nombre inválido'), v.minLength(3, 'Nombre no puede tener menos de 3 caracteres'), v.maxLength(64, 'Nombre no puede tener mas de 64 caracteres'))
})

const validate = (value: string | undefined, key: 'name' ) => {
    const result = v.safeParse(categorySchema.entries[key], value);
    return result.issues?.[0]?.message || '';
}

export default function CategoryForm({ target, isPending, type }:{target?: Category | null, isPending: boolean, type: 'component' | 'tool'}) {
    const [parent, setParent] = useState<{path: string, name: string} | undefined>();
    const [initialCategoriesFlag, setInitialCategoriesFlag] = useState(false);
    
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

    //Fetch categories for select field
    const categories = useAsyncList<Category>({
        async load({cursor}){
            let filtered: Category[] | undefined;
            const data = await fetchData<Category>(cursor || `/api/${type}-categories?limit=${paginationLimit}&offset=0${target ? `&exclude=${target.id}` : ''}`);
            
            if(!initialCategoriesFlag) {
                setInitialCategoriesFlag(true);
                data.content.unshift({id: 0, path: ' ', name: 'Sin categoría padre'});
                if (parent) data.content.unshift({id: -1, path: parent.path, name: parent.name});
            }

            if(target) filtered = data.content.filter((value) => !value.path.startsWith(target.path) && value.id !== -1);

            return {
                items: filtered || data.content,
                cursor: data.links?.next
            }
        },
    });

    return (
        <div className="flex flex-col gap-5 w-lg">
            <TextField
                autoFocus
                label="Nombre de la categoría"
                isRequired
                {...(target ? {defaultValue: target.name} : {})}
                isDisabled={isPending}
                validate={(value) => validate(value, 'name')}
                name="name"
            />
            <Select
                label="Categoría padre"
                name="parent"
                {...(parent ? {defaultValue: parent.path} : {defaultValue: ' '})}
                placeholder="Seleccione una categoría"
                isDisabled={isPending}
                loadingState={categories.loadingState}
                onLoadMore={categories.loadMore}
            >
                {categories.items.map( (item) => <SelectItem key={item.id} id={item.path} >{item.name}</SelectItem>)}
            </Select>
        </div>
    );
}
