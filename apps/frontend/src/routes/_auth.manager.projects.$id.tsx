import { createFileRoute } from '@tanstack/react-router'
import { fetchData } from '@utils/Utils';
import type { Project } from '../interfaces/schemas';
import ProjectInfo from '@views/ProjectInfo';

export const Route = createFileRoute('/_auth/manager/projects/$id')({
  loader: async ({params: {id}}) => {
    const project = await fetchData<Project>(`/api/projects/${id}`);
    return project.content;
  },
  component: ProjectInfo,
});
