import { useState } from 'react';
import { type AxiosResponse } from 'axios';
import { type ColumnDef } from '@components/ui/Table';
import type { Component, Location, Movement, Project } from '../../interfaces/schemas';
import { getRouteApi } from '@tanstack/react-router';
import { useCRUD } from '../../hooks/useCRUD';
import axios from 'axios';
import CRUDLayout from '@components/layouts/CRUDLayout';
import { Breadcrumb, Breadcrumbs } from '@components/ui/Breadcrumbs';
import MovementForm from '@views/admin/forms/MovementForms';

export default function Movements() {
    
    const route = getRouteApi('/_auth/manager/admin/movements');
    const { page: currentPage } = route.useSearch();
    const {auth: {user, checkAuth}, pagination: {limit, maxPages}} = route.useRouteContext();
    const {movements} = route.useLoaderData() as {movements: Promise<AxiosResponse<Movement[]>>};

    const [locations, setLocations] = useState<Location[]>([]);
    const [components, setComponents] = useState<Component[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    const crud = useCRUD<Movement>({checkAuth, apiRoute: '/api/movements', resourceLabel: 'movimiento',
        extraFetch: async () => {
            const locationsRes = await axios.get<Location[]>('/api/locations');
            setLocations(locationsRes.data);
            const componentsRes = await axios.get<Component[]>('/api/components');
            setComponents(componentsRes.data);
            const projectsRes = await axios.get<Project[]>('/api/projects');
            setProjects(projectsRes.data);
        }
    });
    
    const columns: ColumnDef<Movement>[] = [
        { key: 'id', label: 'ID', allowsSorting: true },
        { key: 'user_name', label: 'Usuario', allowsSorting: true },
        { key: 'component_name', label: 'Componente', allowsSorting: true },
        { key: 'component_id', label: 'Movimiento', allowsSorting: true, 
            render: (movement) => {
                let qtyChange = `unidad${movement.amount > 1 ? 'es' : ''}`;
                let movememtMsg = '';
                switch(movement.stock_type){
                    case 'entry': movememtMsg = `Ingresó ${movement.amount} ${qtyChange} a la ubicación "${movement.origin_location_name ?? 'Desconocida'}"`; break;
                    case 'reserve': movememtMsg = `reservó ${movement.amount} ${qtyChange} de la ubicación "${movement.origin_location_name ?? 'Desconocida'}" para el proyecto "${movement.project_name ?? 'Desconocido'}"`; break;
                    case 'return': movememtMsg = `devolvió ${movement.amount} ${qtyChange} del proyecto "${movement.project_name ?? 'Desconocido'}" hacia la ubicación "${movement.origin_location_name ?? 'Desconocida'}"`; break;
                    case 'transfer': movememtMsg = `transfirió ${movement.amount} ${qtyChange} de la ubicación "${movement.origin_location_name ?? 'Desconocida'}" a la ubicación "${movement.destination_location_name ?? 'Desconocida'}"`; break;
                    case 'disposal': movememtMsg = `desechó ${movement.amount} ${qtyChange} de la ubicación "${movement.origin_location_name ?? 'Desconocida'}"`; break;
                }
                return `${movememtMsg}`;
            }},
    ];

    async function handleMovementSubmit(formData?: FormData){
        try {
            crud.setIsSubmitting(true);
            formData?.append('user_id', user.id);
            await crud.handleSubmit(formData);

        } catch (error: any) {
            crud.setIsSubmitting(false);
            throw new Error(error.response?.data?.error ?? error.message);
        }
    }

    return (
        <>
        <Breadcrumbs className={'m-5 text-[var(--color-text)]'}>
            <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
            <Breadcrumb>Movimientos</Breadcrumb>
        </Breadcrumbs>
        <CRUDLayout<Movement>
            title="Movimientos" 
            subtitle="Gestión de movimientos de inventario"
            checkAuth={checkAuth}
            columns={columns}
            data={movements}
            paginationData={{currentPage, limit, maxPages}}
            crud={{...crud, handleSubmit: handleMovementSubmit}}
            createForm={<MovementForm components={components} locations={locations} projects={projects} />}
            editForm={<></>}
        />
        </>
    )
}
