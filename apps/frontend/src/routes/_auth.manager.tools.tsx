import { createFileRoute } from '@tanstack/react-router';
import { resourceQuerySchema } from '@utils/schemas'
import Components from '@views/Components'

export const Route = createFileRoute('/_auth/manager/tools')({
	validateSearch: resourceQuerySchema,
	component: Components,
})