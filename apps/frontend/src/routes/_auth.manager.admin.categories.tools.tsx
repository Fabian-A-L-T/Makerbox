import { createFileRoute } from '@tanstack/react-router'
import ToolCategories from '@views/admin/ToolCategories';

export const Route = createFileRoute('/_auth/manager/admin/categories/tools')({
    component: ToolCategories,
});
