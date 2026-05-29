import TextField from '@components/form/TextField';
import { Select, SelectItem } from '@components/form/Select';
import { string, minLength, maxLength, pipe, safeParse, object, number, email, picklist, nonEmpty } from 'valibot';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'technician' | 'reader';
    passwd: string;
}

const userSchema = object({
    id: number(),
    name: pipe(
        string(),
        nonEmpty('Campo requerido'),
        minLength(1, 'El nombre debe tener al menos 1 caracter'),
        maxLength(128, 'El nombre debe tener menos de 128 caracteres'),
    ),
    email: pipe(
        string(),
        nonEmpty('Campo requerido'),
        email('El correo debe ser valido'),
    ),
    role: pipe(
        string(),
        picklist(['admin', 'technician', 'reader'], 'El rol debe ser valido'),
    ),
    passwd: pipe(
        string(),
        nonEmpty('Campo requerido'),
        minLength(8, 'La contraseña debe tener al menos 8 caracteres'),
        maxLength(100, 'La contraseña debe tener menos de 100 caracteres'),
    ),
});

const validate = (value: string, field: 'name' | 'email' | 'role' | 'passwd') => {
    const result = safeParse(userSchema.entries[field], value);
    return result.success ? null : result.issues[0].message;
};

export function UserCreateForm(){
    return(
        <>
            <TextField
                autoFocus
                label="Nombre"
                isRequired
                validate={(value) => validate(value, 'name')}
                name="name"
            />
            <TextField
                label="Correo"
                isRequired
                autoComplete='off'
                validate={(value) => validate(value, 'email')}
                name="email"
            />
            <Select
                label="Rol"
                name="role"
                isRequired
                errorMessage='Campo requerido'
                validate={(value) => validate(value as string, 'role')}
                placeholder='Selecione rol'
            >
                <SelectItem key="admin" id="admin">
                    Administrador
                </SelectItem>
                <SelectItem key="technician" id="technician">
                    Técnico
                </SelectItem>
                <SelectItem key="reader" id="reader">
                    Lector
                </SelectItem>
            </Select>
            <TextField
                label="Contraseña"
                autoComplete='new-password'
                isRequired
                validate={(value) => validate(value, 'passwd')}
                name="passwd"
                type="password"
            />
        </>
    )
}

export function UserEditForm({user}: {user: User | null}){
    if (!user) return null;
    return(
        <>
            <TextField
                autoFocus
                label="Nombre"
                isRequired
                defaultValue={user.name}
                validate={(value) => validate(value, 'name')}
                name="name"
            />
            <Select
                label="Rol"
                name="role"
                isRequired
                defaultValue={user.role}
                validate={(value) => validate(value as string, 'role')}
                placeholder='Selecione rol'
                errorMessage='Campo requerido'
            >
                <SelectItem key="admin" id="admin">
                    Administrador
                </SelectItem>
                <SelectItem key="technician" id="technician">
                    Técnico
                </SelectItem>
                <SelectItem key="reader" id="reader">
                    Lector
                </SelectItem>
            </Select>
        </>
    )
}