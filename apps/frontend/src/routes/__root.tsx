import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
//import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import NotFound from '@views/errors/NotFound';
import { type AuthState } from '../auth';

interface MyRouterContext {
  auth: AuthState
}
//<TanStackRouterDevtools/>
export const Route = createRootRouteWithContext<MyRouterContext>()({
  	notFoundComponent: NotFound,
  	component: Outlet,
});