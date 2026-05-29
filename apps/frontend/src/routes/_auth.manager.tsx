import { createFileRoute, Outlet } from '@tanstack/react-router'
import CMSLayout from '@layouts/CMSLayout';
import NotFound from '@views/errors/NotFound';

export const Route = createFileRoute('/_auth/manager')({
	notFoundComponent: NotFound,
	beforeLoad: () => ({
		pagination: {
			limit: 20,
			maxPages: 2
		}
	}),
	component: RouteComponent,
})

function RouteComponent() {
	const { auth: { user, logout } } = Route.useRouteContext();
	return (
		<CMSLayout userData={user} logout={logout}>
			<Outlet />
		</CMSLayout>
	)
}
