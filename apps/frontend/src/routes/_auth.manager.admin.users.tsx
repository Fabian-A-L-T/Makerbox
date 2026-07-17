import { createFileRoute } from '@tanstack/react-router';
import Users from '@views/admin/Users';

export const Route = createFileRoute('/_auth/manager/admin/users')({
	component: Users,
})
