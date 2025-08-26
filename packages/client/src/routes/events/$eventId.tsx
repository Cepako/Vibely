import { createFileRoute } from '@tanstack/react-router';
import EventDetailPage from '../../components/events/EventDetailPage';

export const Route = createFileRoute('/events/$eventId')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className='h-full w-full'>
            <EventDetailPage />
        </div>
    );
}
