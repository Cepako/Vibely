import { createFileRoute, redirect } from '@tanstack/react-router';
import RegisterView from '../components/registration/RegistrationView';
import RegistrationProvider from '../components/registration/RegistrationProvider';

export const Route = createFileRoute('/registration')({
    beforeLoad: ({ context }) => {
        if (context.auth.isAuthenticated) {
            throw redirect({ to: '/home' });
        }
    },
    component: Register,
});

function Register() {
    return (
        <RegistrationProvider>
            <div className='bg-primary-50 h-screen w-full overflow-hidden'>
                <RegisterView />
            </div>
        </RegistrationProvider>
    );
}
