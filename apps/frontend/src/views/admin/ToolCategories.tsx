import { type ColumnDef } from '@components/ui/Table';
import type { Category } from '../../interfaces/schemas';
import { getRouteApi } from '@tanstack/react-router';
import { useCRUD } from '../../hooks/useCRUD';
import CategoryForm from '@views/admin/forms/CategoryForms';
import CRUDLayout from '@components/layouts/CRUDLayout';
import CRUDTableActions from '@components/CRUDTableActions';

export default function ToolCategories() {
    
    const route = getRouteApi('/_auth/manager/admin/categories/tools');
    const { page: currentPage } = route.useSearch();

    const crud = useCRUD<Category>({ apiRoute: '/tool-categories', resourceLabel: 'categoría'});

    const columns: ColumnDef<Category>[] = [
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

    function formDataTransform(formData?: FormData) {
        if (formData && crud.modalMode !== 'delete') {
            const parentPath = formData.get('parent') as string | null;
            const path       = formData.get('name') as string;
            const SpacelessPath = path.replaceAll(' ', '_');
            
            if (parentPath && parentPath !== ' ') formData.set('path', `${parentPath}.${SpacelessPath}`);
            else formData.set('path', `${SpacelessPath}`);
            formData.delete('parent');
        }
    }

    return (
        <CRUDLayout<Category>
            title="" 
            subtitle=""
            columns={columns}
            currentPage={currentPage}
            crud={crud}
            formDataTransform={formDataTransform}
            createForm={<CategoryForm type='tool'/>}
            editForm={<CategoryForm type='tool' target={crud.targetData}/>}
        />
    )
}
