import { createFileRoute } from '@tanstack/react-router'
import { fetchData } from '@utils/CRUDUtils';
import { resourceQuerySchema, type Project } from '../interfaces/schemas';
import Projects from '@views/Projects';
import { AxiosError } from 'axios';

export const Route = createFileRoute('/_auth/manager/projects/')({
    validateSearch: resourceQuerySchema,
    beforeLoad: ({ context: {auth: {checkAuth}} }) => ({
      checkAuth,
      pagination: {
        limit: 8,
        maxPages: 2
      }
    }),
    loaderDeps: ({search}) => ({ 
      page: search.page, 
      search: search.search, 
      orderBy: search.orderBy,
      desc: search.desc
    }),
    loader: async ({deps: {page, search, orderBy, desc}, context: { auth: {checkAuth}, pagination: {limit, maxPages} }}) => {
      try {
        const projects = fetchData<Project>('/api/projects', {pagination: {page, limit, maxPages}, search, orderBy, desc});
        return { projects };
      }
      catch(error: any) {
        if(error instanceof AxiosError) checkAuth();
        throw error;
      }
    },
    shouldReload({deps: {page}, context: {pagination: {maxPages}}}) {
          return (page - 1) % maxPages === 0;
      },
    component: Projects,
});