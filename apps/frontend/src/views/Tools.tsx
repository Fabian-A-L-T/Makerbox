import type { Category, Manufacturer, Tool } from '../interfaces/schemas';
import Pagination from "@components/ui/Pagination";
import { getRouteApi } from '@tanstack/react-router';
import { Select, SelectItem } from "@components/form/Select";
import { Breadcrumb, Breadcrumbs } from "@components/ui/Breadcrumbs";
import FilterBox from "@components/ui/FilterBox";
import { useAsyncList } from "react-aria-components";
import { fetchData, paginationParams } from "@utils/Utils";
import { ToolCardGrid } from "@components/ui/CardGrid";
import { useFetch } from '../hooks/useFetch';

export default function Tools() {

    const route = getRouteApi('/_auth/manager/tools/');
    const { page, desc, orderBy, category, manufacturer, search, state } = route.useSearch();
    const { limit, maxPages } = paginationParams;
    const aditionalFilters = {
        ...(category && {category}),
        ...(manufacturer && {manufacturer}),
        ...(state && {state}),
    }
    const { chunks, chunkIndex, dataLinks, status, filters, setFilters } = useFetch<Tool>({
        page, 
        apiRoute: '/tools',
        baseFilters: { search, orderBy, desc },
        aditionalFilters
    });

    const categories = useAsyncList<Category>({
        async load({cursor}){
            const { data } = await fetchData<Category>(cursor || `/tool-categories?limit=${limit}&offset=0`);
            return {
                items: data.content,
                cursor: data.links?.next
            }
        },
    });
    
    const manufacturers = useAsyncList<Manufacturer>({
        async load({cursor}){
            const { data } = await fetchData<Manufacturer>(cursor || `/manufacturers?limit=${limit}&offset=0`);
            return {
                items: data.content,
                cursor: data.links?.next
            }
        },
    });

    return (
        <>
        <Breadcrumbs className='m-5'>
            <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
            <Breadcrumb>Herramientas</Breadcrumb>
        </Breadcrumbs>
        <div className="m-5">
            <h1 className="text-3xl">Herramientas</h1>
            <span className="text-[var(--color-text-muted)] text-md">Aquí podrás encontrar las herramientas disponibles en inventario</span>
        </div>
        <FilterBox filters={filters} setFilters={setFilters}>
            <Select label="Categoría"
                value={filters.category || 0}
                placeholder="Seleccione"
                onChange={(value) => value !== null && setFilters((prev) => ({...prev, category: value as number}))}
                className='!w-[var(--select-w-sm)]'
                loadingState={categories.loadingState}
                onLoadMore={categories.loadMore}
            >
                <SelectItem key='' id={0} >Todos</SelectItem>
                {categories.items.map( (item) => <SelectItem key={item.id} id={item.id} >{item.name}</SelectItem>)}
            </Select>
            <Select label="Fabricante"
                value={filters.manufacturer || 0}
                placeholder="Seleccione"
                onChange={(value) => value !== null && setFilters((prev) => ({...prev, manufacturer: value as number}))}
                className='!w-[var(--select-w-sm)]'
                loadingState={manufacturers.loadingState}
                onLoadMore={manufacturers.loadMore}
            >
                <SelectItem key='' id={0} >Todos</SelectItem>
                {manufacturers.items.map( (item) => <SelectItem key={item.id} id={item.id} >{item.name}</SelectItem>)}
            </Select>
            <Select label="Estado" 
                value={filters.state || ''}
                placeholder="Seleccione"
                onChange={(value) => value !== null && setFilters((prev) => ({...prev, state: value as string}))}
                className='!w-[var(--select-w-sm)]'
            >
                <SelectItem id='' >Todos</SelectItem>
                <SelectItem id='available' >Disponible</SelectItem>
                <SelectItem id='in_use' >En uso</SelectItem>
                <SelectItem id='maintenance' >En mantenimiento</SelectItem>
                <SelectItem id='disposed' >Desechado</SelectItem>
                <SelectItem id='lent' >Prestado</SelectItem>
            </Select>
        </FilterBox>
        <ToolCardGrid data={chunks[chunkIndex] || []} status={status}/>
        <Pagination
            dataStatus={status}
            pagination={{page, maxPages, totalPages: chunks.length}}
            filters={filters}
            mask={{
                orderBy: undefined, 
                desc: undefined,
                ...(filters.category === 0 && {category: undefined}),
                ...(filters.manufacturer === 0 && {manufacturer: undefined}),
                ...(filters.state === '' && {state: undefined})
            }}
            hasPrev={dataLinks?.prev !== undefined}
            hasNext={dataLinks?.next !== undefined}
        />
        </>
    )
}
