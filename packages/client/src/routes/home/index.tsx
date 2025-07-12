import { createFileRoute } from '@tanstack/react-router';
import HomeView from '../../components/home/HomeView';
import NavBar from '../../components/NavBar';

export const Route = createFileRoute('/home/')({
    beforeLoad: ({ context }) => {
        if (!context.auth.isAuthenticated && !context.auth.isLoading) {
            throw new Error('unauthenticated');
        }
    },
    component: Home,
});

function Home() {
    return (
        <div className='bg-primary-50 flex h-screen w-full overflow-hidden'>
            <NavBar view='home' />
            <HomeView />
        </div>
    );
}
