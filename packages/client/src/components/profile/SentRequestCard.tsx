import { IconX } from '@tabler/icons-react';
import {
    useCancelFriendRequest,
    type SentRequest,
} from './hooks/useFriendship';
import { Link } from '@tanstack/react-router';

interface SentRequestCardProps {
    request: SentRequest;
}

export default function SentRequestCard({ request }: SentRequestCardProps) {
    const cancelMutation = useCancelFriendRequest();

    const handleCancel = async () => {
        try {
            await cancelMutation.mutateAsync(request.id);
        } catch (error) {
            console.error('Failed to cancel friend request:', error);
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
        <div className='rounded-lg border border-gray-200 bg-white p-4'>
            <div className='flex items-center justify-between'>
                <Link
                    to='/profile/$id'
                    params={{ id: request.user_friendId.id.toString() }}
                    className='flex flex-1 items-center space-x-3'
                >
                    <img
                        src={
                            request.user_friendId.profilePictureUrl ||
                            '/default-avatar.png'
                        }
                        alt={`${request.user_friendId.name} ${request.user_friendId.surname}`}
                        className='h-12 w-12 rounded-full object-cover'
                    />
                    <div>
                        <p className='font-semibold text-gray-900'>
                            {request.user_friendId.name}{' '}
                            {request.user_friendId.surname}
                        </p>
                        <p className='text-sm text-gray-500'>
                            Sent {formatTime(request.createdAt)}
                        </p>
                    </div>
                </Link>

                <div className='ml-4 flex items-center space-x-3'>
                    <span className='rounded-full bg-yellow-50 px-2 py-1 text-sm text-yellow-600'>
                        Pending
                    </span>
                    <button
                        onClick={handleCancel}
                        disabled={cancelMutation.isPending}
                        className='flex items-center justify-center rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50'
                    >
                        <IconX size={16} className='mr-1' />
                        {cancelMutation.isPending ? 'Canceling...' : 'Cancel'}
                    </button>
                </div>
            </div>
        </div>
    );
}
