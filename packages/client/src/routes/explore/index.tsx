import { createFileRoute } from '@tanstack/react-router';
import NavBar from '../../components/NavBar';

export const Route = createFileRoute('/explore/')({
    beforeLoad: ({ context }) => {
        if (!context.auth.isAuthenticated) {
            throw new Error('unauthenticated');
        }
    },
    component: Explore,
});

function Explore() {
    return (
        <div className='bg-primary-50 flex h-screen w-full overflow-hidden'>
            <NavBar view='explore' />
            Explore
        </div>
    );
}
