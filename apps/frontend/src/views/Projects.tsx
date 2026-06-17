import AwaitWrapper from "@components/AwaitWrapper";
import { Select, SelectItem } from "@components/form/Select";
import TextField from "@components/form/TextField";
import { Breadcrumb, Breadcrumbs } from "@components/ui/Breadcrumbs";
import Card from "@components/ui/Card";
import Pagination from "@components/ui/Pagination";
import { RiSearchLine, RiSortAlphabetAsc, RiSortAlphabetDesc, RiSortNumberAsc, RiSortNumberDesc } from "@remixicon/react";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import type { Project } from "../interfaces/schemas";
import { AxiosError, type AxiosResponse } from "axios";
import { chunk } from "lodash";
import { useRef, useState } from "react";

export default function Projects(){
    const route = getRouteApi('/_auth/manager/projects/');
    const { page, desc, orderBy, search } = route.useSearch();
    const {checkAuth, pagination: {limit, maxPages}} = route.useRouteContext();
    const { projects } = route.useLoaderData() as { projects: Promise<AxiosResponse<Project[]>>};
    const navigate = useNavigate();

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [filters, setFilters] = useState<Record<string, any>>({
        page: page,
        search: search || '',
        desc: desc || false,
        orderBy: orderBy || 'name'
    });

    function handleFilterChange(value: string | number | boolean, key: 'page' | 'search' | 'orderBy' | 'desc', debounce?: number) {
        
        let temp: Record<string, any> = {...filters, page: 1};
        if(value || value != 0) temp[key] = value;
        else temp[key] = undefined;
        setFilters(temp);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            navigate({
                to: '.',
                search: temp,
                mask: {to: '.', search: {...temp, orderBy: undefined, desc: undefined, search: undefined}}
            });
        }, debounce);
    }

    return (
        <div>
            <Breadcrumbs className={'m-5 text-[var(--color-text)]'}>
                <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
                <Breadcrumb>Proyectos</Breadcrumb>
            </Breadcrumbs>
            <div className="m-5">
                <h1 className="text-[var(--color-text)] text-3xl">Proyectos</h1>
                <p className="text-[var(--color-text-muted)]">Aquí podrás encontrar todos los proyectos registrados en el sistema</p>
            </div>
            <div className="m-5 makerbox-box flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <TextField label="Buscar"
                        value={filters.search}
                        onChange={(value) => handleFilterChange(value, 'search', 400)}
                        placeholder="Ej: LED Rojo" 
                        className='w-full border-r-2 border-[var(--color-border)] pr-4' 
                        icon={<RiSearchLine className="m-2" color="var(--color-text-muted)" size={18}/>}
                    />
                    <div className="flex gap-2">
                        <Select label="Ordenar por"
                            value={filters.orderBy}
                            placeholder="Seleccione"
                            onChange={(value) => handleFilterChange(value as string, 'orderBy')}
                            className='!w-[var(--select-w-xs)]'
                        >
                            <SelectItem id='name'>Nombre</SelectItem>
                            <SelectItem id='created_at'>Fecha</SelectItem>
                            <SelectItem id='stock'>Stock</SelectItem>
                        </Select>
                        <Link
                            onClick={() => handleFilterChange(!desc, 'desc')}
                            to={'.'}
                            search={{...filters, page: 1}}
                            resetScroll={false}
                            className="mt-auto p-2 aspect-square text-[var(--color-text)] bg-[var(--color-form-select-bg)] hover:bg-[var(--color-form-select-bg)]/60 border-2 border-[var(--color-border)] rounded-[var(--border-radius-ui)] outline-none"
                        >
                            {filters.orderBy == 'stock'
                                ? (filters.desc ? <RiSortNumberDesc size={20}/> : <RiSortNumberAsc size={20}/>) 
                                : (filters.desc ? <RiSortAlphabetDesc size={20} /> : <RiSortAlphabetAsc size={20}/>)}
                        </Link>
                    </div>
                </div>
            </div>
            <AwaitWrapper<AxiosResponse<Project[]>> asyncData={projects} onCatch={(error) => {if(error instanceof AxiosError) checkAuth(); throw error;}}>
                {(response) => {
                    let chunks = chunk(response.data, Math.floor(limit/maxPages));
                    return chunks.length && chunks[(page-1)%maxPages] ? (
                        <>
                        <div className='m-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-5 gap-5'>
                            {chunks[(page-1)%maxPages].map((project) => (
                                <Card
                                    key={project.id} 
                                    title={project.name}
                                    {...(() => {
                                        switch (project.state) {
                                            case 'active': return {status:{text:'Activo', color:'var(--color-success)'}};
                                            case 'planning': return {status:{text:'En planificación', color:'var(--color-primary)'}};
                                            case 'paused':   return {status:{text:'Pausado', color:'var(--color-warning)'}};
                                            case 'completed':   return {status:{text:'Terminado', color:'var(--color-success)'}};
                                            case 'cancelled':   return {status:{text:'Cancelado', color:'var(--color-danger)'}};
                                            default:        return null;
                                        }
                                    })()}
                                    description={''} 
                                    subtitle={project.user_name} 
                                    {... project.image_url ? {image:'/' + project.image_url} : {}}
                                    link={{pathname: '/manager/projects/$id', id: project.id}}
                                />
                            ))}
                        </div>
                        <Pagination 
                            maxPages={maxPages} 
                            totalPages={chunks.length} 
                            currentPage={page} 
                            cursor={Math.floor((page-1)/maxPages)} 
                            filters={filters}
                            mask={{ 
                                orderBy: undefined, 
                                desc: undefined, 
                                search: undefined, 
                                ...(filters.category === 0 && {category: undefined}),
                                ...(filters.manufacturer === 0 && {manufacturer: undefined})
                            }}
                        />
                        </>
                    ) :
                    (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400 text-sm">
                            <strong>No se han encontrado resultados</strong>
                        </div>
                    )
                }}
            </AwaitWrapper>
        </div>
    )
}