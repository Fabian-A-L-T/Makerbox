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
    const crud = useCRUD<Location>({ apiRoute: '/locations', resourceLabel: 'ubicación'});

    const columns: ColumnDef<Location>[] = [
        { key: 'id',       label: 'ID'},
        { key: 'name',     label: 'Nombre'},
        { key: 'path',     label: 'Ruta',
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
    function formDataTransform(formData?: FormData) {
        if (formData && crud.modalMode !== 'delete') {
            const parentPath = formData.get('parent') as string | null;
            const path       = formData.get('name') as string;
            const SpacelessPath = path.replaceAll(' ', '_');

            if (parentPath) formData.set('path', `${parentPath}.${SpacelessPath}`);
            else formData.set('path', `${SpacelessPath}`);
            formData.delete('parent');
        }
    }

    return (
        <>
        <Breadcrumbs className='m-5'>
            <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
            <Breadcrumb>Ubicaciones</Breadcrumb>
        </Breadcrumbs>
        <CRUDLayout<Location>
            title="Ubicaciones"
            subtitle="Gestión de ubicaciones de componentes y herramientas"
            columns={columns}
            currentPage={currentPage}
            crud={crud}
            formDataTransform={formDataTransform}
            createForm={<LocationForm />}
            editForm={<LocationForm target={crud.targetData} />}
        />
        </>
    );
}
