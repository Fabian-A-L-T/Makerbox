import { useState } from 'react';
import { type AxiosResponse } from 'axios';
import { type ColumnDef } from '@components/ui/Table';
import type { Category } from '@utils/schemas';
import { getRouteApi } from '@tanstack/react-router';
import { useCRUD } from '@utils/useCRUD';
import axios from 'axios';
import CategoryForm from '@views/forms/CategoryForms';
import CRUDView from '@components/CRUDView';
import CRUDTableActions from '@components/CRUDTableActions';

export default function Categories() {
    
    const route = getRouteApi('/_auth/manager/admin/categories/components');
    const { page: currentPage } = route.useSearch();
    const {auth: {checkAuth}, pagination: {limit, maxPages}} = route.useRouteContext();
    const { data } = route.useLoaderData() as {data: Promise<AxiosResponse<Category[]>>, test: Promise<string>};

    const [allCategories, setAllCategories] = useState<Category[]>([]);

    const crud = useCRUD<Category>({checkAuth, apiRoute: '/api/component-categories', resourceLabel: 'categoría',
        extraFetch: async () => {
            try{
                const response = await axios.get<Category[]>('/api/component-categories');
                setAllCategories(response.data);
            }
            catch(err: any){
                throw err;
            }
        }
    });

    const columns: ColumnDef<Category>[] = [
        { key: 'id',       label: 'ID',     allowsSorting: true },
        { key: 'name',     label: 'Nombre', allowsSorting: true },
        { key: 'path',     label: 'Ruta',   allowsSorting: true,
            render: (item) => (
                <code className="text-xs bg-[var(--color-text-muted)]/20 rounded-full px-2.5 py-1.5 font-mono text-[var(--color-text-muted)]">
                    {item.path}
                </code>
            ),
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

    async function handleCategorySubmit(formData?: FormData) {

        try {
            if (formData && crud.modalMode !== 'delete') {
                const parentPath = formData.get('parent') as string | null;
                const path       = formData.get('path')   as string;
                if (parentPath) formData.set('path', `${parentPath}.${path}`);
                formData.delete('parent');
            }
            await crud.handleSubmit(formData);
        }
        catch (error: any) {
            throw new Error(error.response?.data?.error ?? error.message);
        }
    }

    return (
        <CRUDView<Category>
            title="Categorías de componentes" 
            subtitle="Gestión de categorías de componentes electronicos"
            checkAuth={checkAuth}
            columns={columns}
            data={data}
            paginationData={{currentPage, limit, maxPages}}
            crud={{...crud, handleSubmit: handleCategorySubmit}}
            createForm={<CategoryForm allCategories={allCategories}/>}
            editForm={<CategoryForm allCategories={allCategories} target={crud.targetData}/>}
        />
    )
}
