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

interface FetchFilter {
	pagination?: {
		page: number,
		maxPages: number,
		limit: number
	},
	search?: string,
	orderBy?: string,
	desc?: boolean,
	aditionalParams?: Record<string, string | number | boolean>
}

export async function fetchData<T>(apiRoute: string, filter?: FetchFilter){
	
	if(filter){
		const { pagination, search, orderBy, desc, aditionalParams} = filter;
		const cursor = pagination ? Math.floor((pagination.page-1)/pagination.maxPages) : 0;
		const params = new URLSearchParams({
			...(pagination && { offset: (pagination.limit * cursor).toString() }),
			...(pagination && { limit: (pagination.limit + 1).toString() }),
			...(search  && { search: search }),
			...(orderBy && { orderBy: orderBy }),
			...(desc    && { desc: desc.toString() }),
			...(aditionalParams)
		});
		console.log('Query: ' + `${apiRoute}?${params}`);
		return axios.get<T[]>(`${apiRoute}?${params}`);
	}
	else {
		return axios.get<T[]>(apiRoute);
	}
}

export type { ResourceFilter };
