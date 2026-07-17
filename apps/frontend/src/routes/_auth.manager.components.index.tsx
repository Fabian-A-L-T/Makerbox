import { createFileRoute } from '@tanstack/react-router';
import { resourceQuerySchema } from '../interfaces/schemas';
import Components from '@views/Components';
import { object, optional, pipe, number, minValue } from "valibot";

const componentsQuerySchema = object({
	...resourceQuerySchema.entries,
	category: optional(pipe(number(), minValue(0, 'El valor debe ser positivo'))),
	manufacturer: optional(pipe( number(), minValue(0, 'El valor debe ser positivo')))
});

export const Route = createFileRoute('/_auth/manager/components/')({
    validateSearch: componentsQuerySchema,
	component: Components,
});