import { createFileRoute, redirect } from '@tanstack/react-router'
import ServerError from '@views/errors/ServerError';

export const Route = createFileRoute('/_auth/manager/projects')({
	beforeLoad: ({ context: {auth} }) => {
		if (auth.user?.role === 'reader') throw redirect({ to: '/manager'});
	},
	errorComponent: ({error}) => ServerError(error)
});
