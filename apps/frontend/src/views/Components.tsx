import type { Category, Component, Manufacturer } from '../interfaces/schemas';
import Pagination from "@components/ui/Pagination";
import { getRouteApi } from '@tanstack/react-router';
import { Select, SelectItem } from "@components/form/Select";
import { Breadcrumb } from "@components/ui/Breadcrumbs";
import { fetchData, paginationParams } from "@utils/Utils";
import { ComponentCardGrid } from "@components/ui/CardGrid";
import FilterBox from "@components/ui/FilterBox";
import { useAsyncList } from "react-aria-components";
import { useFetch } from '../hooks/useFetch';
import PageHeader from '@components/ui/PageHeader';

export default function Components() {
    const route = getRouteApi('/_auth/manager/components/');
    const { page, search, orderBy, desc, category, manufacturer } = route.useSearch();
    const { limit, maxPages } = paginationParams;
    const aditionalFilters = {
        ...(category && {category}),
        ...(manufacturer && {manufacturer}),
    }
    const { chunks, chunkIndex, dataLinks, status, filters, setFilters } = useFetch<Component>({
        page, 
        apiRoute: '/api/components',
        baseFilters: { search, orderBy, desc },
        aditionalFilters
    });
    
    const categories = useAsyncList<Category>({
        async load({cursor}){
            const data = await fetchData<Category>(cursor || `/api/component-categories?limit=${limit}&offset=0`);
            return {
                items: data.content,
                cursor: data.links?.next
            }
        },
    });

    const manufacturers = useAsyncList<Manufacturer>({
        async load({cursor}){
            const data = await fetchData<Manufacturer>(cursor || `/api/manufacturers?limit=${limit}&offset=0`);
            return {
                items: data.content,
                cursor: data.links?.next
            }
        },
    });

    const filterItems = [
        {id: 'created_at', name: 'Fecha'},
        {id: 'stock', name: 'Stock'}
    ];

    return (
        <>
        <PageHeader title="Componentes" description="Aquí podrás encontrar todos los componentes electronicos disponibles en inventario">
            <Breadcrumb href='/manager/'>Dashboard</Breadcrumb>
            <Breadcrumb>Componentes</Breadcrumb>
        </PageHeader>
        <FilterBox filters={filters} filterItems={filterItems} setFilters={setFilters}>
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
        </FilterBox>
        <ComponentCardGrid data={chunks[chunkIndex] || []} status={status}/>
        <Pagination 
            dataStatus={status}
            pagination={{page, maxPages, totalPages: chunks.length}}
            filters={filters}
            mask={{
                orderBy: undefined, 
                desc: undefined,
                ...(filters.search === '' && {search: undefined}),
                ...(filters.category === 0 && {category: undefined}),
                ...(filters.manufacturer === 0 && {manufacturer: undefined})
            }}
            hasPrev={dataLinks?.prev !== undefined}
            hasNext={dataLinks?.next !== undefined}
        />
        </>
    )
}
