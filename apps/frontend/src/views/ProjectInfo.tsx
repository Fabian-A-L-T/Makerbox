import { parseAbsoluteToLocal } from '@internationalized/date';
import { RiCheckLine, RiGitRepositoryLine, RiTimeLine } from '@remixicon/react';
import { getRouteApi } from '@tanstack/react-router';
import type { Project } from '../interfaces/schemas';
import { Cell, Column, Row, TableBody, TableHeader, TableV2 } from '@components/ui/TableV2';
import { Separator } from '@components/ui/Separator';
import InfoLayout from '@components/layouts/InfoLayout';

export default function ProjectInfo() {
    
    const route = getRouteApi('/_auth/manager/projects/$id');
    const project = route.useLoaderData() as Project;
    
    const parseDate = parseAbsoluteToLocal(project.created_at);
    const publishedDate = parseDate.day.toString() + '/' + parseDate.month.toString() + '/' + parseDate.year.toString();

    const parseStartDate = parseAbsoluteToLocal(project.start_date);
    const startDate = parseStartDate.day.toString() + '/' + parseStartDate.month.toString() + '/' + parseStartDate.year.toString();

    const parseEndDate = project.end_date_real ? parseAbsoluteToLocal(project.end_date_real) : undefined;
    const endDate = parseEndDate ? parseEndDate.day.toString() + '/' + parseEndDate.month.toString() + '/' + parseEndDate.year.toString() : '';

    let statusColor;
    
    switch (project.state) {
        case 'active':
            statusColor = {color: 'var(--color-success)', name: 'Activo'};
            break;
        case 'planning':
            statusColor = {color: 'var(--color-primary)', name: 'En planificación'};
            break;
        case 'paused':
            statusColor = {color: 'var(--color-warning)', name: 'Pausado'};
            break;
        case 'completed':
            statusColor = {color: 'var(--color-success)', name: 'Finalizado'};
            break;
        case 'cancelled':
            statusColor = {color: 'var(--color-danger)', name: 'Cancelado'};
            break;
        default:
            statusColor = {color: 'var(--color-danger)', name: 'Error'};
            break;
    }

    const milestoneCursor = project.milestones.findIndex(value => !value.completed_at);

    const breadcrumbData = [
        {href: '/manager/', name: 'Dashboard'}, 
        {href: '/manager/projects/', name: 'Proyectos'}, 
        {name: project.name},
    ];
    const tabs = [
        {id: 'desc', name: 'Descripción', content: project.description ? <p>{project.description}</p> : <p>No hay descripción disponible.</p>},
        {id: 'component_list', name: 'Lista de componentes', content: 
            <TableV2
                aria-label="Tabla de hitos"
                className='w-full'
            >
                <TableHeader>
                    <Column id="name" isRowHeader>Nombre</Column>
                    <Column id="sku">SKU</Column>
                    <Column id="planned_amount">Cantidad planificada</Column>
                    <Column id="unit_cost">Costo</Column>
                </TableHeader>
                <TableBody items={project.components} renderEmptyState={() => (
                    <div className="p-10 text-[var(--color-text-muted)] italic text-center">{'Sin registros'}</div>
                )}>
                    {function renderItem(item) {
                        return (
                            <Row id={item.component_id}>
                                <Cell>{item.name}</Cell>
                                <Cell>{item.sku}</Cell>
                                <Cell>{item.planned_amount}</Cell>
                                <Cell>${item.unit_cost.toLocaleString()}</Cell>
                            </Row>
                        );
                    }}                
                </TableBody>
            </TableV2>
        }
    ];
    const infoData = [
        {title: 'Autor', value: project.user_name},
        {title: 'Fecha de inicio', value: startDate},
        {title: 'Fecha de termino', value: endDate},
        {title: 'Presupuesto', value: '$' + Number(project.budget).toLocaleString()}
    ];

    return (
        <InfoLayout title={project.name}
            status={statusColor}
            buttonUrl={project.repository_url}
            buttonText={<><RiGitRepositoryLine size={20}/> Ver repositorio</>}
            imgUrl={project.image_url}
            publishedDate={publishedDate}
            breadcrumbData={breadcrumbData}
            tabData={tabs}
            infoData={infoData}
        >
            {project.milestones.length > 0 && <div className='m-5 flex flex-col border-1 border-[var(--color-border)] rounded-[var(--border-radius-ui)] overflow-hidden'>
                <div className={`p-2 bg-[var(--color-table-header)] text-base`}>
                    Hitos
                </div>
                <div className='p-3 flex flex-col gap-2 overflow-y-auto'>
                    {project.milestones.map((milestone, index) => {
                        const currentMilestone = index === milestoneCursor;
                        return (
                            <div key={milestone.id} className='flex gap-3'>
                                <div className='flex flex-col items-center gap-2'>
                                    <div className={`flex items-center justify-center rounded-full w-10 min-h-10 ${milestone.is_completed ? 'bg-[var(--color-success)]' : currentMilestone ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}>
                                        {milestone.is_completed ? 
                                            <RiCheckLine className="w-4 h-4" /> : 
                                            currentMilestone ? <RiTimeLine/> : <span className='font-semibold'>{index + 1}</span>}
                                    </div>
                                    {index + 1 !== project.milestones.length && <Separator orientation='vertical'/>}
                                </div>
                                <div className='flex flex-col'>
                                    <span style={{color: currentMilestone ? 'var(--color-primary)' : 'var(--color-text)'}}>{milestone.title}</span>
                                    <span className='text-[var(--color-text-muted)]'>{milestone.description}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>}
        </InfoLayout>
    );
}