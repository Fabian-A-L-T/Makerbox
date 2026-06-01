import { createFileRoute } from '@tanstack/react-router'
import Locations from '@views/admin/Locations';
import { fetchData } from '@utils/CRUDUtils';

export const Route = createFileRoute('/_auth/manager/admin/locations')({
    loaderDeps: ({search}) => ({
        page: search.page, 
        search: search.search, 
        orderBy: search.orderBy, 
        desc: search.desc 
    }),
    loader: async ({deps: {page, search, orderBy, desc}, context: { pagination: {limit, maxPages} }}) => {
        const data = fetchData<Location>('/api/locations', {pagination: {page, limit, maxPages}, search, orderBy, desc});
        const test = await 'asd';
        return { data, test };
    },
    shouldReload({deps: {page}, context: {pagination: {maxPages}}}) {
        return (page - 1) % maxPages === 0;
    },
    component: Locations,
});
