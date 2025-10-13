import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { NotificationWebSocketProvider } from './components/providers/NotificationWebSocketProvider';

const router = createRouter({
    routeTree,
    context: {
        auth: undefined!,
    },
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

function InnerApp() {
    const auth = useAuth();
    if (auth.isLoading) {
        return <div>Loading auth...</div>; //TODO: Loader
    }
    return <RouterProvider router={router} context={{ auth }} />;
}

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <NotificationWebSocketProvider>
                    <InnerApp />
                </NotificationWebSocketProvider>
            </AuthProvider>
        </QueryClientProvider>
    </StrictMode>
);
