import type { FilterState } from "@components/ui/FilterBox";
import { useQuery } from "@tanstack/react-query";
import { fetchData, paginationParams } from "@utils/Utils";
import { chunk } from "lodash";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";

interface UseFetchOptions {
    page: number,
    apiRoute: string,
    baseFilters?: {
        search?: string,
        orderBy?: string,
        desc?: string
    },
    aditionalFilters?: {
        [key: string]: string | number | undefined
    }
}

interface UseFetchReturn<T> {
    chunks: T[][],
    chunkIndex: number,
    chunkCursor: number,
    dataLinks?: {
        start: string;
        prev: string | undefined;
        next: string | undefined;
    },
    error: Error | null;
    status: "error" | "success" | "pending",
    filters: FilterState,
    setFilters: Dispatch<SetStateAction<FilterState>>
}

export function useFetch<T>({page, apiRoute, baseFilters, aditionalFilters}:UseFetchOptions): UseFetchReturn<T>{
    const { limit, maxPages } = paginationParams;
    const chunkCursor = useMemo(() =>   ~~((page - 1)/maxPages),[page]);
    const [filters, setFilters] = useState<FilterState>({
        ...(baseFilters?.search && {search: baseFilters.search}),
        ...(baseFilters?.orderBy && {orderBy: baseFilters.orderBy}),
        ...(baseFilters?.desc && {desc: baseFilters.desc}),
        ...aditionalFilters
    });

    const queryKey: (string | FilterState)[] = [apiRoute, chunkCursor.toString()];
    if(baseFilters || aditionalFilters) queryKey.push(filters);

    const {data, status, error} = useQuery({
        queryKey,
        queryFn: () => fetchData<T>(apiRoute, {page, maxPages, limit}, filters)
    });
    const chunks = useMemo(() => chunk(data?.content, ~~(limit / maxPages)), [data]);
    const chunkIndex = useMemo(() => (page-1)%maxPages, [page]);
    const dataLinks = data?.links;

    return { chunks, chunkIndex, chunkCursor, dataLinks, error, status, filters, setFilters }
}
