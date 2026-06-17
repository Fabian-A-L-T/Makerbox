import { useState } from 'react';
import axios, { type AxiosResponse } from 'axios';
import { type ColumnDef } from '@components/ui/Table';
import CRUDLayout from '@components/layouts/CRUDLayout';
import { useCRUD } from '../../hooks/useCRUD';
import { LocationForm } from './forms/LocationForms';
import type { Location } from '../../interfaces/schemas';
import {getRouteApi} from '@tanstack/react-router';
import CRUDTableActions from '@components/CRUDTableActions';
import { Breadcrumb, Breadcrumbs } from '@components/ui/Breadcrumbs';

const route = getRouteApi('/_auth/manager/admin/locations');

export default function Locations() {
    const { page: currentPage } = route.useSearch();
    const {auth: {checkAuth}, pagination: {limit, maxPages}} = route.useRouteContext();
    const { data } = route.useLoaderData() as {data: Promise<AxiosResponse<Location[]>>, test: Promise<string>};
    const [allLocations, setAllLocations] = useState<Location[]>([]);

    const crud = useCRUD<Location>({ checkAuth, apiRoute: '/api/locations', resourceLabel: 'ubicación',
        extraFetch: async () => {
            try{
                const response = await axios.get<Location[]>('/api/locations');
                setAllLocations(response.data);
            }
            catch(err:any){
                throw err;
            }
        },
    });

    const columns: ColumnDef<Location>[] = [
        { key: 'id',       label: 'ID',     allowsSorting: true },
        { key: 'name',     label: 'Nombre', allowsSorting: true },
        { key: 'path',     label: 'Ruta',   allowsSorting: true,
            render: (item) => {
                const route = item.path.replaceAll('_', ' ').replaceAll('.', ' > ');
                return (
                    <span className="text-sm text-[var(--color-text-muted)]">
                        {route}
                    </span>
                )},
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
    
    // Build the path including optional parent prefix before submit
    async function handleLocationSubmit(formData?: FormData) {

        try {
            if (formData && crud.modalMode !== 'delete') {
                const parentPath = formData.get('parent') as string | null;
                const path       = formData.get('name') as string;
                const SpacelessPath = path.replaceAll(' ', '_');

                if (parentPath) formData.set('path', `${parentPath}.${SpacelessPath}`);
                else formData.set('path', `${SpacelessPath}`);
                formData.delete('parent');
            }
            await crud.handleSubmit(formData);
        }
        catch (error: any) {
            throw new Error(error.response?.data?.error ?? error.message);
        }
    }

    return (
        <>
        <Breadcrumbs className={'m-5 text-[var(--color-text)]'}>
            <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
            <Breadcrumb>Ubicaciones</Breadcrumb>
        </Breadcrumbs>
        <CRUDLayout<Location>
            title="Ubicaciones"
            subtitle="Gestión de ubicaciones de componentes y herramientas"
            columns={columns}
            data={data}
            checkAuth={checkAuth}
            paginationData={{currentPage, limit, maxPages}}
            crud={{ ...crud, handleSubmit: handleLocationSubmit }}
            createForm={<LocationForm allLocations={allLocations} />}
            editForm={<LocationForm target={crud.targetData} allLocations={allLocations} />}
        />
        </>
    );
}
