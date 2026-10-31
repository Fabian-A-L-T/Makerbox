import ReactDOM from 'react-dom/client';
import { useEffect, StrictMode } from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import AuthProvider from './providers/AuthProvider';
import '@styles/main.css';
import { router } from '@utils/router';
import { ProgressProvider } from '@bprogress/react';
import { useAuth } from './hooks/useAuth';

const rootElement = document.getElementById('root')!
const queryClient = new QueryClient();

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
		<StrictMode>
			<AuthProvider>
				<QueryClientProvider client={queryClient}>
					<ProgressProvider>
						<InnerApp />
						<ReactQueryDevtools initialIsOpen={false} />
					</ProgressProvider>
				</QueryClientProvider>
			</AuthProvider>
		</StrictMode>
	)
}