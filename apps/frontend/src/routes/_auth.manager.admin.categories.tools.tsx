import { createFileRoute } from '@tanstack/react-router'
import { fetchData } from '@utils/CRUDUtils';
import type { Category } from '@utils/schemas';
import ToolCategories from '@views/admin/ToolCategories';

export const Route = createFileRoute('/_auth/manager/admin/categories/tools')({
    loaderDeps: ({search}) => ({ 
        page: search.page, 
        search: search.search, 
        orderBy: search.orderBy,
        desc: search.desc
    }),
    loader: async ({deps: {page, search, orderBy, desc}, context: { pagination: {limit, maxPages} }}) => {
        const data = fetchData<Category>('/api/tool-categories', {page, limit, maxPages, search, orderBy, desc});
        const test = await 'asd';
        return { data, test };
    },
    shouldReload({deps: {page}, context: {pagination: {maxPages}}}) {
        return (page - 1) % maxPages === 0;
    },
    component: ToolCategories,
});
