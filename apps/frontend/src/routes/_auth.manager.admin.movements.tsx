import { createFileRoute } from '@tanstack/react-router';
import Movements from '@views/admin/Movements';

export const Route = createFileRoute('/_auth/manager/admin/movements')({
    component: Movements,
});
