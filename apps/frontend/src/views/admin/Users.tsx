import { type ColumnDef } from '@components/ui/Table';
import CRUDLayout from '@components/layouts/CRUDLayout';
import { useCRUD } from '../../hooks/useCRUD';
import { UserCreateForm, UserEditForm } from './forms/UserForms';
import type { User } from '../../interfaces/schemas';
import {getRouteApi} from '@tanstack/react-router';
import CRUDTableActions from '@components/CRUDTableActions';
import type { AxiosResponse } from 'axios';
import { Breadcrumb, Breadcrumbs } from '@components/ui/Breadcrumbs';

export default function Users(){

    const route = getRouteApi('/_auth/manager/admin/users');
    const { page: currentPage } = route.useSearch();
    const {auth: {checkAuth}, pagination: {limit, maxPages}} = route.useRouteContext();
    const { data } = route.useLoaderData() as {data: Promise<AxiosResponse<User[]>>, test: Promise<string>};

    const crud = useCRUD<User>({ checkAuth, apiRoute: '/api/users', resourceLabel: 'usuario' });

    const userRoles = {
        admin: { label: 'Administrador', className: 'bg-red-500' },
        technician: { label: 'Técnico', className: 'bg-green-500' },
        reader: { label: 'Lector', className: 'bg-blue-500' }
    }
    
    const columns: ColumnDef<User>[] = [
        { key: 'id',       label: 'ID',     allowsSorting: true },
        { key: 'name',     label: 'Nombre', allowsSorting: true },
        { key: 'email',    label: 'Email',  allowsSorting: true },
        { key: 'role',     label: 'Rol',    allowsSorting: true, 
            render: (item) => (
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold text-white ${userRoles[item.role].className}`}>
                    {userRoles[item.role].label}
                </span>
            )
        },
        { key: 'actions',  label: 'Acciones',
            render: (item) => (
                <CRUDTableActions 
                    name={item.name} 
                    editAction={() => crud.openModal({ mode: 'put', target: item })}
                    deleteAction={() => crud.openModal({ mode: 'delete', target: item })}
                />
            ),
        },
    ];

    return(
        <>
        <Breadcrumbs className={'m-5 text-[var(--color-text)]'}>
            <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
            <Breadcrumb>Usuarios</Breadcrumb>
        </Breadcrumbs>
        <CRUDLayout<User>
            title="Usuarios"
            subtitle="Aquí puedes gestionar los usuarios del sistema"
            columns={columns}
            data={data}
            crud={crud}
            checkAuth={checkAuth}
            paginationData={{currentPage, limit, maxPages}}
            createForm={<UserCreateForm />}
            editForm={<UserEditForm user={crud.targetData} />}
        />
        </>
    )
}
