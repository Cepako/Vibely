import { createFileRoute } from '@tanstack/react-router';
import NavBar from '../../components/NavBar';
import { NotificationView } from '../../components/notifications/NotificationView';

export const Route = createFileRoute('/notifications/')({
    beforeLoad: ({ context }) => {
        if (!context.auth.isAuthenticated) {
            throw new Error('unauthenticated');
        }
    },
    component: Notifications,
});

function Notifications() {
    return (
        <div className='bg-primary-50 flex h-screen w-full overflow-hidden'>
            <NavBar view='notifications' />
            <NotificationView />
        </div>
    );
}
