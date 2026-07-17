import { createFileRoute } from '@tanstack/react-router';
import NotFound from '@views/errors/NotFound';
import ServerError from '@views/errors/ServerError';

export const Route = createFileRoute('/_auth/manager/tools')({
	notFoundComponent: NotFound,
	errorComponent: ({error}) => ServerError(error),
})
