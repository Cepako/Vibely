import { createFileRoute } from '@tanstack/react-router';
import LoginView from '../components/login/LoginView';

export const Route = createFileRoute('/')({
    component: Index,
});

//TODO: add authentication logic here
function Index() {
    return (
        <div className='bg-primary-50 h-screen w-full overflow-hidden'>
            <LoginView />;
        </div>
    );
}
