import { type ColumnDef } from '@components/ui/Table';
import CRUDTableActions from '@components/CRUDTableActions';
import CRUDView from '@components/CRUDView';
import { useCRUD } from '@utils/useCRUD';
import type { Manufacturer } from '@utils/schemas';
import ManufacturerForm from '@views/forms/ManufacturerForms';
import {getRouteApi} from '@tanstack/react-router';
import type { AxiosResponse } from 'axios';
import { Breadcrumb, Breadcrumbs } from '@components/ui/Breadcrumbs';

export default function Manufacturers(){

    const route = getRouteApi('/_auth/manager/admin/manufacturers');
    const { page: currentPage } = route.useSearch();
    const {auth: {checkAuth}, pagination: {limit, maxPages}} = route.useRouteContext();
    const { data } = route.useLoaderData() as {data: Promise<AxiosResponse<Manufacturer[]>>, test: Promise<string>};

    const crud = useCRUD<Manufacturer>({checkAuth, apiRoute: '/api/manufacturers', resourceLabel: 'fabricante' });
    const columns: ColumnDef<Manufacturer>[] = [
        { key: 'id',       label: 'ID',         allowsSorting: true },
        { key: 'name',     label: 'Nombre',     allowsSorting: true },
        { key: 'website',  label: 'Sitio web',  allowsSorting: true },
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
        <Breadcrumbs className={'text-[var(--color-text)] mb-4'}>
            <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
            <Breadcrumb>Fabricantes</Breadcrumb>
        </Breadcrumbs>
        <CRUDView<Manufacturer>
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