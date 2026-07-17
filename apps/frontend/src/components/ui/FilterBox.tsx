import { Button } from "@components/form/Button";
import { Select, SelectItem } from "@components/form/Select";
import TextField from "@components/form/TextField";
import { RiSearchLine, RiSortAlphabetAsc, RiSortAlphabetDesc, RiSortNumberAsc, RiSortNumberDesc } from "@remixicon/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

export interface FilterState {
    search?: string;
    orderBy?: string;
    desc?: string;
    [key: string]: string | number | undefined;
}

interface FilterboxProps {
    // children?: ReactNode | ((props: { filters: FilterState; }) => ReactNode);
    children?: ReactNode;
    filters: FilterState;
    setFilters: Dispatch<SetStateAction<FilterState>>;
}

export default function FilterBox({children, filters, setFilters} : FilterboxProps){
    const navigate = useNavigate();

    function useDebouncedValue<T>(value: T, delay = 500) {
        const [debounced, setDebounced] = useState(value);
        useEffect(() => {
            const id = setTimeout(() => setDebounced(value), delay);
            return () => clearTimeout(id);
        }, [value, delay]);
        return debounced;
    }

    const [searchInput, setSearchInput] = useState(filters.search || '');

    useEffect(() => {
        setSearchInput(filters.search || '');
    }, [filters.search]);

    const debouncedSearch = useDebouncedValue(searchInput, 500);

    useEffect(() => {
        setFilters((prev) => ({
            ...prev,
            ...(debouncedSearch && { search: debouncedSearch as string })
        }));
    }, [debouncedSearch, setFilters]);

    // const renderedChildren = typeof children === 'function'
    //     ? children({ filters })
    //     : children;

    return (
        <div className="m-5 makerbox-box flex flex-col gap-5">
            <div className="pb-4 flex items-center gap-4 border-b-2 border-[var(--color-border)]">
                <TextField label="Buscar"
                    value={searchInput}
                    onChange={(value) => {
                        setSearchInput(value as string);
                    }}
                    placeholder="Ej: LED Rojo" 
                    className='w-full border-r-2 border-[var(--color-border)] pr-4' 
                    icon={<RiSearchLine className="m-2" color="var(--color-text-muted)" size={18}/>}
                />
                <div className="flex gap-2">
                    <Select label="Ordenar por"
                        value={filters.orderBy || 'name'}
                        placeholder="Seleccione"
                        onChange={(value) => value && setFilters((prev) => ({...prev, orderBy: value as string}))}
                        className='!w-[var(--select-w-xs)]'
                    >
                        <SelectItem id='name'>Nombre</SelectItem>
                        <SelectItem id='created_at'>Fecha</SelectItem>
                        <SelectItem id='stock'>Stock</SelectItem>
                    </Select>
                    <Link
                        onClick={() => setFilters((prev) => ({...prev, desc: filters.desc === 'true' ? 'false' : 'true' as string}))}
                        to={'.'}
                        search={{...filters, page: 1}}
                        resetScroll={false}
                        className="mt-auto p-2 aspect-square bg-[var(--color-form-select-bg)] hover:bg-[var(--color-form-select-bg)]/60 border-2 border-[var(--color-border)] rounded-[var(--border-radius-ui)] outline-none"
                    >
                        {filters.orderBy == 'stock'
                            ? (filters.desc === 'true' ? <RiSortNumberDesc size={20}/> : <RiSortNumberAsc size={20}/>) 
                            : (filters.desc === 'true' ? <RiSortAlphabetDesc size={20} /> : <RiSortAlphabetAsc size={20}/>)}
                    </Link>
                </div>
            </div>
            {children && 
                <div className="flex justify-between gap-4 flex-wrap">
                    <div className="flex gap-2">
                        {children}
                    </div>
                    <Button 
                        variant="primary"
                        className='mt-auto'
                        onPress={() => {
                            setFilters((prev) => ({
                                ...(prev.search && {search: prev.search}),
                                ...(prev.orderBy && {orderBy: prev.orderBy}),
                                ...(prev.desc && {desc: prev.desc})
                            }));
                            navigate({to: '.'})
                        }}
                    >
                        Limpiar filtros
                    </Button>
                </div>
            }
        </div>
    )
}