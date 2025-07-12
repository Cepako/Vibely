import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import ErrorPage from '../components/error/ErrorPage';
import NotFoundPage from '../components/error/NotFoundPage';
import { Toaster } from 'react-hot-toast';
import type { AuthContextType as AuthContext } from '../components/auth/AuthProvider';
import { UnauthenticatedPage } from '../components/error/UnauthenticatedPage';

interface RouterContext {
    auth: AuthContext;
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootComponent,
    errorComponent: ({ error }) => {
        if (error?.message === 'unauthenticated') {
            return <UnauthenticatedPage />;
        }
        return <ErrorPage />;
    },
    notFoundComponent: () => <NotFoundPage />,
});

function RootComponent() {
    return (
        <>
            <Outlet />
            <TanStackRouterDevtools />
            <Toaster />
        </>
    );
}
