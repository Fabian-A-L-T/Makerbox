import { parseAbsoluteToLocal } from '@internationalized/date';
import { RiArrowLeftLine, RiArrowRightLine, RiCheckLine, RiEditLine, RiGitRepositoryLine, RiTimeLine } from '@remixicon/react';
import { getRouteApi, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { makerboxApi } from '../api/makerbox.api';
import type { Milestone, Project } from '../interfaces/schemas';
import { Cell, Column, Row, TableBody, TableHeader, TableV2 } from '@components/ui/TableV2';
import { Separator } from '@components/ui/Separator';
import InfoLayout from '@components/layouts/InfoLayout';
import { Button } from '@components/form/Button';
import TextField from '@components/form/TextField';
import CRUDModal from '@components/CRUDModal';
import { TooltipTrigger } from 'react-aria-components';
import { Tooltip } from '@components/ui/Tooltip';

export default function ProjectInfo() {
    
    const route = getRouteApi('/_auth/manager/projects/$id');
    const project = route.useLoaderData() as Project;
    const router = useRouter();
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
    const [isMilestonePending, setIsMilestonePending] = useState(false);
    const [milestoneError, setMilestoneError] = useState<string | null>(null);
    const [milestoneEditMode, setMilestoneEditMode] = useState<boolean>(false);

    async function saveMilestone(formData: FormData) {
        if (!editingMilestone) return;
        setIsMilestonePending(true);
        setMilestoneError(null);
        try {
            await makerboxApi.put(`/api/projects/${project.id}/milestones/${editingMilestone.id}`, {
                title: formData.get('title')?.toString(),
                description: formData.get('description')?.toString(),
                order_index: String(editingMilestone.order_index),
            });
            setEditingMilestone(null);
            await router.invalidate();
        } catch {
            setMilestoneError('No se pudo actualizar el hito. Inténtalo de nuevo.');
        } finally {
            setIsMilestonePending(false);
        }
    }

    async function updateState(state: 'paused' | 'completed' | 'cancelled') {
        await makerboxApi.patch(`/api/projects/${project.id}/state/update`, {state});
        await router.invalidate();
    }

    async function revertState() {
        await makerboxApi.patch(`/api/projects/${project.id}/state/revert`, null);
        await router.invalidate();
    }

    async function moveMilestone(index: number, direction: -1 | 1) {
        const otherMilestone = project.milestones[index + direction];
        const milestone = project.milestones[index];
        if (!otherMilestone || !milestone) return;

        setIsMilestonePending(true);
        setMilestoneError(null);
        try {
            await Promise.all([
                makerboxApi.put(`/api/projects/${project.id}/milestones/${milestone.id}`, {
                    title: milestone.title,
                    description: milestone.description,
                    is_completed: otherMilestone.is_completed,
                    order_index: String(otherMilestone.order_index),
                }),
                makerboxApi.put(`/api/projects/${project.id}/milestones/${otherMilestone.id}`, {
                    title: otherMilestone.title,
                    description: otherMilestone.description,
                    is_completed: milestone.is_completed,
                    order_index: String(milestone.order_index),
                }),
            ]);
            await router.invalidate();
        } catch {
            setMilestoneError('No se pudo cambiar el orden de los hitos. Inténtalo de nuevo.');
            await router.invalidate();
        } finally {
            setIsMilestonePending(false);
        }
    }

    async function updateMilestoneCompletion(action: 'complete' | 'revert') {
        setIsMilestonePending(true);
        setMilestoneError(null);
        try {
            await makerboxApi.patch(`/api/projects/${project.id}/milestones/${action}`);
            await router.invalidate();
        } catch {
            setMilestoneError(action === 'complete'
                ? 'No se pudo completar el hito. Inténtalo de nuevo.'
                : 'No se pudo revertir el hito. Inténtalo de nuevo.');
        } finally {
            setIsMilestonePending(false);
        }
    }
    
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

    const milestoneCursor = project.milestones.findIndex(value => !value.is_completed);
    const lastCompletedMilestone = [...project.milestones].reverse().findIndex(value => value.is_completed);

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
            locationData ={
                <div className='p-4 flex gap-2 justify-center'>
                    {project.state === 'paused' || project.state === 'cancelled' || project.state === 'completed' ?
                    <Button onPress={() => revertState()} variant='primary'>
                        Revertir estado
                    </Button>
                    :
                    <>
                    {milestoneCursor === -1 && <Button onPress={() => updateState('completed')} className={"bg-[var(--color-success)]"} variant='custom'>
                        Finalizar proyecto
                    </Button>}
                    <Button onPress={() => updateState('paused')} variant='warning'>
                        Pausar proyecto
                    </Button>
                    <Button onPress={() => updateState('cancelled')} variant='danger'>
                        Cancelar proyecto
                    </Button>
                    </>
                    }
                </div>}
            tabData={tabs}
            infoData={infoData}
        >
            {project.milestones.length > 0 && <div className='m-5 flex flex-col border-1 border-[var(--color-border)] rounded-[var(--border-radius-ui)] overflow-hidden'>
                <div className={`flex justify-between items-center p-2 bg-[var(--color-table-header)] text-base`}>
                    <span className='ml-2'>Hitos</span>
                    {!(project.state === 'paused' || project.state === 'cancelled' || project.state === 'completed') && <Button
                        variant={milestoneEditMode ? "primary" : "quiet"}
                        aria-label={"Editar hitos"}
                        className={"gap-2"}
                        onPress={() => {
                            setMilestoneEditMode(prev => !prev);
                        }}
                        isDisabled={isMilestonePending}
                    >
                        <RiEditLine size={18}/>
                        <span className='text-sm'>Editar</span>
                    </Button>}
                </div>
                {milestoneError && <p role="alert" className="px-3 pt-2 text-[var(--color-danger)]">{milestoneError}</p>}
                <div className='p-4 flex gap-4 overflow-y-auto'>
                    {project.milestones.map((milestone, index) => {
                        const currentMilestone = index === milestoneCursor;
                        return (
                            <div key={milestone.id} className='flex gap-4'>
                                <div className='flex flex-col items-center gap-2'>
                                    <TooltipTrigger delay={100} closeDelay={100} shouldCloseOnPress={false}>
                                        <Button aria-label={"Hito" + (index + 1)} variant="custom" className={'!border-none !p-0'}>
                                            <div className={`flex items-center justify-center rounded-full w-10 min-h-10 ${milestone.is_completed ? 'bg-[var(--color-success)]' : currentMilestone ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}>
                                                {milestone.is_completed ? 
                                                    <RiCheckLine color='white' className="w-4 h-4" /> : 
                                                    currentMilestone ? <RiTimeLine color='white'/> : <span className='font-semibold'>{index + 1}</span>}
                                            </div>
                                        </Button>
                                        {milestone.description && <Tooltip className={"max-w-sm"}>
                                            <span className='text-sm text-[var(--color-text-muted)]'>{milestone.description}</span>
                                        </Tooltip>}
                                    </TooltipTrigger>
                                    <div className='flex flex-col'>
                                        <div className="flex items-center gap-1">
                                            <span style={{color: currentMilestone ? 'var(--color-primary)' : 'var(--color-text)'}}>{milestone.title}</span>
                                            {milestoneEditMode && <Button
                                                variant="quiet"
                                                className="h-8 w-8 p-1"
                                                aria-label={`Editar hito ${milestone.title}`}
                                                onPress={() => {
                                                    setMilestoneError(null);
                                                    setEditingMilestone(milestone);
                                                }}
                                                isDisabled={isMilestonePending}
                                            >
                                                <RiEditLine size={18}/>
                                            </Button>}
                                        </div>
                                        {milestoneEditMode && <div className="flex gap-1">
                                            <Button
                                                variant="quiet"
                                                className="h-8 w-8 p-1"
                                                aria-label={`Mover ${milestone.title} hacia arriba`}
                                                onPress={() => moveMilestone(index, -1)}
                                                isDisabled={index === 0 || isMilestonePending}
                                            >
                                                <RiArrowLeftLine size={18}/>
                                            </Button>
                                            <Button
                                                variant="quiet"
                                                className="h-8 w-8 p-1"
                                                aria-label={`Mover ${milestone.title} hacia abajo`}
                                                onPress={() => moveMilestone(index, 1)}
                                                isDisabled={index === project.milestones.length - 1 || isMilestonePending}
                                            >
                                                <RiArrowRightLine size={18}/>
                                            </Button>
                                        </div>}
                                    </div>
                                </div>
                                {index + 1 !== project.milestones.length && <Separator className='min-w-10 mt-[20px]' orientation='horizontal'/>}
                            </div>
                    )})}
                </div>
                {!milestoneEditMode && !(project.state === 'paused' || project.state === 'cancelled' || project.state === 'completed') && 
                <>
                <Separator className='flex-auto !w-auto !mx-4'/>
                <div className='flex gap-2 justify-center p-4'>
                    {lastCompletedMilestone !== -1  && (
                        <Button
                            variant="secondary"
                            className="w-max gap-2"
                            onPress={() => updateMilestoneCompletion('revert')}
                            isDisabled={isMilestonePending}
                        >
                            <RiTimeLine size={18}/>
                            Revertir hito
                        </Button>
                    )}
                    {milestoneCursor !== -1 && (
                        <Button
                            className="w-max gap-2"
                            onPress={() => updateMilestoneCompletion('complete')}
                            isDisabled={isMilestonePending}
                        >
                            <RiCheckLine size={18}/>
                            Completar hito
                        </Button>
                    )}
                </div>
                </>}
            </div>}
            <CRUDModal
                key={editingMilestone?.id ?? 'closed'}
                title="Actualizar hito"
                submitText="Guardar"
                isOpen={Boolean(editingMilestone)}
                isPending={isMilestonePending}
                setOpen={(open) => { if (!open) setEditingMilestone(null); }}
                action={saveMilestone}
            >
                <div className="flex flex-col gap-5 w-lg">
                    <TextField
                        label="Título"
                        name="title"
                        minLength={3}
                        maxLength={64}
                        defaultValue={editingMilestone?.title}
                        isRequired
                    />
                    <TextField
                        label="Descripción"
                        name="description"
                        type="textarea"
                        maxLength={5000}
                        defaultValue={editingMilestone?.description}
                    />
                </div>
            </CRUDModal>
        </InfoLayout>
    );
}