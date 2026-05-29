import TextField from '@components/form/TextField';
import { Select, SelectItem } from '@components/form/Select';
import { join, split } from 'lodash';
import { type Category } from '@utils/schemas';
import * as v from 'valibot';

const categorySchema = v.object({
    name: v.pipe(v.string(), v.nonEmpty('Campo requerido'), v.minLength(3, 'Nombre no puede tener menos de 3 caracteres'), v.maxLength(64, 'Nombre no puede tener mas de 64 caracteres')),
    path: v.pipe(v.string(), v.nonEmpty('Campo requerido')),
    description: v.pipe(v.string(), v.maxLength(64, 'Nombre no puede tener mas de 512 caracteres'))
})

const validate = (value: string | number | undefined, key: 'name' | 'description' | 'path' ) => {
    const result = v.safeParse(categorySchema.entries[key], value);
    return result.issues?.[0]?.message || '';
}

interface CategoryFormProps {
    target?: Category | null;
    allCategories: Category[];
}

export default function CategoryForm({ target, allCategories }: CategoryFormProps) {
    let filteredCategories: Category[] = allCategories;
    let path: string | undefined;
    let parent: string | undefined;

    if(target){
        filteredCategories = allCategories.filter((value) => target?.id != value.id && !value.path.startsWith(target?.path as string));
        let splitted = split(target?.path, '.');
        path = splitted.pop();
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
                placeholder="Ingrese el nombre de la categoría"
            />
            <TextField
                label="Path"
                isRequired
                {...(target ? {defaultValue: path} : {})}
                validate={(value) => validate(value, 'path')}
                name="path"
                placeholder="Ingrese el path de la categoría"
            />
            {filteredCategories.length > 0 && (
                <Select
                    label="Categoría padre"
                    name="parent"
                    {...(target ? {defaultValue: parent} : {})}
                    placeholder="Seleccione una categoría"
                >
                    <SelectItem key='' id=''>Sin categoría padre</SelectItem>
                    {filteredCategories.map( (item) => <SelectItem key={item.id} id={item.path} >{item.name}</SelectItem>)}
                </Select>
            )}
        </>
    );
}
