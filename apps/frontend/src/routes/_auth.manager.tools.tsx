import { createFileRoute } from '@tanstack/react-router';
import ServerError from '@views/errors/ServerError';

export const Route = createFileRoute('/_auth/manager/tools')({
	errorComponent: ({error}) => ServerError(error)
})
