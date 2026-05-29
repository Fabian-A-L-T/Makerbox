import { RiLoader4Line } from '@remixicon/react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { resourceQuerySchema } from '@utils/schemas';
import ServerError from '@views/errors/ServerError';

export const Route = createFileRoute('/_auth/manager/admin')({
	validateSearch: resourceQuerySchema,
	errorComponent: ({error}) => ServerError(error),
	pendingComponent: () => (
		<div className="flex flex-col items-center justify-center w-full">
			<RiLoader4Line size={64} color="var(--color-text)" className='animate-spin' />
			<span className='font-semibold ml-2 text-lg text-[var(--color-text)]'>Cargando...</span>
		</div>
	),
	beforeLoad: ({ context: {auth} }) => {
		if (auth.user?.role !== 'admin') throw redirect({ to: '/manager'});
	},
	component: Outlet,
})
