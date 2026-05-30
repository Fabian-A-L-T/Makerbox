import CRUDView from "@components/CRUDView";
import CRUDTableActions from "@components/CRUDTableActions";
import type { ColumnDef } from "@components/ui/Table";
import { useCRUD } from "@utils/useCRUD";
import ToolForm from "@views/forms/ToolForms";
import type { Tool, Category, Manufacturer, Location } from "@utils/schemas";
import { useState } from "react";
import axios, { type AxiosResponse } from "axios";
import {getRouteApi} from '@tanstack/react-router';
import { Breadcrumb, Breadcrumbs } from "@components/ui/Breadcrumbs";

export default function Tools() {

    const route = getRouteApi('/_auth/manager/admin/tools');
    const { page: currentPage } = route.useSearch();
    const {auth: {checkAuth}, pagination: {limit, maxPages}} = route.useRouteContext();
    const { data } = route.useLoaderData() as {data: Promise<AxiosResponse<Tool[]>>, test: Promise<string>};
    
    const [categories, setCategories] = useState<Category[]>([]);
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [image, setImage] = useState<File | null>(null);
    const [file, setFile] = useState<File | null>(null);
    
    const crud = useCRUD<Tool>({ checkAuth, apiRoute: '/api/tools', resourceLabel: 'herramienta',
        extraFetch: async () => {
            try{
                const categoriesResponse = await axios.get<Category[]>('/api/tool-categories');
                setCategories(categoriesResponse.data);
                const manufacturersResponse = await axios.get<Manufacturer[]>('/api/manufacturers');
                setManufacturers(manufacturersResponse.data);
                const locationsResponse = await axios.get<Location[]>('/api/locations');
                setLocations(locationsResponse.data);
            }
            catch(err: any){
                throw err;
            }
        },
    });

    const columns: ColumnDef<Tool>[] = [
        { key: 'id',       label: 'ID',     allowsSorting: true },
        { key: 'name',     label: 'Nombre', allowsSorting: true,
            render: (item) => (
                <div className="flex items-center gap-2">
                    <img src={"/" + (item.image_url || 'uploads/images/placeholder.png')} alt={item.name} className="w-10 h-10 rounded" />
                    <span>{item.name}</span>
                </div>
            )   
        },
        { key: 'sku',      label: 'SKU',    allowsSorting: true },
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
    
    async function handleUpload(fileToUpload: File, type: 'image' | 'document') {
        if (!fileToUpload) return;
        
        const formImage = new FormData();
            formImage.append(`${type}s`, fileToUpload);
            try {
                let response = await axios.post(`/api/files/upload/${type}`, formImage, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
                return response?.data?.url;
            } 
            catch (error: any) {
                throw new Error(error.response?.data?.error ?? error.message);
            }
    }

    async function handleDelete(fileRoute: string) {
        try {
            await axios.post(`/api/files/delete`, { fileUrl: fileRoute }, {
                withCredentials: true,
            });
        } catch (error: any) {
            throw new Error(error.response?.data?.error ?? error.message);
        }
    }

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
        <Breadcrumbs className={'text-[var(--color-text)] mb-4'}>
            <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
            <Breadcrumb>Herramientas</Breadcrumb>
        </Breadcrumbs>
        <CRUDView<Tool>
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