import { createFileRoute } from '@tanstack/react-router';
import Components from '@views/admin/Components';

export const Route = createFileRoute('/_auth/manager/admin/components')({
    component: Components,
})
