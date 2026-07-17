import { createFileRoute } from '@tanstack/react-router';
import Categories from '@views/admin/Categories';

export const Route = createFileRoute('/_auth/manager/admin/categories/components')({
	component: Categories,
});
