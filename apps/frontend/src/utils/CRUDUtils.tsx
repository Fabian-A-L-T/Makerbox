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

export function validateImgSize(image: File){
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = URL.createObjectURL(image);
		
		img.onload = () => {
			URL.revokeObjectURL(img.src);

			if (img.width  > 1600 || img.height > 1600) {
				reject('Las dimensiones no deben ser mayores a 1600x1600px');
			} 
			else {
				resolve(image);
			}
		};
		
		img.onerror = () => reject('Formato invalido');
	});
}

export async function fetchData<T>(apiRoute: string, filter?: FetchFilter){
	
	if(filter){
		const { pagination, search, orderBy, desc, aditionalParams} = filter;
		const cursor = pagination ? Math.floor((pagination.page-1)/pagination.maxPages) : 0;
		const params = new URLSearchParams({
			...(pagination 	&& { offset: (pagination.limit * cursor).toString(), limit: (pagination.limit + 1).toString() }),
			...(search  	&& { search: search }),
			...(orderBy 	&& { orderBy: orderBy }),
			...(desc    	&& { desc: desc.toString() }),
			...(aditionalParams)
		});
		const query = apiRoute.includes('?') ? `${apiRoute}&${params}` : `${apiRoute}?${params}`;
		console.log('Query: ' + query);
		return axios.get<T[]>(query);
	}
	else {
		return axios.get<T[]>(apiRoute);
	}
}

export type { ResourceFilter };
