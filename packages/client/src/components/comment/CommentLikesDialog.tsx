import { IconX, IconLoader, IconHeartFilled } from '@tabler/icons-react';
import { Dialog } from '../ui/Dialog';
import UserAvatar from '../ui/UserAvatar';
import { useNavigate } from '@tanstack/react-router';
import type { Comment } from '../../types/comment';
import { useCommentLikeInfo } from './hooks/useComments';

interface CommentLikesDialogProps {
    isOpen: boolean;
    onClose: () => void;
    comment: Comment;
}

export default function CommentLikesDialog({
    isOpen,
    onClose,
    comment,
}: CommentLikesDialogProps) {
    const navigate = useNavigate();
    const { data: likeInfo, isLoading, error } = useCommentLikeInfo(comment.id);

    const handleProfileClick = (userId: number) => {
        navigate({
            to: '/profile/$profileId',
            params: { profileId: userId.toString() },
        });
        onClose();
    };

    const likes = likeInfo?.users || [];

    return (
        <Dialog isOpen={isOpen} onClose={onClose} size='sm'>
            <div className='flex max-h-[70vh] flex-col rounded-xl bg-white'>
                <div className='flex items-center justify-between border-b border-slate-100 p-4'>
                    <div className='flex items-center space-x-2'>
                        <IconHeartFilled size={20} className='text-red-500' />
                        <h3 className='font-semibold text-slate-900'>
                            {likeInfo?.count || 0}{' '}
                            {(likeInfo?.count || 0) === 1 ? 'Like' : 'Likes'}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className='cursor-pointer rounded-full p-1 transition-colors hover:bg-slate-100'
                        aria-label='Close dialog'
                    >
                        <IconX size={20} className='text-slate-500' />
                    </button>
                </div>

                <div className='flex-1 overflow-y-auto'>
                    {isLoading ? (
                        <div className='flex items-center justify-center py-8'>
                            <IconLoader
                                size={24}
                                className='text-primary-600 animate-spin'
                            />
                        </div>
                    ) : error ? (
                        <div className='flex flex-col items-center justify-center px-4 py-8'>
                            <p className='text-center text-sm text-rose-500'>
                                Failed to load likes
                            </p>
                        </div>
                    ) : likes.length === 0 ? (
                        <div className='flex flex-col items-center justify-center px-4 py-8'>
                            <IconHeartFilled
                                size={32}
                                className='mb-3 text-rose-500'
                                fill='currentColor'
                            />
                            <p className='text-center text-sm text-slate-500'>
                                No likes yet
                            </p>
                        </div>
                    ) : (
                        <div className='divide-y divide-slate-50'>
                            {likes.map((user) => (
                                <div
                                    key={user.id}
                                    className='cursor-pointer p-3 transition-colors hover:bg-slate-50'
                                    onClick={() => handleProfileClick(user.id)}
                                >
                                    <div className='flex items-center space-x-3'>
                                        <UserAvatar user={user} size='md' />
                                        <div className='min-w-0 flex-1'>
                                            <p className='truncate font-medium text-slate-900'>
                                                {user.name} {user.surname}
                                            </p>
                                        </div>
                                        <IconHeartFilled
                                            size={16}
                                            className='text-red-500'
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
}
