import {
    IconChevronLeft,
    IconChevronRight,
    IconDots,
    IconHeart,
    IconMessageCircle,
    IconMessageReport,
    IconArrowLeft,
    IconHeartFilled,
} from '@tabler/icons-react';
import type { Post } from '../../types/post';
import UserAvatar from '../ui/UserAvatar';
import { cn, formatTimeAgo } from '../../utils/utils';
import { type ReactNode, useRef, useState, useEffect } from 'react';
import PrivacyIcon from './PrivacyIcon';
import DropdownMenu, { type DropdownMenuItem } from '../ui/DropdownMenu';
import CommentsSection from '../comment/CommentsSection';
import { useTogglePostLike } from '../comment/hooks/useComments';
import { useAuth } from '../auth/AuthProvider';
import { usePosts } from './hooks/usePosts';
import { useDialog } from '../ui/Dialog';
import PostLikesDialog from './PostLikesDialog';
import { useNavigate } from '@tanstack/react-router';

interface PostDetailsProps {
    post: Post;
}

export default function PostDetails({ post: initialPost }: PostDetailsProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: posts } = usePosts(initialPost.userId);
    const post = posts?.find((p) => p.id === initialPost.id) || initialPost;

    const togglePostLike = useTogglePostLike(post.userId);
    const likesDialog = useDialog(false);

    const commentsSectionRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleGoToProfile = () => {
        navigate({ to: `/profile/${post.userId}` });
    };

    const isLiked = post.postReactions.some(
        (reaction) => reaction.userId === user?.id
    );

    const handleNext = () => {
        if (posts) {
            const currentIndex = posts.findIndex((p) => p.id === post.id);
            if (currentIndex < posts.length - 1) {
                const nextPost = posts[currentIndex + 1];
                navigate({
                    to: '/post/$postId',
                    params: { postId: String(nextPost.id) },
                });
            }
        }
    };

    const handlePrevious = () => {
        if (posts) {
            const currentIndex = posts.findIndex((p) => p.id === post.id);
            if (currentIndex > 0) {
                const previousPost = posts[currentIndex - 1];
                navigate({
                    to: '/post/$postId',
                    params: { postId: String(previousPost.id) },
                });
            }
        }
    };

    const canNavigateNext =
        posts && posts.findIndex((p) => p.id === post.id) < posts.length - 1;
    const canNavigatePrevious =
        posts && posts.findIndex((p) => p.id === post.id) > 0;

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
            }, 100);
        }
    };

    const postMenuItems: DropdownMenuItem[] = [
        {
            id: 'report',
            label: 'Report post',
            icon: <IconMessageReport size={16} />,
            onClick: () => console.log('Report post', post.id),
            className:
                'p-3 transition-colors hover:bg-rose-50 text-rose-600 hover:text-rose-700',
        },
    ];

    const hasMedia = post.contentUrl;
    const likesCount = post.postReactions.length;
    const commentsCount = post.comments.length;

    return (
        <>
            <div className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm' />

            <button
                onClick={handleGoToProfile}
                className='group fixed top-5 left-16 z-50 flex cursor-pointer items-center space-x-2 rounded-full bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-xl'
                aria-label='Go to profile'
            >
                <IconArrowLeft
                    size={18}
                    className='transition-transform group-hover:-translate-x-0.5'
                />
                <span className='text-lg font-medium text-slate-900'>
                    Back to profile
                </span>
            </button>

            <div className='fixed inset-0 z-40 flex items-center justify-center p-2 md:p-4'>
                <div
                    className={cn(
                        'flex h-full w-full max-w-7xl overflow-hidden rounded-xl bg-white shadow-2xl',
                        'transition-all duration-300 ease-out',
                        isMobile ? 'flex-col' : 'flex-row'
                    )}
                    role='dialog'
                    aria-modal='true'
                    aria-labelledby='post-author'
                >
                    <div
                        className={cn(
                            'relative flex items-center justify-center bg-gradient-to-br from-slate-900 to-black',
                            isMobile ? 'h-1/2' : 'flex-1'
                        )}
                    >
                        {canNavigatePrevious && !isMobile && (
                            <PostNavigationButton
                                onClick={handlePrevious}
                                icon={<IconChevronLeft size={24} />}
                                className='left-3'
                                aria-label='Previous post'
                            />
                        )}

                        {hasMedia ? (
                            <div className='flex h-full w-full items-center justify-center p-2 md:p-6'>
                                {post.contentType === 'photo' && (
                                    <img
                                        src={post.contentUrl}
                                        alt='Post content'
                                        className='h-auto max-h-full w-auto max-w-full rounded-lg object-contain shadow-lg'
                                        loading='lazy'
                                    />
                                )}
                                {post.contentType === 'video' && (
                                    <video
                                        src={post.contentUrl}
                                        controls
                                        className='h-auto max-h-full w-auto max-w-full rounded-lg object-contain shadow-lg'
                                        preload='metadata'
                                    />
                                )}
                            </div>
                        ) : (
                            <div className='flex h-full w-full items-center justify-center p-6 md:p-12'>
                                <div className='max-w-2xl text-center'>
                                    <p className='text-lg leading-relaxed font-medium text-white md:text-2xl'>
                                        {post.content}
                                    </p>
                                </div>
                            </div>
                        )}

                        {canNavigateNext && !isMobile && (
                            <PostNavigationButton
                                onClick={handleNext}
                                icon={<IconChevronRight size={24} />}
                                className='right-3'
                                aria-label='Next post'
                            />
                        )}
                    </div>

                    <div
                        className={cn(
                            'flex flex-col border-l border-slate-100 bg-white',
                            isMobile ? 'h-1/2' : 'w-96'
                        )}
                    >
                        <div className='sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white p-4'>
                            <div className='flex min-w-0 flex-1 items-center space-x-3'>
                                <UserAvatar user={post.user} size='md' />
                                <div className='min-w-0 flex-1'>
                                    <h2
                                        id='post-author'
                                        className='truncate font-semibold text-slate-900'
                                    >
                                        {post.user.name} {post.user.surname}
                                    </h2>
                                    <div className='flex items-center space-x-2 text-sm text-slate-500'>
                                        <span>
                                            {formatTimeAgo(post.createdAt)}
                                        </span>
                                        <PrivacyIcon
                                            level={post.privacyLevel}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='flex flex-shrink-0 items-center space-x-1'>
                                <DropdownMenu
                                    trigger={
                                        <button
                                            className='rounded-full p-2 transition-colors hover:bg-slate-100'
                                            aria-label='Post options'
                                        >
                                            <IconDots size={20} />
                                        </button>
                                    }
                                    items={postMenuItems}
                                    placement='bottom-end'
                                />
                            </div>
                        </div>

                        {post.content && hasMedia && (
                            <div className='overflow-x-auto border-b border-slate-50 px-4 py-3 leading-relaxed break-words text-ellipsis text-slate-900'>
                                {post.content}
                            </div>
                        )}

                        <div className='border-b border-slate-50 bg-slate-50/50 px-4 py-3'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center space-x-6'>
                                    <button
                                        className={cn(
                                            'group flex cursor-pointer items-center space-x-1 transition-all duration-200',
                                            isLiked
                                                ? 'text-rose-500'
                                                : 'text-slate-600 hover:text-rose-500'
                                        )}
                                        onClick={handleLike}
                                        disabled={togglePostLike.isPending}
                                        aria-label={
                                            isLiked
                                                ? 'Unlike post'
                                                : 'Like post'
                                        }
                                    >
                                        {isLiked ? (
                                            <IconHeartFilled
                                                size={24}
                                                className=''
                                            />
                                        ) : (
                                            <IconHeart
                                                size={24}
                                                className='transition-transform group-hover:scale-110'
                                            />
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCommentClick}
                                        className='group hover:text-primary-500 cursor-pointer text-slate-600 transition-colors'
                                        aria-label='Comment on post'
                                    >
                                        <IconMessageCircle
                                            size={24}
                                            className='transition-transform group-hover:scale-110'
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className='mt-3 flex items-center space-x-4 text-sm'>
                                {likesCount > 0 && (
                                    <button
                                        onClick={handleLikesClick}
                                        className='cursor-pointer font-medium text-slate-900 transition-colors hover:text-slate-600'
                                    >
                                        {likesCount}{' '}
                                        {likesCount === 1 ? 'like' : 'likes'}
                                    </button>
                                )}
                                {commentsCount > 0 && (
                                    <span className='text-slate-500'>
                                        {commentsCount}{' '}
                                        {commentsCount === 1
                                            ? 'comment'
                                            : 'comments'}
                                    </span>
                                )}
                            </div>

                            {isMobile &&
                                (canNavigatePrevious || canNavigateNext) && (
                                    <div className='mt-3 flex justify-between border-t border-slate-200 pt-3'>
                                        <button
                                            onClick={handlePrevious}
                                            disabled={!canNavigatePrevious}
                                            className={cn(
                                                'flex items-center space-x-2 rounded-lg px-3 py-2 transition-colors',
                                                canNavigatePrevious
                                                    ? 'text-primary-600 hover:bg-primary-50'
                                                    : 'cursor-not-allowed text-slate-400'
                                            )}
                                        >
                                            <IconChevronLeft size={20} />
                                            <span>Previous</span>
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            disabled={!canNavigateNext}
                                            className={cn(
                                                'flex items-center space-x-2 rounded-lg px-3 py-2 transition-colors',
                                                canNavigateNext
                                                    ? 'text-primary-600 hover:bg-primary-50'
                                                    : 'cursor-not-allowed text-slate-400'
                                            )}
                                        >
                                            <span>Next</span>
                                            <IconChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                        </div>

                        <div
                            ref={commentsSectionRef}
                            className='flex-1 overflow-hidden'
                        >
                            <CommentsSection postId={post.id} />
                        </div>
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
    'aria-label'?: string;
}

function PostNavigationButton({
    onClick,
    icon,
    className,
    'aria-label': ariaLabel,
}: PostNavigationButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center opacity-40 hover:opacity-100',
                'rounded-full bg-white/90 text-slate-900 shadow-lg backdrop-blur-sm',
                'border shadow-xl transition-all duration-200 hover:scale-110 hover:bg-white',

                className
            )}
            aria-label={ariaLabel}
        >
            {icon}
        </button>
    );
}
