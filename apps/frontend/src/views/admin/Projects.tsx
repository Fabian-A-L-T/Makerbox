import CRUDTableActions from "@components/CRUDTableActions";
import CRUDLayout from "@components/layouts/CRUDLayout";
import { Breadcrumb, Breadcrumbs } from "@components/ui/Breadcrumbs";
import type { ColumnDef } from "@components/ui/Table";
import { getRouteApi } from "@tanstack/react-router";
import type { Project } from "../../interfaces/schemas";
import { useCRUD } from "../../hooks/useCRUD";
import type { AxiosResponse } from "axios";
import axios from "axios";
import { useState } from "react";
import ProjectForm from "./forms/ProjectForms";

export default function Projects(){
    const route = getRouteApi('/_auth/manager/admin/projects');
    const { page: currentPage } = route.useSearch();
    const {auth: {checkAuth, user}, pagination: {limit, maxPages}} = route.useRouteContext();
    const { data } = route.useLoaderData() as {data: Promise<AxiosResponse<Project[]>>, test: Promise<string>};
    
    const [image, setImage] = useState<File | null>(null);
    
    const crud = useCRUD<Project>({ checkAuth, apiRoute: '/api/projects', resourceLabel: 'proyecto'
    });

    const columns: ColumnDef<Project>[] = [
        { key: 'id',       label: 'ID',     allowsSorting: true },
        { key: 'name',     label: 'Nombre', allowsSorting: true,
            render: (item) => (
                <div className="flex items-center gap-2">
                    <img src={"/" + (item.image_url || 'uploads/images/placeholder.png')} alt={item.name} className="w-10 h-10 rounded" />
                    <span>{item.name}</span>
                </div>
            )   
        },
        { key: 'user_name',       label: 'Autor',     allowsSorting: true },
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
    async function handleProjectSubmit(formData?: FormData){

        let newImageRoute: string | undefined;
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
            }
            if (crud.modalMode === 'post') formData?.append('responsible_id', user.id);
            await crud.handleSubmit(formData);
        }
        catch (error: any) {
            if (newImageRoute) await handleDelete(newImageRoute);
            crud.setIsSubmitting(false);
            throw new Error(error.response?.data?.error ?? error.message);
        }
    }

    return (
        <>
        <Breadcrumbs className={'m-5 text-[var(--color-text)]'}>
            <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
            <Breadcrumb>Proyectos</Breadcrumb>
        </Breadcrumbs>
        <CRUDLayout<Project>
            title="Proyectos"
            columns={columns}
            data={data}
            checkAuth={checkAuth}
            paginationData={{currentPage, limit, maxPages}}
            crud={{...crud, handleSubmit: handleProjectSubmit}}
            createForm={<ProjectForm setImage={setImage}/>}
            editForm={<ProjectForm target={crud.targetData} setImage={setImage}/>}
        />
        </>
    );
}   