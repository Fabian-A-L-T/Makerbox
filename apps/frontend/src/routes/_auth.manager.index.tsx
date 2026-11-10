import { createFileRoute } from '@tanstack/react-router';
import Home from '@views/Home';
import ReaderHome from '@views/ReaderHome';

export const Route = createFileRoute('/_auth/manager/')({
	component: HomeComponent,
});

function HomeComponent() {
	const { auth: { user } } = Route.useRouteContext();
	if(user?.role === 'reader') {
		return (
			<ReaderHome/>
		)
	}
	return (
		<Home/>
	)
}
