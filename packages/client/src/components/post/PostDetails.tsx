import {
    IconChevronLeft,
    IconChevronRight,
    IconDots,
    IconHeart,
    IconMessageCircle,
    IconMessageReport,
    IconX,
} from '@tabler/icons-react';
import type { Post } from '../../types/post';
import UserAvatar from '../ui/UserAvatar';
import { cn, formatTimeAgo } from '../../utils/utils';
import { type ReactNode } from 'react';
import PrivacyIcon from './PrivacyIcon';
import DropdownMenu, { type DropdownMenuItem } from '../ui/DropdownMenu';
import CommentsSection from '../comment/CommentsSection';
import { useTogglePostLike } from '../comment/hooks/useComments';
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
    const { user } = useAuth();
    const togglePostLike = useTogglePostLike();

    const isLiked = post.postReactions.some(
        (reaction) => reaction.userId === user?.id
    );

    const handleLike = () => {
        togglePostLike.mutate(post.id);
    };

    const postMenuItems: DropdownMenuItem[] = [
        {
            id: 'report',
            label: 'Report',
            icon: <IconMessageReport />,
            onClick: () => console.log('Report post', post.id),
            className: 'p-2',
        },
    ];

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

            <div className='flex w-[40%] flex-col bg-white'>
                <div className='flex items-center justify-between border-b border-slate-200 p-4 shadow-sm'>
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
                    <div className='border-b border-slate-100 p-4'>
                        <div className='text-slate-800'>{post.content}</div>
                    </div>
                )}

                <CommentsSection
                    postId={post.id}
                    initialCommentsCount={post.comments.length}
                />

                <div className='border-t border-slate-200 bg-white'>
                    <div className='flex items-center space-x-4 p-4'>
                        <button
                            onClick={handleLike}
                            className={`transition-colors ${
                                isLiked
                                    ? 'text-red-500'
                                    : 'text-slate-600 hover:text-red-500'
                            }`}
                            disabled={togglePostLike.isPending}
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
