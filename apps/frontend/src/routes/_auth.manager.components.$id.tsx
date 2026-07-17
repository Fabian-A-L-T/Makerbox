import { createFileRoute } from '@tanstack/react-router';
import { fetchData } from '@utils/Utils';
import type { Component, ComponentLocation } from '../interfaces/schemas';
import ComponentInfo from '@views/ComponentInfo';

export const Route = createFileRoute('/_auth/manager/components/$id')({
  loader: async ({params: {id}}) => {
    const components = await fetchData<Component>(`/components/${id}`);
    const locations = await fetchData<ComponentLocation[]>(`/components/${id}/locations/`);
    return { components: components.data.content[0], locations: locations.data.content };
  },
  component: ComponentInfo,
});
