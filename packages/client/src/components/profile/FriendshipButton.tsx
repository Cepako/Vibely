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
} from './hooks/useFriendship';
import { useParams } from '@tanstack/react-router';
import { useState } from 'react';

interface FriendshipButtonProps {
    friendshipStatus: FriendshipStatus | null;
}

export default function FriendshipButton({
    friendshipStatus,
}: FriendshipButtonProps) {
    const params = useParams({ from: '/profile/$id' });
    const [showMenu, setShowMenu] = useState(false);
    const userId = Number(params.id);
    console.log(friendshipStatus);
    const sendRequestMutation = useSendFriendRequest();
    const removeFriendMutation = useRemoveFriend();
    const blockUserMutation = useBlockUser();
    const respondMutation = useRespondToFriendRequest();

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
            setShowMenu(false);
        } catch (error) {
            console.error('Failed to remove friend:', error);
        }
    };

    const handleBlockUser = async () => {
        try {
            await blockUserMutation.mutateAsync(userId);
            setShowMenu(false);
        } catch (error) {
            console.error('Failed to block user:', error);
        }
    };

    const handleAcceptRequest = async () => {
        // You'll need to pass the friendshipId here
        // This might require additional data from the profile
        console.log('Accept friend request');
    };

    const handleRejectRequest = async () => {
        // You'll need to pass the friendshipId here
        console.log('Reject friend request');
    };

    const renderButton = () => {
        // Handle null case (no friendship status)
        if (!friendshipStatus || friendshipStatus === 'none') {
            return (
                <button
                    onClick={handleSendRequest}
                    disabled={sendRequestMutation.isPending}
                    className='bg-primary-600 hover:bg-primary-700 flex items-center space-x-2 rounded-lg px-4 py-2 text-white transition-colors disabled:opacity-50'
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
                        className='flex cursor-not-allowed items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-600'
                    >
                        <IconClock size={18} />
                        <span>Request Sent</span>
                    </button>
                );

            case 'pending':
                return (
                    <div className='flex space-x-2'>
                        <button
                            onClick={handleAcceptRequest}
                            disabled={respondMutation.isPending}
                            className='flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50'
                        >
                            <IconUserCheck size={18} />
                            <span>Accept</span>
                        </button>
                        <button
                            onClick={handleRejectRequest}
                            disabled={respondMutation.isPending}
                            className='flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50'
                        >
                            <IconUserX size={18} />
                            <span>Reject</span>
                        </button>
                    </div>
                );

            case 'accepted':
                return (
                    <div className='relative'>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className='flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200'
                        >
                            <IconUserCheck size={18} />
                            <span>Friends</span>
                        </button>

                        {showMenu && (
                            <div className='absolute top-12 right-0 z-10 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg'>
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
                );

            case 'blocked_by_you':
                return (
                    <button
                        disabled
                        className='flex cursor-not-allowed items-center space-x-2 rounded-lg bg-red-100 px-4 py-2 text-red-600'
                    >
                        <IconUserX size={18} />
                        <span>Blocked</span>
                    </button>
                );

            case 'blocked_by_them':
                return (
                    <button
                        disabled
                        className='flex cursor-not-allowed items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-500'
                    >
                        <IconUserX size={18} />
                        <span>Unavailable</span>
                    </button>
                );

            default:
                return null;
        }
    };

    return (
        <>
            {renderButton()}

            {/* Click overlay to close menu */}
            {showMenu && (
                <div
                    className='fixed inset-0 z-0'
                    onClick={() => setShowMenu(false)}
                />
            )}
        </>
    );
}
