import { createFileRoute } from '@tanstack/react-router';
import NavBar from '../../components/NavBar';

export const Route = createFileRoute('/messages/')({
    component: Messages,
});

function Messages() {
    return (
        <div className='bg-primary-50 flex h-screen w-full overflow-hidden'>
            <NavBar view='messages' />
            Messages
        </div>
    );
}
