import { createFileRoute } from '@tanstack/react-router';
import Index from '@views/index';

export const Route = createFileRoute('/')({
	component: Index,
});
