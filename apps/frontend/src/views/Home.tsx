import { getRouteApi } from "@tanstack/react-router";
import type {ComponentStats, Project, ProjectStats, ToolStats} from "../interfaces/schemas";
import AdminIndex from "./admin/AdminIndex";
import { RiCheckboxCircleLine, RiCloseCircleLine, RiFileListLine, RiPauseCircleLine, RiPencilRuler2Line, RiStairsLine, RiStarLine, RiTimeLine } from "@remixicon/react";
import InfoCard from "@components/ui/InfoCard";
import Table, { type ColumnDef } from "@components/ui/Table";
import { fetchData } from "@utils/Utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export default function Home(){
    const route = getRouteApi('/_auth/manager/');
    const {auth: { user }} = route.useRouteContext();

    const recentProjects = useQuery({queryKey:['/projects', 'recent', user!.id], queryFn: () => fetchData<Project>('/projects?limit=5&offset=0', undefined, {orderBy: 'created_at', desc: 'true', userId: user!.id})});
    const projectsByBudget = useQuery({queryKey:['/projects', 'budget', user!.id], queryFn: () => fetchData<Project>('/projects?limit=5&offset=0', undefined, {orderBy: 'budget', desc: 'true', userId: user!.id})});

    const compStats = useQuery({queryKey:['/stats/components'], queryFn: () => fetchData<ComponentStats>('/stats/components')});
    const toolStats = useQuery({queryKey:['/stats/tools'], queryFn: () => fetchData<ToolStats>('/stats/tools')});
    const projStats = useQuery({queryKey:['/stats/projects'], queryFn: () => fetchData<ProjectStats>('/stats/projects')});

    const projTotal = useMemo(() => {
        let planning = 0, active = 0, paused = 0, completed = 0, cancelled = 0;
        if(projStats.status === 'success') {
            projStats.data.data.content.forEach((item) => {
                switch (item.state) {
                    case 'planning':
                        planning = parseInt(item.project_count);
                        break;
                    case 'active':
                        active = parseInt(item.project_count);
                        break;
                    case 'paused':
                        paused = parseInt(item.project_count);
                        break;
                    case 'completed':
                        completed = parseInt(item.project_count);
                        break;
                    case 'cancelled':
                        cancelled = parseInt(item.project_count);
                        break;
                }
            });
        }
        return {
            total: planning + active + paused + completed + cancelled,
            planning, active, paused, completed, cancelled
        }
    },[projStats.data]);

    const compTotal = useMemo(() => {
        let total = 0;
        if(compStats.status === 'success') {
            compStats.data.data.content.forEach((item) => total += parseInt(item.category_stock));
        }
        return total;
    },[compStats.data]);

    const toolTotal = useMemo(() => {
        let total = 0;
        if(toolStats.status === 'success') {
            toolStats.data.data.content.forEach((item) => total += parseInt(item.category_stock));
        }
        return total;
    },[toolStats.data]);

    const projectStates = {
        planning: {text: 'En planificación', color:'var(--color-primary)', icon: RiTimeLine},
        active: {text: 'En desarrollo', color:'#23A5C2', icon: RiPencilRuler2Line},
        paused: {text: 'Pausado', color:'#DD6D28', icon: RiPauseCircleLine},
        completed: {text: 'Finalizado', color:'#1CA130', icon: RiCheckboxCircleLine},
        cancelled: {text: 'Cancelado', color:'#EE3232', icon: RiCloseCircleLine}
    }

    const recentColumns: ColumnDef<Project>[] = [
        { key: 'name',     label: 'Nombre'},
        { key: 'state',     label: 'Estado', render: (item) => {
            const stateParams = projectStates[item.state]
            return (
                <div className={`flex gap-1 items-center px-1 py-0.5 w-max rounded rounded-full`} style={{backgroundColor: `color-mix(in srgb,${stateParams.color} 40%, transparent)`, border: `1px solid ${stateParams.color}`}}>
                    <stateParams.icon color={stateParams.color} size={20}/>
                    <span className="pr-1">{stateParams.text}</span>
                </div>
            )
        }},
    ];

    const budgetColumns: ColumnDef<Project>[] = [
        { key: 'name',     label: 'Nombre'},
        { key: 'state',     label: 'Estado', render: (item) => {
            const stateParams = projectStates[item.state]
            return (
                <div className={`flex gap-1 items-center px-1 py-0.5 w-max rounded rounded-full`} style={{backgroundColor: `color-mix(in srgb,${stateParams.color} 40%, transparent)`, border: `1px solid ${stateParams.color}`}}>
                    <stateParams.icon color={stateParams.color} size={20}/>
                    <span className="pr-1">{stateParams.text}</span>
                </div>
            )
        }},
        { key: 'budget',     label: 'Presupuesto', render:(item) => (<span>${item.budget?.toLocaleString()}</span>)},
    ];

    return (
        <>
            <div className="m-5">
                <h1 className="text-3xl">Dashboard</h1>
                <p className="text-[var(--color-text-muted)]">Aquí podrás encontrar las estadísticas de tus proyectos</p>
            </div>
            { user?.role === 'admin' && (
                <div className="p-5 flex flex-col gap-5">
                    <h2 className="makerbox-box-title">Sistema (Solo administradores)</h2>
                    <AdminIndex compTotal={compTotal} toolTotal={toolTotal} projTotal={projTotal.total}/>
                </div>
            )}
            <div className="p-5 flex flex-col gap-5">
                <h2 className="makerbox-box-title">Proyectos</h2>
                <div className="makerbox-box flex flex-col gap-5 !pb-1">
                    <div className="makerbox-box-title flex items-center gap-2">
                        <RiFileListLine size={24}/>
                        <span>Resumen</span>
                    </div>
                    <div className="flex justify-between gap-5 overflow-x-auto pb-4">
                        <InfoCard title={'En planificación'} value={projTotal.planning} color="#3273FF" className="!border-[#3273FF]" Icon={RiTimeLine} tooltipText="Proyectos que aun no tienen una lista de componentes definida"/>
                        <InfoCard title={'En desarrollo'} value={projTotal.active} color="#23A5C2" className="!border-[#23A5C2]" Icon={RiPencilRuler2Line}/>
                        <InfoCard title={'Pausado'} value={projTotal.paused} color="#DD6D28" className="!border-[#DD6D28]" Icon={RiPauseCircleLine}/>
                        <InfoCard title={'Completado'} value={projTotal.completed} color="#1CA130" className="!border-[#1CA130]" Icon={RiCheckboxCircleLine}/>
                        <InfoCard title={'Finalizado'} value={projTotal.cancelled} color="#EE3232" className="!border-[#EE3232]" Icon={RiCloseCircleLine}/>
                    </div>
                </div>
                <div className="flex md:flex-col lg:flex-row gap-5">
                    <div className="makerbox-box flex flex-col gap-5 md:w-full lg:w-1/2">
                        <div className="makerbox-box-title flex items-center gap-2">
                            <RiStarLine size={24}/>
                            <span>Proyectos recientes</span>
                        </div>
                        <Table 
                            dataStatus={recentProjects.status}
                            aria-label={`Tabla de proyectos mas recientes`} 
                            columns={recentColumns}
                            rows={recentProjects.data?.data.content || []} 
                            rowHeader="name"
                        />
                    </div>
                    <div className="makerbox-box flex flex-col gap-5 md:w-full lg:w-1/2">
                        <div className="makerbox-box-title flex items-center gap-2">
                            <RiStairsLine size={24}/>
                            <span>Ranking por presupuesto</span>
                        </div>
                        <Table 
                            dataStatus={projectsByBudget.status} 
                            columns={budgetColumns} 
                            rows={projectsByBudget.data?.data.content || []} 
                            rowHeader="name"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}