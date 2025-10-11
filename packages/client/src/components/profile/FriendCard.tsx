import {
    IconMessage,
    IconUserMinus,
    IconUserX,
    IconDots,
    IconUserPlus,
} from '@tabler/icons-react';
import {
    useRemoveFriend,
    useBlockUser,
    useSendFriendRequest,
    type Friend,
} from './hooks/useFriendship';
import { Link } from '@tanstack/react-router';
import DropdownMenu, { type DropdownMenuItem } from '../ui/DropdownMenu';
import UserAvatar from '../ui/UserAvatar';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useWebSocketContext } from '../providers/WebSocketProvider';

interface FriendCardProps {
    friend: Friend;
    isMe: boolean;
    isFriend: boolean;
}

export default function FriendCard({
    friend,
    isMe,
    isFriend,
}: FriendCardProps) {
    const removeFriendMutation = useRemoveFriend();
    const blockUserMutation = useBlockUser();
    const sendRequest = useSendFriendRequest();
    const [requestSent, setRequestSent] = useState(false);
    const { isUserOnline } = useWebSocketContext();
    const isOnline = isUserOnline(friend.id);

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
            toast.success('User blocked');
        } catch (error) {
            console.error('Failed to block user:', error);
        }
    };

    const handleSendRequest = async () => {
        try {
            await sendRequest.mutateAsync(friend.id);
            setRequestSent(true);
            toast.success('Friend request sent');
        } catch (err) {
            console.error('Failed to send request', err);
            toast.error('Failed to send request');
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
            id: 'block',
            label: blockUserMutation.isPending ? 'Blocking...' : 'Block User',
            icon: <IconUserX />,
            onClick: handleBlockUser,
            className: 'p-2 text-rose-600',
        },
    ];
    if (isFriend)
        friendMenuItems.push({
            id: 'remove',
            label: removeFriendMutation.isPending
                ? 'Removing...'
                : 'Remove Friend',
            icon: <IconUserMinus />,
            onClick: handleRemoveFriend,
            className: 'p-2',
        });

    return (
        <div className='rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md'>
            <div className='mb-3 flex items-start justify-between'>
                <Link
                    to='/profile/$profileId'
                    params={{ profileId: friend.id.toString() }}
                    className='flex min-w-0 flex-1 items-center space-x-3'
                >
                    <div className='relative'>
                        <UserAvatar user={friend as any} size='lg' />

                        {isOnline && (
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
                    <DropdownMenu
                        trigger={
                            <IconDots className='cursor-pointer rounded-full p-1 duration-200 hover:bg-slate-100 hover:text-slate-500' />
                        }
                        items={friendMenuItems}
                        placement='bottom-start'
                        className='border-slate-300 shadow-lg'
                    />
                </div>
            </div>

            {!isMe && (
                <div className='flex space-x-2'>
                    {isFriend ? (
                        <Link
                            to={`/messages`}
                            search={{ userId: String(friend.id) }}
                            className='bg-primary-600 hover:bg-primary-700 flex flex-1 cursor-pointer items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-white transition-colors'
                        >
                            <IconMessage size={16} className='mr-2' />
                            Message
                        </Link>
                    ) : (
                        <button
                            onClick={handleSendRequest}
                            disabled={sendRequest.isPending || requestSent}
                            className='bg-primary-600 hover:bg-primary-700 flex flex-1 cursor-pointer items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            <IconUserPlus size={16} className='mr-2' />
                            {requestSent ? 'Request Sent' : 'Add Friend'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
