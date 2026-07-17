import { createFileRoute } from '@tanstack/react-router';
import { resourceQuerySchema } from '../interfaces/schemas';
import Tools from '@views/Tools';
import { object, optional, pipe, number, minValue, picklist } from "valibot";

const toolQuerySchema = object({
	...resourceQuerySchema.entries,
	category: optional(pipe(number(), minValue(0, 'El valor debe ser positivo'))),
	manufacturer: optional(pipe(number(), minValue(0, 'El valor debe ser positivo'))),
	state: optional(picklist(['', 'available', 'in_use', 'maintenance', 'disposed', 'lent'])),
});

export const Route = createFileRoute('/_auth/manager/tools/')({
	validateSearch: toolQuerySchema,
	component: Tools,
});
