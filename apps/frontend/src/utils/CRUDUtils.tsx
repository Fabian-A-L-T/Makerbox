import axios from "axios";

interface ResourceFilter {
    cursor: number;
    currentPage?: number;
    search?: string;
    orderBy?: string;
    desc?: boolean;
    category?: number;
    manufacturer?: number;
    aditionalQueries?: Record<string, string | number>;
}

type Status = { state: 'loading'|'success'|'error', msg?: string };


interface FetchFilter {
    page: number,
    maxPages: number,
    limit: number,
    search?: string,
    orderBy?: string,
    desc?: boolean
}

export async function fetchData<T>(apiRoute: string, filter: FetchFilter){
  
  const {page, maxPages, limit, search, orderBy, desc} = filter;
  const cursor = Math.floor((page-1)/maxPages);

  console.log('Fetching data...');

  const params = new URLSearchParams({
    ...({ offset: (limit * cursor).toString() }),
    ...(limit   && { limit: (limit + 1).toString() }),
    ...(search  && { search: search }),
    ...(orderBy && { orderBy: orderBy }),
    ...(desc    && { desc: desc.toString() }),
  });
  return axios.get<T[]>(`${apiRoute}?${params}`);
}

export type { ResourceFilter, Status };
