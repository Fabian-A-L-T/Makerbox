import { createFileRoute } from '@tanstack/react-router'
import NewProject from '@views/NewProject';

export const Route = createFileRoute('/_auth/manager/newProject')({
    component: NewProject,
});
