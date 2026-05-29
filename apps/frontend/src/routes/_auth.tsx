import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
	beforeLoad: ({ context: {auth} }) => {
		if (!auth.isAuthenticated) {
			throw redirect({
				to: '/login',
			});
		}
	},
	component: Outlet,
});