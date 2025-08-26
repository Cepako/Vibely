import {
    IconMessage,
    IconUserMinus,
    IconUserX,
    IconDots,
} from '@tabler/icons-react';
import {
    useRemoveFriend,
    useBlockUser,
    type Friend,
} from './hooks/useFriendship';
import { Link } from '@tanstack/react-router';
import DropdownMenu, { type DropdownMenuItem } from '../ui/DropdownMenu';

interface FriendCardProps {
    friend: Friend;
    isFriendMe: boolean;
    isOwnProfile: boolean;
}

export default function FriendCard({
    friend,
    isFriendMe,
    isOwnProfile,
}: FriendCardProps) {
    const removeFriendMutation = useRemoveFriend();
    const blockUserMutation = useBlockUser();

    const handleRemoveFriend = async () => {
        try {
            await removeFriendMutation.mutateAsync(friend.id);
        } catch (error) {
            console.error('Failed to remove friend:', error);
        }
    };

    const handleBlockUser = async () => {
        try {
            await blockUserMutation.mutateAsync(friend.id);
        } catch (error) {
            console.error('Failed to block user:', error);
        }
    };

    const formatSince = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
        });
    };

    const friendMenuItems: DropdownMenuItem[] = [
        {
            id: 'remove',
            label: removeFriendMutation.isPending
                ? 'Removing...'
                : 'Remove Friend',
            icon: <IconUserMinus />,
            onClick: handleRemoveFriend,
            className: 'p-2',
        },
        {
            id: 'block',
            label: blockUserMutation.isPending ? 'Blocking...' : 'Block User',
            icon: <IconUserX />,
            onClick: handleBlockUser,
            className: 'p-2 text-rose-600',
        },
    ];

    return (
        <div className='rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md'>
            <div className='mb-3 flex items-start justify-between'>
                <Link
                    to='/profile/$id'
                    params={{ id: friend.id.toString() }}
                    className='flex min-w-0 flex-1 items-center space-x-3'
                >
                    <div className='relative'>
                        {friend.profilePictureUrl ? (
                            <img
                                src={friend.profilePictureUrl}
                                alt={`${friend.name} ${friend.surname}`}
                                className='h-12 w-12 rounded-full object-cover'
                            />
                        ) : (
                            <div className='bg-primary-200 text-primary-700 flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium'>
                                {friend.name[0]}
                            </div>
                        )}

                        {friend.isOnline && (
                            <div className='absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500'></div>
                        )}
                    </div>
                    <div className='min-w-0 flex-1'>
                        <p className='truncate font-semibold text-slate-900'>
                            {friend.name} {friend.surname}
                        </p>
                        <p className='text-sm text-slate-500'>
                            Friends since {formatSince(friend.since)}
                        </p>
                    </div>
                </Link>

                <div className='relative'>
                    {isOwnProfile && (
                        <DropdownMenu
                            trigger={
                                <IconDots className='cursor-pointer rounded-full p-1 duration-200 hover:bg-slate-100 hover:text-slate-500' />
                            }
                            items={friendMenuItems}
                            placement='bottom-start'
                            className='border-slate-300 shadow-lg'
                        />
                    )}
                </div>
            </div>

            {!isFriendMe && (
                <div className='flex space-x-2'>
                    <Link
                        to='/messages'
                        className='bg-primary-600 hover:bg-primary-700 flex flex-1 items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-white transition-colors'
                    >
                        <IconMessage size={16} className='mr-2' />
                        Message
                    </Link>
                </div>
            )}
        </div>
    );
}
