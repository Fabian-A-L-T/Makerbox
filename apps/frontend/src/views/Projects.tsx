import { Select, SelectItem } from "@components/form/Select";
import { Breadcrumb } from "@components/ui/Breadcrumbs";
import Pagination from "@components/ui/Pagination";
import { getRouteApi, Link } from "@tanstack/react-router";
import type { Project } from "../interfaces/schemas";
import { useFetch } from "../hooks/useFetch";
import { ProjectCardGrid } from "@components/ui/CardGrid";
import { paginationParams } from "@utils/Utils";
import FilterBox from "@components/ui/FilterBox";
import { RiAddLine } from "@remixicon/react";
import PageHeader from "@components/ui/PageHeader";

export default function Projects(){
    const route = getRouteApi('/_auth/manager/projects/');
    const { page, desc, orderBy, search, state } = route.useSearch();
    const { maxPages } = paginationParams;
    const aditionalFilters = {
        ...(state && {state})
    }
    const { chunks, chunkIndex, dataLinks, status, filters, setFilters } = useFetch<Project>({
        page, 
        apiRoute: '/api/projects',
        baseFilters: { search, orderBy, desc },
        aditionalFilters
    });

    const filterItems = [
        {id: 'created_at', name: 'Fecha'}
    ];

    return (
        <>
        <PageHeader title="Proyectos" description="Aquí podrás encontrar todos tus proyectos registrados en el sistema">
            <Breadcrumb href='/manager/'>Dashboard</Breadcrumb>
            <Breadcrumb>Proyectos</Breadcrumb>
        </PageHeader>
        <div className="flex justify-end items-center m-5"> 
            <Link
                className='w-max h-max p-2 flex items-center gap-2 bg-[var(--color-primary)] rounded-[var(--border-radius-ui)] text-white'
                to='/manager/newProject'
            >
                <RiAddLine/>
                <span className='mr-1'>Nuevo proyecto</span>
            </Link>
        </div>
        <FilterBox filters={filters} filterItems={filterItems} setFilters={setFilters}>
            <Select label="Estado" 
                value={filters.state || ''}
                placeholder="Seleccione"
                onChange={(value) => value !== null && setFilters((prev) => ({...prev, state: value as string}))}
                className='!w-[var(--select-w-sm)]'
            >
                <SelectItem id='' >Todos</SelectItem>
                <SelectItem id='planning' >En planificación</SelectItem>
                <SelectItem id='active' >Activo</SelectItem>
                <SelectItem id='paused' >Pausado</SelectItem>
                <SelectItem id='completed' >Finalizado</SelectItem>
                <SelectItem id='cancelled' >Cancelado</SelectItem>
            </Select>
        </FilterBox>
        <ProjectCardGrid data={chunks[chunkIndex] || []} status={status}/>
        <Pagination
            dataStatus={status}
            pagination={{page, maxPages, totalPages: chunks.length}}
            filters={filters}
            mask={{ 
                orderBy: undefined, 
                desc: undefined, 
                search: undefined,
            }}
            hasPrev={dataLinks?.prev !== undefined}
            hasNext={dataLinks?.next !== undefined}
        />
        </>
    )
}