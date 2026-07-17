import CRUDTableActions from "@components/CRUDTableActions";
import CRUDLayout from "@components/layouts/CRUDLayout";
import { Breadcrumb, Breadcrumbs } from "@components/ui/Breadcrumbs";
import type { ColumnDef } from "@components/ui/Table";
import { getRouteApi } from "@tanstack/react-router";
import type { Project } from "../../interfaces/schemas";
import { useCRUD } from "../../hooks/useCRUD";
import { useState } from "react";
import ProjectForm from "./forms/ProjectForms";
import { handleDelete, handleUpload } from "@utils/Utils";
import { AsyncImg } from "@utils/Utils";

export default function Projects(){
    const route = getRouteApi('/_auth/manager/admin/projects');
    const { page: currentPage } = route.useSearch();
    const { auth: {user} } = route.useRouteContext();
    
    const [image, setImage] = useState<File | null>(null);
    
    const crud = useCRUD<Project>({ apiRoute: '/projects', resourceLabel: 'proyecto' });

    const columns: ColumnDef<Project>[] = [
        { key: 'id',       label: 'ID'},
        { key: 'name',     label: 'Nombre',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <AsyncImg className='w-18 h-18 rounded' src={'/' + item.image_url} alt={item.name}/>
                    <span>{item.name}</span>
                </div>
            )   
        },
        { key: 'user_name',       label: 'Autor'},
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
     */
    async function formDataTransform(formData?: FormData){
        let newImageRoute: string | undefined;

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
        if (crud.modalMode === 'post') formData?.append('responsible_id', user!.id);
    }

    return (
        <>
        <Breadcrumbs className='m-5'>
            <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
            <Breadcrumb>Proyectos</Breadcrumb>
        </Breadcrumbs>
        <CRUDLayout<Project>
            title="Proyectos"
            columns={columns}
            currentPage={currentPage}
            crud={crud}
            formDataTransform={formDataTransform}
            createForm={<ProjectForm setImage={setImage}/>}
            editForm={<ProjectForm target={crud.targetData} setImage={setImage}/>}
        />
        </>
    );
}   