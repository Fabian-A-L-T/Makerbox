import { createFileRoute } from '@tanstack/react-router';
import { fetchData } from '@utils/CRUDUtils';
import type { Component, ComponentLocation } from '@utils/schemas';
import ComponentInfo from '@views/ComponentInfo';

export const Route = createFileRoute('/_auth/manager/components/$id')({
  loader: async ({params: {id}}) => {
    const components = await fetchData<Component>(`/api/components/${id}`);
    const locations = await fetchData<ComponentLocation[]>(`/api/components/${id}/locations/`);
    return { components: components.data, locations: locations.data };
  },
  component: ComponentInfo,
});
