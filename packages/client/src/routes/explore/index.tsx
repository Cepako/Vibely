import { createFileRoute } from '@tanstack/react-router';
import NavBar from '../../components/NavBar';
import ExploreView from '../../components/explore/ExploreView';

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
        <div className='bg-primary-50 flex h-full w-full overflow-hidden'>
            <NavBar view='explore' />
            <ExploreView />
        </div>
    );
}
