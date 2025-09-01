import { IconCheck, IconX } from '@tabler/icons-react';
import {
    useRespondToFriendRequest,
    type FriendRequest,
} from './hooks/useFriendship';
import { Link } from '@tanstack/react-router';
import UserAvatar from '../ui/UserAvatar';

interface FriendRequestCardProps {
    request: FriendRequest;
}

export default function FriendRequestCard({ request }: FriendRequestCardProps) {
    const respondMutation = useRespondToFriendRequest();

    const handleAccept = async () => {
        try {
            await respondMutation.mutateAsync({
                friendshipId: request.id,
                status: 'accepted',
            });
        } catch (error) {
            console.error('Failed to accept friend request:', error);
        }
    };

    const handleReject = async () => {
        try {
            await respondMutation.mutateAsync({
                friendshipId: request.id,
                status: 'rejected',
            });
        } catch (error) {
            console.error('Failed to reject friend request:', error);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60)
        );

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        }
    };

    return (
        <div className='rounded-lg border border-slate-200 bg-white p-4'>
            <div className='flex items-center justify-between'>
                <Link
                    to='/profile/$profileId'
                    params={{ profileId: request.user_userId.id.toString() }}
                    className='flex flex-1 items-center space-x-3'
                >
                    <UserAvatar user={request.user_userId as any} size='lg' />
                    <div>
                        <p className='font-semibold text-slate-900'>
                            {request.user_userId.name}{' '}
                            {request.user_userId.surname}
                        </p>
                        <p className='text-sm text-slate-500'>
                            {formatTime(request.createdAt)}
                        </p>
                    </div>
                </Link>

                <div className='ml-4 flex space-x-2'>
                    <button
                        onClick={handleAccept}
                        disabled={respondMutation.isPending}
                        className='bg-primary-600 hover:bg-primary-700 flex cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50'
                    >
                        <IconCheck size={16} className='mr-1' />
                        Accept
                    </button>
                    <button
                        onClick={handleReject}
                        disabled={respondMutation.isPending}
                        className='flex cursor-pointer items-center justify-center rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50'
                    >
                        <IconX size={16} className='mr-1' />
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
}
