import { createFileRoute, redirect } from '@tanstack/react-router';
import Login from '@views/Login';

export const Route = createFileRoute('/login')({
	beforeLoad: ({ context: {auth} }) => {
		if (auth.isAuthenticated) {
			throw redirect({ to: '/manager' });
		}
	},
	component: Login,
});
