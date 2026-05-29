import Card from "@components/ui/Card";
import { RiFilterLine, RiSearchLine, RiCloseLine, RiSortNumberAsc, RiSortNumberDesc, RiSortAlphabetDesc, RiSortAlphabetAsc } from '@remixicon/react';
import "@styles/components.css";
import type { Category, Component, Manufacturer } from '@utils/schemas';
import useFetch from '@utils/useFetch';
import Pagination from "@components/ui/Pagination";
import { getRouteApi, Link } from '@tanstack/react-router';
import StatusWrapper from "@components/StatusWrapper";
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const route = getRouteApi('/_auth/manager/components');

function Components() {
    const { page = 1 } = route.useSearch();
    const { data: components, maxPages, status, filter, setFilter } = useFetch<Component>({url: '/api/components', page});

    // Local search state with debounce
    const [searchInput, setSearchInput] = useState(filter.search ?? '');
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Categories & manufacturers for selects
    const [categories, setCategories] = useState<Category[]>([]);
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);

    useEffect(() => {
        axios.get<Category[]>('/api/component-categories').then(r => setCategories(r.data)).catch(() => {});
        axios.get<Manufacturer[]>('/api/manufacturers').then(r => setManufacturers(r.data)).catch(() => {});
    }, []);

    function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setSearchInput(value);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setFilter(prev => ({ ...prev, cursor: 0, search: value || undefined }));
        }, 400);
    }

    function clearSearch() {
        setSearchInput('');
        setFilter(prev => ({ ...prev, cursor: 0, search: undefined }));
    }

    function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const val = e.target.value;
        setFilter(prev => ({ ...prev, cursor: 0, category: val ? parseInt(val) : undefined }));
    }

    function handleManufacturerChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const val = e.target.value;
        setFilter(prev => ({ ...prev, cursor: 0, manufacturer: val ? parseInt(val) : undefined }));
    }

    function handleOrderByChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const val = e.target.value as 'id' | 'name' | '';
        setFilter(prev => ({ ...prev, cursor: 0, orderBy: val || undefined }));
    }

    function handleOrderDirChange() {
        setFilter(prev => ({ ...prev, cursor: 0, desc: !prev.desc }));
    }

    function next(){
        setFilter({
            ...filter,
            cursor: filter.cursor + 1
        });
    }

    function prev(){
        if(filter.cursor == 0) return;
        setFilter({ 
            ...filter,
            cursor: filter.cursor - 1
        });
    }

    return (
        <div>
            <div className="flex justify-between items-center">
                <h1 className="header-text">Componentes</h1>
            </div>
            <div className="filter-container flex flex-col gap-2">
                <div className="filter-header flex items-center gap-2">
                    <RiFilterLine/>
                    <h2>Filtros</h2>
                </div>
                <div className="filter-options flex gap-4 flex-wrap">
                    {/* Search */}
                    <div className="filter-field">
                        <label className="filter-label">Buscar</label>
                        <div className="filter-search-wrapper">
                            <RiSearchLine className="filter-search-icon" size={16}/>
                            <input
                                id="filter-search"
                                type="text"
                                placeholder="Nombre, SKU…"
                                value={searchInput}
                                onChange={handleSearchChange}
                                className="filter-search-input"
                            />
                            {searchInput && (
                                <button className="filter-clear-btn" onClick={clearSearch} aria-label="Limpiar búsqueda">
                                    <RiCloseLine size={14}/>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category */}
                    <div className="filter-field">
                        <label htmlFor="filter-category" className="filter-label">Categoría</label>
                        <select
                            id="filter-category"
                            value={filter.category ?? ''}
                            onChange={handleCategoryChange}
                        >
                            <option value="">Todas</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Manufacturer */}
                    <div className="filter-field">
                        <label htmlFor="filter-manufacturer" className="filter-label">Fabricante</label>
                        <select
                            id="filter-manufacturer"
                            value={filter.manufacturer ?? ''}
                            onChange={handleManufacturerChange}
                        >
                            <option value="">Todos</option>
                            {manufacturers.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Order by */}
                    <div className="filter-field">
                        <label htmlFor="filter-orderby" className="filter-label">Ordenar por</label>
                        <select
                            id="filter-orderby"
                            value={filter.orderBy ?? ''}
                            onChange={handleOrderByChange}
                        >
                            <option value="name">Nombre</option>
                            <option value="stock">Stock</option>
                        </select>
                    </div>

                    {/* Order direction */}
                    <div className="filter-field">
                        <Link
                            id="filter-orderdir"
                            onClick={handleOrderDirChange}
                            className="filter-btn"
                            to={'.'}
                            search={{page: 1}}
                            resetScroll={false}
                        >
                            {filter.orderBy == 'stock'
                                ? (filter.desc ? <RiSortNumberDesc /> : <RiSortNumberAsc />) 
                                : (filter.desc ? <RiSortAlphabetDesc /> : <RiSortAlphabetAsc />)}
                        </Link>
                    </div>
                </div>
            </div>
            <StatusWrapper status={status} loadingMsg="Buscando componentes...">
                <>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {components[(page-1)%maxPages] ? components[(page-1)%maxPages].map((component) => (
                        <Card
                            key={component.id} 
                            title={component.name} 
                            description={component.description} 
                            subtitle={component.manufacturer} 
                            image={'/' + component.image_url} 
                            footer={`Stock: ${component.stock}`} 
                            link={`/manager/components/${component.id}`}
                        />
                    )) : null}
                </div>
                <Pagination maxPages={maxPages} totalPages={components.length} currentPage={page} cursor={filter.cursor} prev={prev} next={next}/>
                </>
            </StatusWrapper>
        </div>
    )
}

export default Components