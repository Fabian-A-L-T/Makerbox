import { createFileRoute } from '@tanstack/react-router'
import { fetchData } from '@utils/CRUDUtils';
import type { Movement } from '../interfaces/schemas';
import Movements from '@views/admin/Movements'

export const Route = createFileRoute('/_auth/manager/admin/movements')({
    loaderDeps: ({search}) => ({
        page: search.page,
        orderBy: search.orderBy, 
        desc: search.desc 
    }),
    loader: async ({deps: {page, orderBy, desc}, context: { pagination: {limit, maxPages} }}) => {
        const movements = fetchData<Movement>('/api/movements', {pagination: {page, limit, maxPages}, orderBy, desc});
        return {movements};
    },
    shouldReload({deps: {page}, context: {pagination: {maxPages}}}) {
        return (page - 1) % maxPages === 0;
    },
    component: Movements,
});
