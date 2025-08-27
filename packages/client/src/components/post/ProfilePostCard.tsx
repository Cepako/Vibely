import {
    IconEdit,
    IconHeart,
    IconMessageCircle,
    IconPlayerPlayFilled,
    IconTrash,
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';

import type { Post } from '../../types/post';
import Tooltip from '../ui/Tooltip';
import { useDeletePost } from './hooks/usePosts';
import { Dialog, useDialog } from '../ui/Dialog';
import { useAuth } from '../auth/AuthProvider';
import EditPostForm from './EditPostForm';

interface ProfilePostCardProps {
    post: Post;
    onClick?: () => void;
}

export function ProfilePostCard({ post, onClick }: ProfilePostCardProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const deletePost = useDeletePost(post.user.id);
    const deletePostDialog = useDialog(false);
    const editPostDialog = useDialog(false);
    const isOwnProfile = user?.id === post.userId;

    const handleCardClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate({
                to: '/post/$postId',
                params: {
                    postId: String(post.id),
                },
            });
        }
    };

    return (
        <div
            className='group relative aspect-square w-[32%] cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-opacity'
            onClick={handleCardClick}
        >
            {post.contentUrl ? (
                <div className='h-full w-full'>
                    {post.contentType === 'photo' && (
                        <img
                            src={post.contentUrl}
                            alt='Post content'
                            className='h-full w-full object-cover'
                        />
                    )}
                    {post.contentType === 'video' && (
                        <div className='relative h-full w-full'>
                            <video
                                src={post.contentUrl}
                                className='h-full w-full object-cover'
                                muted
                                playsInline
                                preload='metadata'
                            />
                            <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                                <div className='bg-opacity-60 rounded-full bg-black p-3 shadow-lg'>
                                    <IconPlayerPlayFilled
                                        className='text-white'
                                        size={24}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4'>
                    <p className='line-clamp-4 text-center text-sm text-gray-600'>
                        {post.content}
                    </p>
                </div>
            )}

            <div className='bg-opacity-0 absolute inset-0 flex items-center justify-center bg-black opacity-0 transition-all duration-200 group-hover:opacity-50'></div>
            <div className='bg-opacity-0 absolute inset-0 flex items-center justify-center bg-transparent opacity-0 transition-all duration-200 group-hover:opacity-100'>
                {isOwnProfile && (
                    <div className='absolute top-1 right-1 flex items-center gap-1 text-white'>
                        <Tooltip content={<div className='text-sm'>Edit</div>}>
                            <IconEdit
                                size={20}
                                className='hover:text-primary-500 duration-200'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    editPostDialog.openDialog();
                                }}
                            />
                        </Tooltip>
                        <Tooltip
                            content={<div className='text-sm'>Delete</div>}
                        >
                            <IconTrash
                                size={20}
                                className='duration-200 hover:text-rose-500'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deletePostDialog.openDialog();
                                }}
                            />
                        </Tooltip>
                    </div>
                )}
                <div className='flex items-center space-x-6 text-white'>
                    <div className='flex items-center space-x-2'>
                        <IconHeart size={20} fill='white' />
                        <span className='font-semibold'>
                            {post.postReactions.length}
                        </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <IconMessageCircle size={20} fill='white' />
                        <span className='font-semibold'>
                            {post.comments.length}
                        </span>
                    </div>
                </div>
            </div>
            <Dialog
                isOpen={editPostDialog.isOpen}
                onClose={editPostDialog.closeDialog}
                size='lg'
            >
                <EditPostForm
                    post={post}
                    onClose={editPostDialog.closeDialog}
                />
            </Dialog>
            <Dialog
                isOpen={deletePostDialog.isOpen}
                onClose={deletePostDialog.closeDialog}
                size='sm'
            >
                <div
                    className='flex flex-col gap-3 bg-white p-4'
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className='text-lg font-bold text-slate-700'>
                        Are you sure you want to delete post?
                    </div>
                    <div className='flex w-full items-center justify-evenly gap-1'>
                        <button
                            className='flex-1 cursor-pointer rounded-lg bg-slate-100 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-200'
                            onClick={deletePostDialog.closeDialog}
                        >
                            Cancel
                        </button>
                        <button
                            className='flex-1 cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-white transition-colors hover:bg-rose-600'
                            onClick={() => deletePost.mutate(post.id)}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
