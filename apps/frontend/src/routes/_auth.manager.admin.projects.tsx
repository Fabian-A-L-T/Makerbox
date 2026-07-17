import { createFileRoute } from '@tanstack/react-router';
import Projects from '@views/admin/Projects';

export const Route = createFileRoute('/_auth/manager/admin/projects')({
    component: Projects
});
