import { createFileRoute } from '@tanstack/react-router'
import { fetchData } from '@utils/CRUDUtils';
import type { Tool } from '../interfaces/schemas';
import ToolInfo from '@views/ToolInfo';

export const Route = createFileRoute('/_auth/manager/tools/$id')({
  loader: async ({params: {id}}) => {
      const tools = await fetchData<Tool>(`/api/tools/${id}`);
      return tools.data;
    },
  component: ToolInfo,
});
