import { createFileRoute } from '@tanstack/react-router';
import Tools from '@views/admin/Tools';

export const Route = createFileRoute('/_auth/manager/admin/tools')({
    component: Tools,
});
