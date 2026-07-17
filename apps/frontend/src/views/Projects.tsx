import { Select, SelectItem } from "@components/form/Select";
import { Breadcrumb, Breadcrumbs } from "@components/ui/Breadcrumbs";
import Pagination from "@components/ui/Pagination";
import { getRouteApi } from "@tanstack/react-router";
import type { Project } from "../interfaces/schemas";
import { useFetch } from "../hooks/useFetch";
import { ProjectCardGrid } from "@components/ui/CardGrid";
import { paginationParams } from "@utils/Utils";
import FilterBox from "@components/ui/FilterBox";

export default function Projects(){
    const route = getRouteApi('/_auth/manager/projects/');
    const { page, desc, orderBy, search, state } = route.useSearch();
    const { maxPages } = paginationParams;
    const aditionalFilters = {
        ...(state && {state})
    }
    const { chunks, chunkIndex, dataLinks, status, filters, setFilters } = useFetch<Project>({
        page, 
        apiRoute: '/projects',
        baseFilters: { search, orderBy, desc },
        aditionalFilters
    });

    return (
        <>
        <Breadcrumbs className={'m-5'}>
            <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
            <Breadcrumb>Proyectos</Breadcrumb>
        </Breadcrumbs>
        <div className="m-5">
            <h1 className="text-3xl">Proyectos</h1>
            <p className="text-[var(--color-text-muted)]">Aquí podrás encontrar todos los proyectos registrados en el sistema</p>
        </div>
        <FilterBox filters={filters} setFilters={setFilters}>
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