import {
    IconUserPlus,
    IconUserMinus,
    IconUserX,
    IconUserCheck,
    IconClock,
} from '@tabler/icons-react';
import {
    useSendFriendRequest,
    useRemoveFriend,
    useBlockUser,
    useRespondToFriendRequest,
    type FriendshipStatus,
    useFriendRequests,
} from './hooks/useFriendship';
import { useParams } from '@tanstack/react-router';
import type { DropdownMenuItem } from '../ui/DropdownMenu';
import DropdownMenu from '../ui/DropdownMenu';

interface FriendshipButtonProps {
    friendshipStatus: FriendshipStatus | null;
}

export default function FriendshipButton({
    friendshipStatus,
}: FriendshipButtonProps) {
    const params = useParams({ from: '/profile/$id' });
    const userId = Number(params.id);

    const sendRequestMutation = useSendFriendRequest();
    const removeFriendMutation = useRemoveFriend();
    const blockUserMutation = useBlockUser();
    const respondMutation = useRespondToFriendRequest();
    const { data: friendRequests } = useFriendRequests();

    const handleSendRequest = async () => {
        try {
            await sendRequestMutation.mutateAsync(userId);
        } catch (error) {
            console.error('Failed to send friend request:', error);
        }
    };

    const handleRemoveFriend = async () => {
        try {
            await removeFriendMutation.mutateAsync(userId);
        } catch (error) {
            console.error('Failed to remove friend:', error);
        }
    };

    const handleBlockUser = async () => {
        try {
            await blockUserMutation.mutateAsync(userId);
        } catch (error) {
            console.error('Failed to block user:', error);
        }
    };

    const handleAcceptRequest = async () => {
        try {
            const request = friendRequests?.find(
                (req) => req.user_userId.id === userId
            );
            if (request) {
                await respondMutation.mutateAsync({
                    friendshipId: request.id,
                    status: 'accepted',
                });
            } else {
                console.error('Friend request not found');
            }
        } catch (error) {
            console.error('Failed to accept friend request:', error);
        }
    };

    const handleRejectRequest = async () => {
        try {
            const request = friendRequests?.find(
                (req) => req.user_userId.id === userId
            );
            if (request) {
                await respondMutation.mutateAsync({
                    friendshipId: request.id,
                    status: 'rejected',
                });
            } else {
                console.error('Friend request not found');
            }
        } catch (error) {
            console.error('Failed to reject friend request:', error);
        }
    };

    const renderButton = () => {
        if (!friendshipStatus || friendshipStatus === 'none') {
            return (
                <button
                    onClick={handleSendRequest}
                    disabled={sendRequestMutation.isPending}
                    className='bg-primary-600 hover:bg-primary-700 flex cursor-pointer items-center space-x-2 rounded-lg px-4 py-2 text-white transition-colors disabled:opacity-50'
                >
                    <IconUserPlus size={18} />
                    <span>
                        {sendRequestMutation.isPending
                            ? 'Sending...'
                            : 'Add Friend'}
                    </span>
                </button>
            );
        }

        switch (friendshipStatus) {
            case 'pending_sent':
                return (
                    <button
                        disabled
                        className='flex cursor-not-allowed items-center space-x-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-600'
                    >
                        <IconClock size={18} />
                        <span>Request Sent</span>
                    </button>
                );

            case 'pending_received':
                return (
                    <div className='flex space-x-2'>
                        <button
                            onClick={handleAcceptRequest}
                            disabled={respondMutation.isPending}
                            className='flex cursor-pointer items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 disabled:opacity-50'
                        >
                            <IconUserCheck size={18} />
                            <span>Accept</span>
                        </button>
                        <button
                            onClick={handleRejectRequest}
                            disabled={respondMutation.isPending}
                            className='flex cursor-pointer items-center space-x-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50'
                        >
                            <IconUserX size={18} />
                            <span>Reject</span>
                        </button>
                    </div>
                );

            case 'accepted':
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
                        label: blockUserMutation.isPending
                            ? 'Blocking...'
                            : 'Block User',
                        icon: <IconUserX />,
                        onClick: handleBlockUser,
                        className: 'p-2 text-rose-600',
                    },
                ];

                return (
                    <DropdownMenu
                        trigger={
                            <div className='flex cursor-pointer items-center space-x-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-200'>
                                <IconUserCheck size={18} />
                                <span>Friends</span>
                            </div>
                        }
                        items={friendMenuItems}
                        placement='bottom-start'
                        className='border-slate-300 shadow-lg'
                    />
                );
            default:
                return null;
        }
    };

    return renderButton();
}
