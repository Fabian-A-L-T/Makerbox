import CRUDLayout from "@components/layouts/CRUDLayout";
import CRUDTableActions from "@components/CRUDTableActions";
import type { ColumnDef } from "@components/ui/Table";
import { useCRUD } from "../../hooks/useCRUD";
import ToolForm from "@views/admin/forms/ToolForms";
import type { Tool } from "../../interfaces/schemas";
import { useState } from "react";
import {getRouteApi} from '@tanstack/react-router';
import { Breadcrumb, Breadcrumbs } from "@components/ui/Breadcrumbs";
import { handleDelete, handleUpload } from "@utils/Utils";
import { AsyncImg } from "@utils/Utils";

export default function Tools() {

    const route = getRouteApi('/_auth/manager/admin/tools');
    const { page: currentPage } = route.useSearch();
    
    const [image, setImage] = useState<File | null>(null);
    const [file, setFile] = useState<File | null>(null);
    
    const crud = useCRUD<Tool>({ apiRoute: '/tools', resourceLabel: 'herramienta'});

    const columns: ColumnDef<Tool>[] = [
        { key: 'id',       label: 'ID'},
        { key: 'name',     label: 'Nombre',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <AsyncImg className='w-18 h-18 rounded' src={'/' + item.image_url} alt={item.name}/>
                    <span>{item.name}</span>
                </div>
            )   
        },
        { key: 'sku',      label: 'SKU'},
        { key: 'manufacturer',      label: 'Fabricante'},
        { key: 'category',      label: 'Categoría',
            render: (item) => {
                const categoryRoute = item.category.replaceAll('_', ' ');
                return (
                    <div className="flex flex-col">
                        <span>{categoryRoute.split('.').at(-1)}</span>
                        <span className='text-xs text-[var(--color-text-muted)]'>{categoryRoute.replaceAll('.', ' > ')}</span>
                    </div>
            )}
        },
        { key: 'location',      label: 'Ubicación',
            render: (item) => {
                const locationRoute = item.location.replaceAll('_', ' ');
                return (
                    <div className="flex flex-col">
                        <span>{locationRoute.split('.').at(-1)}</span>
                        <span className='text-xs text-[var(--color-text-muted)]'>{locationRoute.replaceAll('.', ' > ')}</span>
                    </div>
            )}
        },
        { key: 'actions',   label: 'Acciones',
            render: (item) => (
                <CRUDTableActions 
                    name={item.name} 
                    editAction={() => crud.openModal({ mode: 'put', target: item })}
                    deleteAction={() => crud.openModal({ mode: 'delete', target: item })}
                />
            ),
        },
    ];
    
    /**
     * Handles the submission of component data
     * 
     * If an image is provided, it uploads it and deletes the previous one, 
     * if the submission fails, it deletes the uploaded image
     * 
     * @param {FormData} formData Data to be submitted
     * @throws {Error} Throws an error if the submission fails
     */
    async function handleComponentSubmit(formData?: FormData){

        let newImageRoute: string | undefined;
        let newFileRoute: string | undefined;
        try {
            crud.setIsSubmitting(true);
            if (formData && crud.modalMode !== 'delete') {
                if(image){
                    newImageRoute = await handleUpload(image, 'image');
                    if (crud.targetData?.image_url) {
                        await handleDelete(crud.targetData.image_url);
                    }
                    formData?.append('image_url', newImageRoute!);
                    setImage(null);
                }
                if(file){
                    newFileRoute = await handleUpload(file, 'document');
                    if (crud.targetData?.manual_url) {
                        await handleDelete(crud.targetData.manual_url);
                    }
                    formData?.append('manual_url', newFileRoute!);
                    setFile(null);
                }
            }
            await crud.handleSubmit(formData);
        }
        catch (error: any) {
            if (newImageRoute) await handleDelete(newImageRoute);
            if (newFileRoute) await handleDelete(newFileRoute);
            crud.setIsSubmitting(false);
            throw new Error(error.response?.data?.error ?? error.message);
        }
    }

    return (
        <>
        <Breadcrumbs className={'m-5 text-[var(--color-text)]'}>
            <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
            <Breadcrumb>Herramientas</Breadcrumb>
        </Breadcrumbs>
        <CRUDLayout<Tool>
            title="Herramientas"
            columns={columns}
            data={data}
            checkAuth={checkAuth}
            paginationData={{currentPage, limit, maxPages}}
            crud={{...crud, handleSubmit: handleComponentSubmit}}
            createForm={<ToolForm allCategories={categories} allManufacturers={manufacturers} allLocation={locations} setImage={setImage} setFile={setFile} />}
            editForm={<ToolForm target={crud.targetData} allCategories={categories} allManufacturers={manufacturers} allLocation={locations} setImage={setImage} setFile={setFile}/>}
        />
        </>
    );
}   