import { createFileRoute } from '@tanstack/react-router';
import ProfileView from '../../components/profile/ProfileView';
import NavBar from '../../components/NavBar';
import { useAuth } from '../../components/auth/AuthProvider';

export const Route = createFileRoute('/profile/$profileId')({
    beforeLoad: ({ context }) => {
        if (!context.auth.isAuthenticated) {
            throw new Error('unauthenticated');
        }
    },
    component: Profile,
});

function Profile() {
    const profileId = Number(Route.useParams().profileId);
    const { user } = useAuth();
    const isMyProfile = user?.id === profileId;
    return (
        <div className='bg-primary-50 flex h-screen w-full overflow-hidden'>
            <NavBar view={isMyProfile ? 'me' : undefined} />
            <ProfileView />
        </div>
    );
}
