import { createFileRoute } from '@tanstack/react-router';
import NavBar from '../../components/NavBar';
import MessagesView from '../../components/messages/MessagesVIew';

export const Route = createFileRoute('/messages/')({
    beforeLoad: ({ context }) => {
        if (!context.auth.isAuthenticated) {
            throw new Error('unauthenticated');
        }
    },
    component: Messages,
});

function Messages() {
    return (
        <div className='bg-primary-50 flex h-screen w-full overflow-hidden'>
            <NavBar view='messages' />
            <MessagesView />
        </div>
    );
}
