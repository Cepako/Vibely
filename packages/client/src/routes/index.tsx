import { createFileRoute, redirect } from '@tanstack/react-router';
import LoginView from '../components/login/LoginView';

export const Route = createFileRoute('/')({
    beforeLoad: ({ context }) => {
        if (context.auth.isAuthenticated) {
            throw redirect({ to: '/home' });
        }
    },
    component: Index,
});

function Index() {
    return (
        <div className='bg-primary-50 h-screen w-full overflow-hidden'>
            <LoginView />;
        </div>
    );
}
