import { createFileRoute } from '@tanstack/react-router';
import { type Project } from '../interfaces/schemas'
import { fetchData } from '@utils/CRUDUtils';
import Home from '@views/Home';

export const Route = createFileRoute('/_auth/manager/')({
	loader: async () => {
		const toolData = fetchData<Tool>('/api/tools', {pagination: {page:1, limit:3, maxPages:1}, orderBy: 'created_at', desc: true});
		const componentData = fetchData<Component>('/api/components', {pagination: {page:1, limit:3, maxPages:1}, orderBy: 'created_at', desc: true});
		const test = await 'asd';
		return { toolData, componentData, test};
	},
	component: Home,
})
