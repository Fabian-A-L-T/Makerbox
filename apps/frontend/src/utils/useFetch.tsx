import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import axios from "axios";
import chunk from 'lodash/chunk';
import type { ResourceFilter, Status } from './CRUDUtils';

interface UseFetchReturn<T> {
    data: T[][];
    maxPages: number;
    status: Status;
    filter: ResourceFilter;
    setFilter: Dispatch<SetStateAction<ResourceFilter>>;
}

export default function useFetch<T>({url, page}: {url: string, page: number}): UseFetchReturn<T> {
    const elementPerPage = 2;
    const limit = 4;
    const maxPages = Math.ceil(limit / elementPerPage);
    const [data, setData] = useState<T[][]>([]);
    const [status, setStatus] = useState<{ state: 'loading'|'success'|'error', msg?: string }>({ state: 'loading' });
    const [filter, setFilter] = useState<ResourceFilter>({cursor: Math.floor((page-1)/maxPages)});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setStatus({ state: 'loading' });
                const params = new URLSearchParams({
                    ...(limit && { limit: (limit + 1).toString() }),
                    ...(filter.search  && { search:   filter.search }),
                    ...(filter.category && { category: filter.category.toString() }),
                    ...(filter.manufacturer && { manufacturer: filter.manufacturer.toString() }),
                    ...({ offset:   (limit*filter.cursor).toString() }),
                    ...(filter.orderBy && { orderBy:  filter.orderBy }),
                    ...(filter.desc && { desc: filter.desc.toString() }),
                });
                console.log(`${url}?${params}`);
                const response = await axios.get<T[]>(`${url}?${params}`);
                if (!response.data || !response.data[(page-1)%maxPages]) {
                    setStatus({ state: 'error', msg: 'No se han encontrado resultados' });
                }
                else {
                    setTimeout(()=> {
                        setData(chunk(response.data, elementPerPage));
                        setStatus({ state: 'success' });
                    }, 500);
                }
            }
            catch (error: any) {
                setStatus({ state: 'error', msg: error.message });
            }
        };
        fetchData();
    }, [filter]);

    return { data, maxPages, status, filter, setFilter };
}