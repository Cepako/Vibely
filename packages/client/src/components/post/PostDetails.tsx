import {
    IconChevronLeft,
    IconChevronRight,
    IconDots,
    IconEdit,
    IconHeart,
    IconMessageCircle,
    IconMessageReport,
    IconTrash,
    IconX,
} from '@tabler/icons-react';
import type { Post } from '../../types/post';
import UserAvatar from '../ui/UserAvatar';
import { cn, formatTimeAgo } from '../../utils/utils';
import { useState, type ReactNode } from 'react';
import PrivacyIcon from './PrivacyIcon';
import DropdownMenu, { type DropdownMenuItem } from '../ui/DropdownMenu';
import { useAuth } from '../auth/AuthProvider';

interface PostDetailsProps {
    post: Post;
    onClose: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    hasPrevious?: boolean;
    hasNext?: boolean;
}

export default function PostDetails({
    post,
    onClose,
    onPrevious,
    onNext,
    hasPrevious,
    hasNext,
}: PostDetailsProps) {
    const [newComment, setNewComment] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const { user } = useAuth();

    const postMenuItems: DropdownMenuItem[] = [
        {
            id: 'report',
            label: 'Report',
            icon: <IconMessageReport />,
            onClick: () => console.log('Report post', post.id),
            className: 'p-2',
        },
    ];

    if (user?.id === post.userId)
        postMenuItems.push(
            ...[
                {
                    id: 'edit',
                    label: 'Edit',
                    icon: <IconEdit />,
                    onClick: () => console.log('Edit post', post.id),
                    className: 'p-2',
                },
                {
                    id: 'delete',
                    label: 'Delete',
                    icon: <IconTrash />,
                    onClick: () => console.log('Delete post', post.id),
                    className: 'p-2',
                },
            ]
        );

    return (
        <div className='relative flex h-full overflow-hidden rounded-lg'>
            <div className='relative flex h-[80vh] max-h-[80vh] flex-1 items-center justify-center bg-black'>
                {hasPrevious && onPrevious && (
                    <PostNavigationButton
                        onClick={onPrevious}
                        icon={
                            <IconChevronLeft
                                size={24}
                                className='text-slate-800'
                            />
                        }
                        className='left-4'
                    />
                )}

                {post.contentUrl ? (
                    <>
                        {post.contentType === 'photo' && (
                            <img
                                src={post.contentUrl}
                                alt='Post content'
                                className='max-h-full max-w-full object-contain'
                            />
                        )}
                        {post.contentType === 'video' && (
                            <video
                                src={post.contentUrl}
                                controls
                                className='max-h-full max-w-full object-contain'
                            />
                        )}
                    </>
                ) : (
                    <div className='p-8 text-center text-white'>
                        <div className='text-lg'>{post.content}</div>
                    </div>
                )}

                {hasNext && onNext && (
                    <PostNavigationButton
                        onClick={onNext}
                        icon={
                            <IconChevronRight
                                size={24}
                                className='text-slate-800'
                            />
                        }
                        className='right-4'
                    />
                )}
            </div>

            <div className='flex w-[30%] flex-col'>
                <div className='flex items-center justify-between p-4 shadow'>
                    <div className='flex items-center space-x-3'>
                        <UserAvatar user={post.user} size='md' />
                        <div>
                            <div className='font-semibold text-slate-900'>
                                {post.user.name} {post.user.surname}
                            </div>
                            <div className='flex items-center space-x-2 text-sm text-slate-500'>
                                <span>{formatTimeAgo(post.createdAt)}</span>
                                <PrivacyIcon level={post.privacyLevel} />
                            </div>
                        </div>
                    </div>
                    <div className='flex items-center gap-1'>
                        <DropdownMenu
                            trigger={
                                <IconDots className='hover:text-primary-500 h-3 w-3 cursor-pointer duration-200' />
                            }
                            items={postMenuItems}
                            placement='bottom-start'
                            className='border-slate-300 shadow-lg'
                        />

                        <button
                            onClick={onClose}
                            className='cursor-pointer rounded-full p-1 hover:bg-slate-100'
                        >
                            <IconX size={20} className='text-slate-500' />
                        </button>
                    </div>
                </div>

                {post.content && post.contentUrl && (
                    <div className='p-4'>
                        <div className='text-slate-800'>{post.content}</div>
                    </div>
                )}

                <div className='flex-1 overflow-y-auto'>
                    {post.comments.map((comment) => (
                        <div
                            key={comment.id}
                            className='border-b border-slate-100 p-4'
                        >
                            <div className='flex space-x-3'>
                                <UserAvatar user={comment.user} size='sm' />
                                <div className='flex-1'>
                                    <div className='text-sm'>
                                        <span className='font-semibold text-slate-900'>
                                            {comment.user.name}{' '}
                                            {comment.user.surname}
                                        </span>{' '}
                                        <span className='text-slate-800'>
                                            {comment.content}
                                        </span>
                                    </div>
                                    <div className='mt-2 flex items-center space-x-4 text-xs text-slate-500'>
                                        <span>
                                            {formatTimeAgo(comment.createdAt)}
                                        </span>
                                        <button className='hover:text-slate-700'>
                                            Like
                                        </button>
                                        <button className='hover:text-slate-700'>
                                            Reply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='border-t border-slate-200'>
                    <div className='flex items-center space-x-4 p-4'>
                        <button
                            onClick={() => setIsLiked(!isLiked)}
                            className={`transition-colors ${isLiked ? 'text-red-500' : 'text-slate-600 hover:text-red-500'}`}
                        >
                            <IconHeart
                                size={24}
                                fill={isLiked ? 'currentColor' : 'none'}
                            />
                        </button>
                        <button className='text-slate-600 transition-colors hover:text-blue-500'>
                            <IconMessageCircle size={24} />
                        </button>
                    </div>

                    {post.postReactions.length > 0 && (
                        <div className='px-4 pb-2'>
                            <span className='text-sm font-semibold text-slate-900'>
                                {post.postReactions.length}{' '}
                                {post.postReactions.length === 1
                                    ? 'like'
                                    : 'likes'}
                            </span>
                        </div>
                    )}

                    <div className='border-t border-slate-100 p-4'>
                        <div className='flex space-x-3'>
                            <input
                                type='text'
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder='Add a comment...'
                                className='flex-1 border-none bg-transparent text-sm placeholder-slate-500 outline-none'
                            />
                            {newComment && (
                                <button
                                    onClick={() => setNewComment('')}
                                    className='text-sm font-semibold text-blue-500 hover:text-blue-700'
                                >
                                    Post
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface PostNavigationButtonProps {
    onClick: () => void;
    icon: ReactNode;
    className: string;
}

function PostNavigationButton({
    onClick,
    icon,
    className,
}: PostNavigationButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'hover:bg-opacity-100 absolute top-1/2 z-10 flex -translate-y-1/2 transform cursor-pointer items-center justify-center rounded-full bg-white p-1 opacity-20 shadow-lg transition-all duration-200 hover:opacity-100',
                className
            )}
        >
            {icon}
        </button>
    );
}
