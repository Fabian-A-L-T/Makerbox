import { type ColumnDef } from '@components/ui/Table';
import CRUDTableActions from '@components/CRUDTableActions';
import CRUDLayout from '@components/layouts/CRUDLayout';
import { useCRUD } from '../../hooks/useCRUD';
import type { Manufacturer } from '../../interfaces/schemas';
import ManufacturerForm from '@views/admin/forms/ManufacturerForms';
import {getRouteApi} from '@tanstack/react-router';
import { Breadcrumb, Breadcrumbs } from '@components/ui/Breadcrumbs';

export default function Manufacturers(){

    const route = getRouteApi('/_auth/manager/admin/manufacturers');
    const { page: currentPage } = route.useSearch();

    const crud = useCRUD<Manufacturer>({ apiRoute: '/manufacturers', resourceLabel: 'fabricante' });
    const columns: ColumnDef<Manufacturer>[] = [
        { key: 'id',       label: 'ID'},
        { key: 'name',     label: 'Nombre'},
        { key: 'website',  label: 'Sitio web'},
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
            <Breadcrumb>Fabricantes</Breadcrumb>
        </Breadcrumbs>
        <CRUDLayout<Manufacturer>
            title="Fabricantes"
            subtitle="Aquí puedes gestionar los fabricantes de componentes electrónicos y herramientas."
            columns={columns}
            data={data}
            crud={crud}
            checkAuth={checkAuth}
            paginationData={{currentPage, limit, maxPages}}
            createForm={<ManufacturerForm/>}
            editForm={<ManufacturerForm target={crud.targetData}/>}
        />
        </>
    )
}