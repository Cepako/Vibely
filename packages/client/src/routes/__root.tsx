import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import ErrorPage from '../components/error/ErrorPage';
import NotFoundPage from '../components/error/NotFoundPage';

export const Route = createRootRoute({
    component: RootComponent,
    errorComponent: () => <ErrorPage />,
    notFoundComponent: () => <NotFoundPage />,
});

function RootComponent() {
    return (
        <>
            <Outlet />
            <TanStackRouterDevtools />
        </>
    );
}
