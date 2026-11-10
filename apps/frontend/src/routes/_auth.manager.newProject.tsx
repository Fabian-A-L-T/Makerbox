import { createFileRoute, redirect } from '@tanstack/react-router'
import NewProject from '@views/NewProject';

export const Route = createFileRoute('/_auth/manager/newProject')({
    beforeLoad: ({ context: {auth} }) => {
        if (auth.user?.role === 'reader') throw redirect({ to: '/manager'});
    },
    component: NewProject,
});
