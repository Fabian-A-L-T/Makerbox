import { createFileRoute, Outlet } from '@tanstack/react-router'
import MakerboxLayout from '@components/layouts/MakerboxLayout';
import NotFound from '@views/errors/NotFound';

export const Route = createFileRoute('/_auth/manager')({
	notFoundComponent: NotFound,
	component: RouteComponent,
})

function RouteComponent() {
	const { auth: { user, logout } } = Route.useRouteContext();
	return (
		<MakerboxLayout userData={user} logout={logout}>
			<Outlet />
		</MakerboxLayout>
	)
}
