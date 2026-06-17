import { getRouteApi } from "@tanstack/react-router";
import type {Project} from "../interfaces/schemas";
import { type AxiosResponse } from "axios";
import AdminIndex from "./admin/AdminIndex";
import { RiCheckboxCircleLine, RiCloseCircleLine, RiFileListLine, RiPauseCircleLine, RiPencilRuler2Line, RiStairsLine, RiStarLine, RiTimeLine } from "@remixicon/react";
import InfoCard from "@components/ui/InfoCard";
import Table, { type ColumnDef } from "@components/ui/Table";
import { useAsyncList } from "react-aria-components";

export default function Home(){
    const route = getRouteApi('/_auth/manager/');
    const {auth: { user }} = route.useRouteContext();
    const { recentProjects, projectsByBudget } = route.useLoaderData() as {recentProjects: Promise<AxiosResponse<Project[]>>, projectsByBudget: Promise<AxiosResponse<Project[]>>};
    
    let recentProjList = useAsyncList<Project>({
        async load() {
            const response = await recentProjects;
            return {items: response.data};
        }
    });

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
                <div className={`flex gap-1 items-center px-1 py-0.5 w-max rounded rounded-full`} style={{backgroundColor: `color-mix(in srgb,${stateParams.color} 40%, black)`, border: `1px solid ${stateParams.color}`}}>
                    <stateParams.icon color={stateParams.color} size={20}/>
                    <span className="!text-[var(--color-text)] pr-1">{stateParams.text}</span>
                </div>
            )
        }},
    ];

    const budgetColumns: ColumnDef<Project>[] = [
        { key: 'name',     label: 'Nombre'},
        { key: 'state',     label: 'Estado', render: (item) => {
            const stateParams = projectStates[item.state]
            return (
                <div className={`flex gap-1 items-center px-1 py-0.5 w-max rounded rounded-full`} style={{backgroundColor: `color-mix(in srgb,${stateParams.color} 40%, black)`, border: `1px solid ${stateParams.color}`}}>
                    <stateParams.icon color={stateParams.color} size={20}/>
                    <span className="!text-[var(--color-text)] pr-1">{stateParams.text}</span>
                </div>
            )
        }},
        { key: 'budget',     label: 'Presupuesto', render:(item) => (<span>${item.budget?.toLocaleString()}</span>)},
    ];

    let projByBudgetList = useAsyncList<Project>({
        async load() {
            const response = await projectsByBudget;
            return {items: response.data};
        }
    });
    
    return (
        <>
            <div className="m-5">
                <h1 className="text-[var(--color-text)] text-3xl">Dashboard</h1>
                <p className="text-[var(--color-text-muted)]">Aquí podrás encontrar las estadísticas de tus proyectos</p>
            </div>
            { user.role === 'admin' && (
                <div className="p-5 flex flex-col gap-5">
                    <h2 className="makerbox-box-title text-[var(--color-text)]">Sistema (Solo administradores)</h2>
                    <AdminIndex/>
                </div>
            )}
            <div className="p-5 flex flex-col gap-5">
                <h2 className="makerbox-box-title text-[var(--color-text)]">Proyectos</h2>
                <div className="makerbox-box flex flex-col gap-5 !pb-1">
                    <div className="makerbox-box-title flex items-center gap-2">
                        <RiFileListLine size={24}/>
                        <span>Resumen</span>
                    </div>
                    <div className="flex justify-between gap-5 overflow-x-auto pb-4">
                        <InfoCard title={'En planificación'} value={123456} color="#3273FF" className="!border-[#3273FF]" Icon={RiTimeLine} tooltipText="Proyectos que aun no tienen una lista de componentes definida"/>
                        <InfoCard title={'En desarrollo'} value={123456} color="#23A5C2" className="!border-[#23A5C2]" Icon={RiPencilRuler2Line}/>
                        <InfoCard title={'Pausado'} value={123456} color="#DD6D28" className="!border-[#DD6D28]" Icon={RiPauseCircleLine}/>
                        <InfoCard title={'Completado'} value={123456} color="#1CA130" className="!border-[#1CA130]" Icon={RiCheckboxCircleLine}/>
                        <InfoCard title={'Finalizado'} value={123456} color="#EE3232" className="!border-[#EE3232]" Icon={RiCloseCircleLine}/>
                    </div>
                </div>
                <div className="flex gap-5">
                    <div className="makerbox-box flex flex-col gap-5 w-1/2">
                        <div className="makerbox-box-title flex items-center gap-2">
                            <RiStarLine size={24}/>
                            <span>Proyectos recientes</span>
                        </div>
                        <Table aria-label={`Tabla de proyectos mas recientes`} columns={recentColumns} rows={recentProjList.items} rowHeader="name"/>
                    </div>
                    <div className="makerbox-box flex flex-col gap-5 w-1/2">
                        <div className="makerbox-box-title flex items-center gap-2">
                            <RiStairsLine size={24}/>
                            <span>Ranking por presupuesto</span>
                        </div>
                        <Table aria-label={`Tabla de proyectos mas recientes`} columns={budgetColumns} rows={projByBudgetList.items} rowHeader="name"/>
                    </div>
                </div>
            </div>
        </>
    );
}