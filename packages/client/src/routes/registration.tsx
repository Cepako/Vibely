import { createFileRoute } from '@tanstack/react-router';
import RegisterView from '../components/registration/RegistrationView';
import RegistrationProvider from '../components/registration/RegistrationProvider';

export const Route = createFileRoute('/registration')({
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
