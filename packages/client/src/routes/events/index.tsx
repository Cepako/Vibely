import { createFileRoute } from '@tanstack/react-router';
import NavBar from '../../components/NavBar';

export const Route = createFileRoute('/events/')({
    component: Events,
});

function Events() {
    return (
        <div className='bg-primary-50 flex h-screen w-full overflow-hidden'>
            <NavBar view='events' />
            Events
        </div>
    );
}
