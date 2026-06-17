import { createFileRoute } from '@tanstack/react-router';
import { type Project } from '../interfaces/schemas'
import { fetchData } from '@utils/CRUDUtils';
import Home from '@views/Home';

export const Route = createFileRoute('/_auth/manager/')({
	loader: async ({context: {auth: {user}}}) => {
		const recentProjects = fetchData<Project>('/api/projects', {pagination: {page:1, limit:5, maxPages:1}, orderBy: 'created_at', desc: true, aditionalParams: user ? {userId: user.id} : {}});
		const projectsByBudget = fetchData<Project>('/api/projects', {pagination: {page:1, limit:5, maxPages:1}, orderBy: 'budget', desc: true, aditionalParams: user ? {userId: user.id} : {}});
		return { recentProjects, projectsByBudget };
	},
	component: Home,
})
