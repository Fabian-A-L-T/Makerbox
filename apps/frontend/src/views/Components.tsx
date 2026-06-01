import Card from "@components/ui/Card";
import { RiSearchLine, RiSortNumberAsc, RiSortNumberDesc, RiSortAlphabetDesc, RiSortAlphabetAsc } from '@remixicon/react';
import "@styles/components.css";
import type { Category, Component, Manufacturer } from '@utils/schemas';
import Pagination from "@components/ui/Pagination";
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { AxiosError, type AxiosResponse } from 'axios';
import TextField from "@components/form/TextField";
import { Select, SelectItem } from "@components/form/Select";
import { chunk } from "lodash";
import { Button } from "@components/form/Button";
import AwaitWrapper from "@components/AwaitWrapper";

export default function Components() {

    const route = getRouteApi('/_auth/manager/components');
    const { page, desc, orderBy, category, manufacturer, search } = route.useSearch();
    const {checkAuth, pagination: {limit, maxPages}} = route.useRouteContext();
    const { categories, manufacturers, components } = route.useLoaderData() as {categories: AxiosResponse<Category[]>, manufacturers: AxiosResponse<Manufacturer[]>, components: Promise<AxiosResponse<Component[]>>};
    const navigate = useNavigate();

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [filters, setFilters] = useState<Record<string, any>>({
        page: page,
        search: search || '',
        desc: desc || false,
        orderBy: orderBy || 'name',
        category: category || 0,
        manufacturer: manufacturer || 0
    });

    function handleFilterChange(value: string | number | boolean, key: 'page' | 'search' | 'orderBy' | 'desc' | 'category' | 'manufacturer', debounce?: number) {
        
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
            <div className="flex flex-col">
                <h1 className="text-[var(--color-text)] text-2xl">Componentes</h1>
                <span className="text-[var(--color-text-muted)] text-md">Aquí podrás encontrar los componentes electronicos disponibles en inventario</span>
            </div>
            <div className="flex flex-col gap-4 my-8 p-4 text-[var(--color-text)] bg-[var(--color-card)] border-2 border-[var(--color-border)] rounded-[var(--border-radius-ui)]">
                <div className="pb-4 flex items-center gap-4 border-b-2 border-[var(--color-border)]">
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
                <div className="flex justify-between gap-4 flex-wrap">
                    <div className="flex gap-2">
                        <Select label="Categoría" 
                            defaultValue={0}
                            value={filters.category}
                            placeholder="Seleccione"
                            onChange={(value) => handleFilterChange(value as number, 'category')} 
                            items={categories.data} 
                            className='!w-[var(--select-w-sm)]'
                        >
                            <SelectItem key='' id={0} >Todos</SelectItem>
                            {categories.data.map( (item) => <SelectItem key={item.id} id={item.id} >{item.name}</SelectItem>)}
                        </Select>
                        <Select label="Fabricante" 
                            defaultValue={0}
                            value={filters.manufacturer}
                            placeholder="Seleccione"
                            onChange={(value) => handleFilterChange(value as number, 'manufacturer')}
                            className='!w-[var(--select-w-sm)]'
                        >
                            <SelectItem key='' id={0} >Todos</SelectItem>
                            {manufacturers.data.map( (item) => <SelectItem key={item.id} id={item.id} >{item.name}</SelectItem>)}
                        </Select>
                    </div>
                    <Button 
                        variant="primary"
                        className='my-auto'
                        onPress={() => {
                            setFilters((prev) => ({...prev, page:1, manufacturer: 0, category: 0}));
                            navigate({
                                to: '.', 
                                search: {...filters, page: 1, category: undefined, manufacturer:undefined},
                                mask: {to: '.', search: {page:1}}
                            })
                        }}
                    >
                        Limpiar filtros
                    </Button>
                </div>
            </div>
            <AwaitWrapper<AxiosResponse<Component[]>> asyncData={components} onCatch={(error) => {if(error instanceof AxiosError) checkAuth(); throw error;}}>
                {(response) => {
                    let chunks = chunk(response.data, Math.floor(limit/maxPages));
                    return chunks.length && chunks[(page-1)%maxPages] ? (
                        <>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-4'>
                            {chunks[(page-1)%maxPages].map((component) => (
                                <Card
                                    key={component.id} 
                                    title={component.name} 
                                    {... component.stock > component.stock_min 
                                        ? {status:{text:'Stock disponible', color:'var(--color-success)'}} 
                                        : (component.stock != 0) 
                                            ? {status:{text:'Quedan pocos', color:'var(--color-warning)'}}  
                                            : {status:{text:'Sin stock', color:'var(--color-danger)'}}}
                                    description={component.description} 
                                    subtitle={component.manufacturer} 
                                    {... component.image_url ? {image:'/' + component.image_url} : {}}
                                    link={`/manager/components/${component.id}`}
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
