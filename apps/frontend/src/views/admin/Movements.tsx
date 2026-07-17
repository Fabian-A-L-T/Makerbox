import { type ColumnDef } from '@components/ui/Table';
import type { Movement } from '../../interfaces/schemas';
import { getRouteApi } from '@tanstack/react-router';
import { useCRUD } from '../../hooks/useCRUD';
import CRUDLayout from '@components/layouts/CRUDLayout';
import { Breadcrumb, Breadcrumbs } from '@components/ui/Breadcrumbs';
import MovementForm from '@views/admin/forms/MovementForms';

export default function Movements() {
    
    const route = getRouteApi('/_auth/manager/admin/movements');
    const { page: currentPage } = route.useSearch();
    const { auth: {user} } = route.useRouteContext();

    const crud = useCRUD<Movement>({ apiRoute: '/movements', resourceLabel: 'movimiento'});
    
    const columns: ColumnDef<Movement>[] = [
        { key: 'id', label: 'ID'},
        { key: 'user_name', label: 'Usuario'},
        { key: 'component_name', label: 'Componente'},
        { key: 'component_id', label: 'Movimiento', 
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

    function formDataTransform(formData?: FormData){
        formData?.append('user_id', user!.id);
    }

    return (
        <>
        <Breadcrumbs className='m-5'>
            <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
            <Breadcrumb>Movimientos</Breadcrumb>
        </Breadcrumbs>
        <CRUDLayout<Movement>
            title="Movimientos" 
            subtitle="Gestión de movimientos de inventario"
            columns={columns}
            currentPage={currentPage}
            crud={crud}
            formDataTransform={formDataTransform}
            createForm={<MovementForm />}
            editForm={<></>}
        />
        </>
    )
}
