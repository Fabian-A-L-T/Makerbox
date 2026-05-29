import { createFileRoute } from '@tanstack/react-router';
import Users from '@views/admin/Users';
import { type User} from '@utils/schemas';
import { fetchData } from '@utils/CRUDUtils';

export const Route = createFileRoute('/_auth/manager/admin/users')({
	loaderDeps: ({search}) => ({
		page: search.page, 
		search: search.search, 
		orderBy: search.orderBy, 
		desc: search.desc 
	}),
	loader: async ({deps: {page, search, orderBy, desc}, context: { pagination: {limit, maxPages} }}) => {
		const data = fetchData<User>('/api/users', {page, limit, maxPages, search, orderBy, desc});
		const test = await 'asd';
		return { data, test };
	},
	shouldReload({deps: {page}, context: {pagination: {maxPages}}}) {
		return (page - 1) % maxPages === 0;
	},
	component: Users,
})
