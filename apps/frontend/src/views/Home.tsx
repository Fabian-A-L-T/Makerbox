import { getRouteApi } from "@tanstack/react-router";
import type {ComponentStats, Project, ProjectStats, ToolStats} from "../interfaces/schemas";
import { RiCheckboxCircleLine, RiCloseCircleLine, RiCpuLine, RiFileListLine, RiHistoryLine, RiPauseCircleLine, RiPencilRuler2Line, RiStairsLine, RiTimeLine, RiWrenchLine } from "@remixicon/react";
import InfoCard from "@components/ui/InfoCard";
import Table, { type ColumnDef } from "@components/ui/Table";
import { fetchData } from "@utils/Utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import PageHeader from "@components/ui/PageHeader";

export default function Home(){
    const route = getRouteApi('/_auth/manager/');
    const {auth: { user }} = route.useRouteContext();

    const recentProjects = useQuery({queryKey:['/projects', 'recent', user!.id], queryFn: () => fetchData<Project>('/api/projects?limit=5&offset=0', undefined, {orderBy: 'created_at', desc: 'true', userId: user!.id})});
    const projectsByBudget = useQuery({queryKey:['/projects', 'budget', user!.id], queryFn: () => fetchData<Project>('/api/projects?limit=5&offset=0', undefined, {orderBy: 'budget', desc: 'true', userId: user!.id})});

    const compStats = useQuery({queryKey:['/stats/components'], queryFn: () => fetchData<ComponentStats>('/api/stats/components')});
    const toolStats = useQuery({queryKey:['/stats/tools'], queryFn: () => fetchData<ToolStats>('/api/stats/tools')});
    const projStats = useQuery({queryKey:['/stats/projects/user'], queryFn: () => fetchData<ProjectStats>('/api/stats/projects/user')});

    const projTotal = useMemo(() => {
        let planning, active, paused, completed, cancelled, total;
        if(projStats.status === 'success' && projStats.data.content[0]) {
            planning = parseInt(projStats.data.content[0].planning_count);
            active = parseInt(projStats.data.content[0].active_count);
            paused = parseInt(projStats.data.content[0].paused_count);
            completed = parseInt(projStats.data.content[0].completed_count);
            cancelled = parseInt(projStats.data.content[0].cancelled_count);
            return {
                total: planning + active + paused + completed + cancelled,
                planning, active, paused, completed, cancelled
            }
        }
        return { total, planning, active, paused, completed, cancelled }
        
    },[projStats.status]);

    const compTotal = useMemo(() => {
        if(compStats.status === 'success' && compStats.data.content) {
            let total = 0;
            compStats.data.content.forEach((item) => total += parseInt(item.category_stock));
            return total;
        }
    },[compStats.status]);

    const toolTotal = useMemo(() => {
        if(toolStats.status === 'success') {
            let total = 0;
            toolStats.data.content.forEach((item) => total += parseInt(item.category_stock));
            return total;
        }
    },[toolStats.status]);

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
            <PageHeader title="Dashboard"/>
            <div className="p-5 flex flex-col gap-5">
                <h2 className="makerbox-box-title">Inventario</h2>
                <div className="makerbox-box w-full flex flex-col gap-5 !pb-1">
                    <div className="makerbox-box-title flex items-center gap-2 w-max">
                        <RiFileListLine size={24}/>
                        <span>Resumen</span>
                    </div>
                    <div className="flex justify-center gap-5 overflow-x-auto pb-4">
                        <InfoCard title={'Componentes'} value={compTotal} Icon={RiCpuLine} className="!border-[var(--color-text-muted)]" color="var(--color-text-muted)"/>
                        <InfoCard title={'Herramientas'} value={toolTotal} Icon={RiWrenchLine} className="!border-[var(--color-text-muted)]" color="var(--color-text-muted)"/>
                    </div>
                </div>
            </div>
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
                        <InfoCard title={'Finalizado'} value={projTotal.completed} color="#1CA130" className="!border-[#1CA130]" Icon={RiCheckboxCircleLine}/>
                        <InfoCard title={'Cancelado'} value={projTotal.cancelled} color="#EE3232" className="!border-[#EE3232]" Icon={RiCloseCircleLine}/>
                    </div>
                </div>
                <div className="flex md:flex-col lg:flex-row gap-5">
                    <div className="makerbox-box flex flex-col gap-5 md:w-full lg:w-1/2">
                        <div className="makerbox-box-title flex items-center gap-2">
                            <RiHistoryLine size={24}/>
                            <span>Proyectos recientes</span>
                        </div>
                        <Table 
                            dataStatus={recentProjects.status}
                            aria-label={`Tabla de proyectos mas recientes`} 
                            columns={recentColumns}
                            rows={recentProjects.data?.content || []} 
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
                            rows={projectsByBudget.data?.content || []} 
                            rowHeader="name"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}