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
import { type ReactNode, useRef } from 'react';
import PrivacyIcon from './PrivacyIcon';
import DropdownMenu, { type DropdownMenuItem } from '../ui/DropdownMenu';
import CommentsSection from '../comment/CommentsSection';
import { useTogglePostLike } from '../comment/hooks/useComments';
import { useAuth } from '../auth/AuthProvider';
import { usePosts } from './hooks/usePosts';
import { useDialog } from '../ui/Dialog';
import PostLikesDialog from './PostLikesDialog';

interface PostDetailsProps {
    post: Post;
    onClose: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    hasPrevious?: boolean;
    hasNext?: boolean;
}

export default function PostDetails({
    post: initialPost,
    onClose,
    onPrevious,
    onNext,
    hasPrevious,
    hasNext,
}: PostDetailsProps) {
    const { user } = useAuth();
    const { data: posts } = usePosts(initialPost.userId);
    const post = posts?.find((p) => p.id === initialPost.id) || initialPost;

    const togglePostLike = useTogglePostLike(post.userId);
    const likesDialog = useDialog(false);

    const commentsSectionRef = useRef<HTMLDivElement>(null);

    const isLiked = post.postReactions.some(
        (reaction) => reaction.userId === user?.id
    );

    const handleLike = () => {
        togglePostLike.mutate(post.id);
    };

    const handleLikesClick = () => {
        if (post.postReactions.length > 0) {
            likesDialog.openDialog();
        }
    };

    const handleCommentClick = () => {
        if (commentsSectionRef.current) {
            commentsSectionRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });

            setTimeout(() => {
                const commentTextarea =
                    commentsSectionRef.current?.querySelector('textarea');
                if (commentTextarea) {
                    commentTextarea.focus();
                }
            }, 300);
        }
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
        <>
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
                    <div className='flex items-center justify-between border-b border-slate-200 p-3 shadow-sm'>
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
                        <div className='border-b border-slate-100 p-3'>
                            <div className='max-h-[40px] overflow-y-auto text-sm text-slate-700'>
                                {post.content}
                            </div>
                        </div>
                    )}
                    <div className='border-b border-slate-200 bg-white'>
                        <div className='flex items-center space-x-4 p-3'>
                            <button
                                className={`flex cursor-pointer items-center gap-1 transition-colors ${
                                    isLiked
                                        ? 'text-rose-500'
                                        : 'text-slate-600 hover:text-rose-500'
                                }`}
                                disabled={togglePostLike.isPending}
                            >
                                <IconHeart
                                    size={24}
                                    fill={isLiked ? 'currentColor' : 'none'}
                                    onClick={handleLike}
                                />
                                <button
                                    onClick={handleLikesClick}
                                    className={`font-semibold transition-colors ${
                                        post.postReactions.length > 0
                                            ? 'hover:text-primary-600 cursor-pointer text-slate-900'
                                            : 'cursor-default text-slate-900'
                                    }`}
                                >
                                    {post.postReactions.length}
                                </button>
                            </button>
                            <button
                                onClick={handleCommentClick}
                                className='hover:text-primary-500 flex cursor-pointer items-center gap-1 text-slate-600 transition-colors'
                            >
                                <IconMessageCircle size={24} />
                                <span className='hover:text-primary-600 font-medium text-slate-900 transition-colors'>
                                    {post.comments.length}
                                </span>
                            </button>
                        </div>
                    </div>
                    <div
                        ref={commentsSectionRef}
                        className='flex-1 overflow-hidden'
                    >
                        <CommentsSection postId={post.id} />
                    </div>
                </div>
            </div>

            <PostLikesDialog
                isOpen={likesDialog.isOpen}
                onClose={likesDialog.closeDialog}
                post={post}
            />
        </>
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
