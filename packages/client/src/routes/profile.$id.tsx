import { createFileRoute } from '@tanstack/react-router';
import ProfileView from '../components/profile/ProfileView';
import NavBar from '../components/NavBar';

export const Route = createFileRoute('/profile/$id')({
    component: Profile,
});
//TODO: not always pass 'me' in view only when profile id is equal logged user
function Profile() {
    return (
        <div className='bg-primary-50 flex h-screen w-full overflow-hidden'>
            <NavBar view='me' />
            <ProfileView />
        </div>
    );
}
