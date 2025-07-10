import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import ErrorPage from '../components/error/ErrorPage';
import NotFoundPage from '../components/error/NotFoundPage';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const Route = createRootRoute({
    component: RootComponent,
    errorComponent: () => <ErrorPage />,
    notFoundComponent: () => <NotFoundPage />,
});

const queryClient = new QueryClient();

function RootComponent() {
    return (
        <QueryClientProvider client={queryClient}>
            <Outlet />
            <TanStackRouterDevtools />
            <Toaster />
        </QueryClientProvider>
    );
}
