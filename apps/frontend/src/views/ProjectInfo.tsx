import { Breadcrumb, Breadcrumbs } from '@components/ui/Breadcrumbs';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@components/ui/Tabs';
import { parseAbsoluteToLocal } from '@internationalized/date';
import { RiCircleFill, RiGitRepositoryLine } from '@remixicon/react';
import { getRouteApi } from '@tanstack/react-router';
import type { Project } from '../interfaces/schemas';

export default function ProjectInfo() {
    
    const route = getRouteApi('/_auth/manager/projects/$id');
    const project = route.useLoaderData() as Project;
    console.log(project)
    const parseDate = parseAbsoluteToLocal(project.created_at);
    const publishedDate = parseDate.day.toString() + '/' + parseDate.month.toString() + '/' + parseDate.year.toString();

    const parseStartDate = parseAbsoluteToLocal(project.start_date);
    const startDate = parseStartDate.day.toString() + '/' + parseStartDate.month.toString() + '/' + parseStartDate.year.toString();

    const parseEstEndDate = project.end_date_estimated ? parseAbsoluteToLocal(project.end_date_estimated) : undefined;
    const estEndDate = parseEstEndDate ? parseEstEndDate.day.toString() + '/' + parseEstEndDate.month.toString() + '/' + parseEstEndDate.year.toString() : '';

    const parseEndDate = project.end_date_real ? parseAbsoluteToLocal(project.end_date_real) : undefined;
    const endDate = parseEndDate ? parseEndDate.day.toString() + '/' + parseEndDate.month.toString() + '/' + parseEndDate.year.toString() : '';

    let statusColor;
    
    switch (project.state) {
        case 'active':
            statusColor = {color: 'var(--color-success)', status: 'Activo'};
            break;
        case 'planning':
            statusColor = {color: 'var(--color-primary)', status: 'En planificación'};
            break;
        case 'paused':
            statusColor = {color: 'var(--color-warning)', status: 'Pausado'};
            break;
        case 'completed':
            statusColor = {color: 'var(--color-success)', status: 'Finalizado'};
            break;
        case 'cancelled':
            statusColor = {color: 'var(--color-danger)', status: 'Cancelado'};
            break;
        default:
            statusColor = {color: 'var(--color-danger)', status: 'Error'};
            break;
    }

    return (
        <>
            <Breadcrumbs className={'text-[var(--color-text)] p-4'}>
                <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
                <Breadcrumb href='/manager/projects/'>Proyectos</Breadcrumb>
                <Breadcrumb>{project.name}</Breadcrumb>
            </Breadcrumbs>
            <div className="p-4 flex lg:flex-row md:flex-col gap-8">
                <div className="xl:w-2/5 lg:w-1/2">
                    <img src={project.image_url ? '/' + project.image_url : '/uploads/images/placeholder.png'} alt={project.name} className="aspect-square w-full object-cover rounded-lg"/>
                </div>
                <div className="flex flex-col justify-between xl:w-3/5 lg:w-1/2">
                    <div className='flex flex-col'>
                        <div className="flex justify-end mb-4">
                            <span className="text-sm text-[var(--color-text-muted)]">Publicado el: {publishedDate}</span>
                        </div>
                        <div className="flex flex-col gap-4 mb-4 text-[var(--color-text)]">
                            <div className='flex flex-col gap-1 py-2'>
                                <h1 className="text-3xl font-bold ">{project.name}</h1>
                            </div>
                            <div className=' border-2 border-[var(--color-border)] rounded-[var(--border-radius-ui)] overflow-hidden'>
                                <div className='w-full px-3 py-2 flex justify-between align-center items-center bg-[var(--color-border)]'>
                                    <div className='flex gap-2 items-center'>
                                        <RiCircleFill size={16} color={statusColor.color}/> 
                                        <span className='text-sm'>{statusColor.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='divide-y-2 divide-[var(--color-border)]'>
                            <p className="text-[var(--color-text-muted)] py-2">Autor: {project.user_name}</p>
                            <p className="text-[var(--color-text-muted)] py-2">Fecha de inicio: {startDate}</p>
                            { project.state === 'completed' 
                                ? <p className="text-[var(--color-text-muted)] py-2">Fecha de termino: {endDate}</p> 
                                : estEndDate && <p className="text-[var(--color-text-muted)] py-2">Fecha de termino estimado: {estEndDate}</p>
                            }
                            <p className="text-[var(--color-text-muted)] py-2">Presupuesto: {project.budget}</p>
                        </div>
                    </div>
                    {project.repository_url && 
                        <a href={project.repository_url} 
                            target='_blank' 
                            className='p-4 flex gap-4 items-center justify-center rounded-[var(--border-radius-ui)] bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/60 border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/40 text-white'
                        >
                            <RiGitRepositoryLine size={20}/>
                            Ver repositorio
                        </a>
                    }
                </div>
            </div>
            <Tabs>
                <TabList>
                    {project.description && <Tab id='desc'>Descripción</Tab>}
                    <Tab id='component_list'>Lista de componentes</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel id="desc" className="flex">
                        <p>{project.description}</p>
                    </TabPanel>
                    <TabPanel id="component_list" className="flex">
                        <p>En construcción</p>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </>
    );
}