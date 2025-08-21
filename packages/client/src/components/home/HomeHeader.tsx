import UserAvatar from '../ui/UserAvatar';
import { useCurrentUser } from '../hooks/useCurrentUser';

export default function HomeHeader() {
    const currentUser = useCurrentUser();

    return (
        <div className='sticky top-0 z-10 border-b border-gray-200 bg-white'>
            <div className='mx-auto py-3 pr-[190px] pl-6'>
                <div className='flex w-full items-center justify-between'>
                    <h1 className='text-primary-600 text-2xl font-bold'>
                        Home
                    </h1>
                    <div className='flex items-center space-x-4'>
                        <input
                            type='text'
                            placeholder='Search...'
                            className='focus:ring-primary-500 w-80 rounded-full bg-gray-100 px-4 py-2 outline-none focus:ring-1'
                        />
                        {currentUser.data && (
                            <UserAvatar user={currentUser.data} size='sm' />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
