import { createRouter } from '@tanstack/react-router';
import { routeTree } from '../routeTree.gen';
import { BProgress } from '@bprogress/core';

BProgress.configure({
  showSpinner: false,
});

export const router = createRouter({
	routeTree,
	context: {
		auth: undefined!,
	},
	defaultPreload: false,
	scrollRestoration: true,
});

router.subscribe("onBeforeLoad", ({ fromLocation, pathChanged }) => {
  fromLocation && pathChanged && BProgress.start();
});
router.subscribe("onLoad", () => {
  BProgress.done();
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}