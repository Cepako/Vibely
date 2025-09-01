import { IconUserCheck } from '@tabler/icons-react';
import { useUnblockUser, type BlockedUser } from './hooks/useFriendship';
import UserAvatar from '../ui/UserAvatar';

interface BlockedUserCardProps {
    user: BlockedUser;
}

export default function BlockedUserCard({ user }: BlockedUserCardProps) {
    const unblockMutation = useUnblockUser();

    const handleUnblock = async () => {
        try {
            await unblockMutation.mutateAsync(user.user_friendId.id);
        } catch (error) {
            console.error('Failed to unblock user:', error);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffInDays < 1) {
            return 'Today';
        } else if (diffInDays < 7) {
            return `${diffInDays}d ago`;
        } else if (diffInDays < 30) {
            const weeks = Math.floor(diffInDays / 7);
            return `${weeks}w ago`;
        } else {
            const months = Math.floor(diffInDays / 30);
            return `${months}mo ago`;
        }
    };

    return (
        <div className='rounded-lg border border-slate-200 bg-white p-4'>
            <div className='flex items-center justify-between'>
                <div className='flex flex-1 items-center space-x-3'>
                    <UserAvatar user={user.user_friendId as any} size='lg' />
                    <div>
                        <p className='font-semibold text-slate-900'>
                            {user.user_friendId.name}{' '}
                            {user.user_friendId.surname}
                        </p>
                        <p className='text-sm text-slate-500'>
                            Blocked {formatTime(user.createdAt)}
                        </p>
                    </div>
                </div>

                <div className='ml-4 flex items-center space-x-3'>
                    <span className='rounded-full bg-rose-50 px-2 py-1 text-sm text-rose-600'>
                        Blocked
                    </span>
                    <button
                        onClick={handleUnblock}
                        disabled={unblockMutation.isPending}
                        className='flex cursor-pointer items-center justify-center rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-100 disabled:opacity-50'
                    >
                        <IconUserCheck size={16} className='mr-1' />
                        {unblockMutation.isPending
                            ? 'Unblocking...'
                            : 'Unblock'}
                    </button>
                </div>
            </div>
        </div>
    );
}
