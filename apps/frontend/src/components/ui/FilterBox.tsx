import { Button } from "@components/form/Button";
import { Select, SelectItem } from "@components/form/Select";
import TextField from "@components/form/TextField";
import { RiSearchLine, RiSortAsc, RiSortDesc } from "@remixicon/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

export interface FilterState {
    search?: string;
    orderBy?: string;
    desc?: string;
    [key: string]: string | number | undefined;
}

interface FilterboxProps {
    children?: ReactNode;
    filters: FilterState;
    /**Filter items for the select field. [NOTE]: The field already includes the name filter */
    filterItems?: {id: string, name: string}[]
    setFilters: Dispatch<SetStateAction<FilterState>>;
}

export default function FilterBox({children, filterItems, filters, setFilters} : FilterboxProps){
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
    const debouncedSearch = useDebouncedValue(searchInput, 500);

    useEffect(() => {
        if(debouncedSearch.length > 2 || !debouncedSearch){
            setFilters((prev) => {
                if(!debouncedSearch) delete prev.search;
                return {...prev, ...(debouncedSearch && { search: debouncedSearch as string })};
            });
        }
    }, [debouncedSearch, setFilters]);

    return (
        <div className="m-5 makerbox-box flex flex-col gap-5">
            <div className="pb-4 flex items-center gap-4 border-b-2 border-[var(--color-border)]">
                <TextField label="Buscar"
                    value={searchInput}
                    onChange={setSearchInput}
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
                        {filterItems && filterItems.map((item) => <SelectItem key={item.id} id={item.id}>{item.name}</SelectItem>)}
                    </Select>
                    <Link
                        onClick={() => setFilters((prev) => ({...prev, desc: filters.desc === 'true' ? 'false' : 'true' as string}))}
                        to={'.'}
                        search={{...filters, page: 1}}
                        resetScroll={false}
                        className="mt-auto p-2 aspect-square bg-[var(--color-form-select-bg)] hover:bg-[var(--color-form-select-bg)]/60 border-1 border-[var(--color-border)] rounded-[var(--border-radius-ui)] outline-none"
                    >
                        {filters.desc === 'true' ? <RiSortDesc size={18}/> : <RiSortAsc size={18}/>}
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