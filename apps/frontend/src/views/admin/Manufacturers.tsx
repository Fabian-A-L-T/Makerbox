import { type ColumnDef } from '@components/ui/Table';
import CRUDTableActions from '@components/CRUDTableActions';
import CRUDLayout from '@components/layouts/CRUDLayout';
import { useCRUD } from '../../hooks/useCRUD';
import type { Manufacturer } from '../../interfaces/schemas';
import ManufacturerForm from '@views/admin/forms/ManufacturerForms';
import {getRouteApi} from '@tanstack/react-router';
import { Breadcrumb } from '@components/ui/Breadcrumbs';

export default function Manufacturers(){

    const route = getRouteApi('/_auth/manager/admin/manufacturers');
    const { page: currentPage } = route.useSearch();

    const crud = useCRUD<Manufacturer>({ apiRoute: '/api/manufacturers', resourceLabel: 'fabricante' });
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
        <CRUDLayout<Manufacturer>
            title="Fabricantes"
            subtitle="Aquí podrás administrar los registros de fabricantes de componentes electrónicos y herramientas"
            actionText='Registrar fabricante'
            breadcrumbs={
                <>
                <Breadcrumb href='/manager/'>Dashboard</Breadcrumb>
                <Breadcrumb>Fabricantes</Breadcrumb>
                </>
            }
            columns={columns}
            crud={crud}
            currentPage={currentPage}
            createForm={<ManufacturerForm isPending={crud.isSubmitting}/>}
            editForm={<ManufacturerForm target={crud.targetData} isPending={crud.isSubmitting}/>}
        />
    )
}