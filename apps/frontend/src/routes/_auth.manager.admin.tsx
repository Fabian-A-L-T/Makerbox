import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { resourceQuerySchema } from '../interfaces/schemas';
import ServerError from '@views/errors/ServerError';
import { StatusToast } from '@components/ReactAria/Toast';

export const Route = createFileRoute('/_auth/manager/admin')({
	validateSearch: resourceQuerySchema,
	errorComponent: ({error}) => ServerError(error),
	beforeLoad: ({ context: {auth} }) => {
		if (auth.user?.role !== 'admin') throw redirect({ to: '/manager'});
	},
	component: () => {
		return <><StatusToast/><Outlet/></>
	}
	
})
