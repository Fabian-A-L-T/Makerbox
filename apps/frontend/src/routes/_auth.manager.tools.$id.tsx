import { createFileRoute, notFound } from '@tanstack/react-router'
import { fetchData } from '@utils/Utils';
import type { Tool } from '../interfaces/schemas';
import ToolInfo from '@views/ToolInfo';
import { number, pipe, safeParse, string, toNumber } from 'valibot';

export const Route = createFileRoute('/_auth/manager/tools/$id')({
  beforeLoad: async ({params}) => {
    const validatedId = safeParse(pipe(string(), toNumber(), number('Número inválido')), params.id)
      if (!validatedId.success) {
        throw notFound();
      }

      const tools = await fetchData<Tool>(`/tools/${validatedId.output}`);
      return {data: tools.data.content[0]};
  },
  component: ToolInfo,
});
