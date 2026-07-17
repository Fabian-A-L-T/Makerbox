import { createFileRoute } from '@tanstack/react-router'
import { resourceQuerySchema } from '../interfaces/schemas';
import Projects from '@views/Projects';
import { object, optional, picklist } from 'valibot';

const projectQuerySchema = object({
	...resourceQuerySchema.entries,
	state: optional(picklist(['', 'planning', 'active', 'paused', 'completed', 'cancelled'])),
});

export const Route = createFileRoute('/_auth/manager/projects/')({
    validateSearch: projectQuerySchema,
    component: Projects,
});