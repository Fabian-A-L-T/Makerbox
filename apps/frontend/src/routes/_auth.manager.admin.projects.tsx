import { createFileRoute } from '@tanstack/react-router'
import { fetchData } from '@utils/CRUDUtils';
import type { Project } from '../interfaces/schemas';
import Projects from '@views/admin/Projects';

export const Route = createFileRoute('/_auth/manager/admin/projects')({
  loaderDeps: ({search}) => ({
        page: search.page, 
        search: search.search, 
        orderBy: search.orderBy, 
        desc: search.desc 
    }),
    loader: async ({deps: {page, search, orderBy, desc}, context: { pagination: {limit, maxPages} }}) => {
        const data = fetchData<Project>('/api/projects', {pagination: {page, limit, maxPages}, search, orderBy, desc});
        return { data };
    },
    shouldReload({deps: {page}, context: {pagination: {maxPages}}}) {
        return (page - 1) % maxPages === 0;
    },
    component: Projects
});
