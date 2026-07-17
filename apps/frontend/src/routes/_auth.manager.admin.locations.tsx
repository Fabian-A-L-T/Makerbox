import { createFileRoute } from '@tanstack/react-router'
import Locations from '@views/admin/Locations';

export const Route = createFileRoute('/_auth/manager/admin/locations')({
    component: Locations,
});
