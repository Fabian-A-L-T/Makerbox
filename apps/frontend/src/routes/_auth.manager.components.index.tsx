import { createFileRoute } from '@tanstack/react-router';
import { fetchData } from '@utils/CRUDUtils';
import { resourceQuerySchema, type Category, type Component, type Manufacturer } from '../interfaces/schemas';
import Components from '@views/Components';
import { AxiosError } from 'axios';
import { object, optional, pipe, number, minValue } from "valibot";

export const componentsQuerySchema = object({
	...resourceQuerySchema.entries,
	category: optional(pipe(number(), minValue(0, 'El valor debe ser positivo'))),
	manufacturer: optional(pipe(number(), minValue(0, 'El valor debe ser positivo')))
});

export const Route = createFileRoute('/_auth/manager/components/')({
    validateSearch: componentsQuerySchema,
	beforeLoad: ({ context: {auth: {checkAuth}} }) => ({
		checkAuth,
		pagination: {
			limit: 8,
			maxPages: 2
		}
	}),
	loaderDeps: ({search}) => ({ 
		page: search.page, 
		search: search.search, 
		orderBy: search.orderBy,
		desc: search.desc,
		category: search.category,
		manufacturer: search.manufacturer
	}),
	loader: async ({deps: {page, search, orderBy, desc, category, manufacturer}, context: { auth: {checkAuth}, pagination: {limit, maxPages} }}) => {
		try {
			const categories = await fetchData<Category>('/api/component-categories');
			const manufacturers = await fetchData<Manufacturer>('/api/manufacturers');
			const aditionalParams = {
				...(category && {category: category}),
				...(manufacturer && {manufacturer: manufacturer})
			};
			const components = fetchData<Component>('/api/components', {pagination: {page, limit, maxPages}, search, orderBy, desc, aditionalParams});
			return { categories, manufacturers, components};
		}
		catch(error: any) {
			if(error instanceof AxiosError) checkAuth();
			throw error;
		}
	},
	shouldReload({deps: {page}, context: {pagination: {maxPages}}}) {
        return (page - 1) % maxPages === 0;
    },
	component: Components,
});