import { createFileRoute } from '@tanstack/react-router';
import NavBar from '../../components/NavBar';
import EventsView from '../../components/events/EventView';

export const Route = createFileRoute('/events/')({
    beforeLoad: ({ context }) => {
        if (!context.auth.isAuthenticated) {
            throw new Error('unauthenticated');
        }
    },
    component: Events,
});

function Events() {
    return (
        <div className='bg-primary-50 flex h-screen w-full overflow-hidden'>
            <NavBar view='events' />
            <EventsView />
        </div>
    );
}
