import { Dialog } from '../ui/Dialog';
import { IconHeart, IconX } from '@tabler/icons-react';
import UserAvatar from '../ui/UserAvatar';
import type { Post } from '../../types/post';
import { useNavigate } from '@tanstack/react-router';

interface PostLikesDialogProps {
    isOpen: boolean;
    onClose: () => void;
    post: Post;
}

export default function PostLikesDialog({
    isOpen,
    onClose,
    post,
}: PostLikesDialogProps) {
    const navigate = useNavigate();
    const likes = post.postReactions || [];

    return (
        <Dialog isOpen={isOpen} onClose={onClose} size='md'>
            <div className='flex max-h-[80vh] w-full max-w-md flex-col rounded-lg bg-white'>
                <div className='flex items-center justify-between border-b border-slate-200 p-4'>
                    <div className='flex items-center space-x-2'>
                        <IconHeart
                            size={20}
                            className='text-red-500'
                            fill={'currentColor'}
                        />
                        <h2 className='text-lg font-semibold text-slate-900'>
                            Likes
                        </h2>
                        <span className='text-sm text-slate-500'>
                            ({likes.length})
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className='cursor-pointer rounded-full p-1 transition-colors hover:bg-slate-100'
                    >
                        <IconX
                            size={20}
                            className='text-slate-500 hover:text-slate-600'
                        />
                    </button>
                </div>

                <div className='flex-1 overflow-y-auto'>
                    {likes.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-8 text-slate-500'>
                            <IconHeart size={48} className='mb-2 opacity-50' />
                            <p className='text-sm'>No likes yet</p>
                        </div>
                    ) : (
                        <div className='space-y-3 p-4'>
                            {likes.map((reaction, index) => (
                                <div
                                    key={`${reaction.userId}-${index}`}
                                    onClick={() =>
                                        navigate({
                                            to: '/profile/$id',
                                            params: {
                                                id: reaction.userId.toString(),
                                            },
                                            reloadDocument: true,
                                        })
                                    }
                                    className='flex cursor-pointer items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-slate-50'
                                >
                                    <UserAvatar
                                        user={
                                            reaction.user || {
                                                id: reaction.userId,
                                                name: 'Unknown',
                                                surname: 'User',
                                                profilePicture: null,
                                            }
                                        }
                                        size='md'
                                    />
                                    <div className='flex-1'>
                                        <div className='font-medium text-slate-900'>
                                            {reaction.user?.name || 'Unknown'}{' '}
                                            {reaction.user?.surname || 'User'}
                                        </div>
                                    </div>
                                    <IconHeart
                                        size={16}
                                        fill={'currentColor'}
                                        className='text-red-500'
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
}
