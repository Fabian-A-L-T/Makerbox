import '@styles/main.css'
import ReactDOM from 'react-dom/client'
import { useEffect } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { useAuth, AuthProvider } from './auth'
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const rootElement = document.getElementById('root')!
const router = createRouter({
	routeTree,
	context: {
		auth: undefined!,
	},
	defaultPreload: false,
	scrollRestoration: true,
});

function InnerApp() {
	const auth = useAuth();
	
	useEffect(() => {
		router.invalidate();
	}, [auth]);

	return <RouterProvider router={router} context={{ auth }} />
}

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<AuthProvider>
			<InnerApp />
		</AuthProvider>
	)
}