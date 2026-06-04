import { createFileRoute } from '@tanstack/react-router';
import { fetchData } from '@utils/CRUDUtils';
import type { Component } from '@utils/schemas';
import ComponentInfo from '@views/ComponentInfo';

export const Route = createFileRoute('/_auth/manager/components/$id')({
  loader: async ({params: {id}}) => {
    const component = await fetchData<Component>(`/api/components/${id}`);
    return component.data;
  },
  component: ComponentInfo,
});
