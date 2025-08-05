import {
    IconMessage,
    IconUserMinus,
    IconUserX,
    IconDots,
} from '@tabler/icons-react';
import { useState } from 'react';
import {
    useRemoveFriend,
    useBlockUser,
    type Friend,
} from './hooks/useFriendship';
import { Link } from '@tanstack/react-router';

interface FriendCardProps {
    friend: Friend;
}

export default function FriendCard({ friend }: FriendCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const removeFriendMutation = useRemoveFriend();
    const blockUserMutation = useBlockUser();

    const handleRemoveFriend = async () => {
        try {
            await removeFriendMutation.mutateAsync(friend.id);
            setShowMenu(false);
        } catch (error) {
            console.error('Failed to remove friend:', error);
        }
    };

    const handleBlockUser = async () => {
        try {
            await blockUserMutation.mutateAsync(friend.id);
            setShowMenu(false);
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

    return (
        <div className='rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md'>
            <div className='mb-3 flex items-start justify-between'>
                <Link
                    to='/profile/$id'
                    params={{ id: friend.id.toString() }}
                    className='flex min-w-0 flex-1 items-center space-x-3'
                >
                    <div className='relative'>
                        <img
                            src={
                                friend.profilePictureUrl ||
                                '/default-avatar.png'
                            }
                            alt={`${friend.name} ${friend.surname}`}
                            className='h-12 w-12 rounded-full object-cover'
                        />
                        {friend.isOnline && (
                            <div className='absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500'></div>
                        )}
                    </div>
                    <div className='min-w-0 flex-1'>
                        <p className='truncate font-semibold text-gray-900'>
                            {friend.name} {friend.surname}
                        </p>
                        <p className='text-sm text-gray-500'>
                            Friends since {formatSince(friend.since)}
                        </p>
                    </div>
                </Link>

                <div className='relative'>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className='rounded-full p-1 transition-colors hover:bg-gray-100'
                    >
                        <IconDots size={20} className='text-gray-400' />
                    </button>

                    {showMenu && (
                        <div className='absolute top-8 right-0 z-10 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg'>
                            <button
                                onClick={handleRemoveFriend}
                                disabled={removeFriendMutation.isPending}
                                className='flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                            >
                                <IconUserMinus size={16} className='mr-2' />
                                {removeFriendMutation.isPending
                                    ? 'Removing...'
                                    : 'Remove Friend'}
                            </button>
                            <button
                                onClick={handleBlockUser}
                                disabled={blockUserMutation.isPending}
                                className='flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50 disabled:opacity-50'
                            >
                                <IconUserX size={16} className='mr-2' />
                                {blockUserMutation.isPending
                                    ? 'Blocking...'
                                    : 'Block User'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className='flex space-x-2'>
                <Link
                    to='/messages' // Adjust to your messages route
                    className='bg-primary-600 hover:bg-primary-700 flex flex-1 items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-white transition-colors'
                >
                    <IconMessage size={16} className='mr-2' />
                    Message
                </Link>
            </div>

            {/* Click overlay to close menu */}
            {showMenu && (
                <div
                    className='fixed inset-0 z-0'
                    onClick={() => setShowMenu(false)}
                />
            )}
        </div>
    );
}
