import { createFileRoute } from '@tanstack/react-router';
import Manufacturers from '@views/admin/Manufacturers';

export const Route = createFileRoute('/_auth/manager/admin/manufacturers')({
    component: Manufacturers,
});
