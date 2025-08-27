import { useState } from 'react';
import {
    IconCamera,
    IconDotsVertical,
    IconHeart,
    IconMessageCircle,
    IconMessageReportFilled,
    IconVideo,
} from '@tabler/icons-react';
import { useAuth } from '../auth/AuthProvider';
import { useTogglePostLike } from '../comment/hooks/useComments';
import { formatTimeAgo } from '../../utils/utils';
import UserAvatar from '../ui/UserAvatar';
import PrivacyIcon from '../post/PrivacyIcon';
import DropdownMenu from '../ui/DropdownMenu';
import { useDialog } from '../ui/Dialog';
import PostLikesDialog from '../post/PostLikesDialog';
import CommentsSection from '../comment/CommentsSection';
import type { Post } from '../../types/post';
import { useNavigate } from '@tanstack/react-router';

interface HomePostCardProps {
    post: Post;
}

export default function HomePostCard({ post }: HomePostCardProps) {
    const { user } = useAuth();
    const togglePostLike = useTogglePostLike(post.userId);
    const [showComments, setShowComments] = useState(false);
    const likesDialog = useDialog(false);
    const navigate = useNavigate();

    const isLiked = post.postReactions?.some(
        (reaction) => reaction.userId === user?.id
    );

    const handleLike = () => {
        togglePostLike.mutate(post.id);
    };

    const handleLikesClick = () => {
        if (post.postReactions?.length > 0) {
            likesDialog.openDialog();
        }
    };

    const postMenuItems = [
        {
            id: 'report',
            label: 'Report',
            icon: <IconMessageReportFilled />,
            onClick: () => console.log('Report post', post.id),
            className: 'p-2',
        },
    ];

    return (
        <div className='mb-6 w-full rounded-lg border border-slate-200 bg-white shadow-sm'>
            <div className='flex items-center justify-between p-4'>
                <div className='flex items-center space-x-3'>
                    <UserAvatar user={post.user} size='md' />
                    <div>
                        <h3
                            className='cursor-pointer font-semibold text-slate-900 hover:underline'
                            onClick={() =>
                                navigate({
                                    to: '/profile/$profileId',
                                    params: {
                                        profileId: post.userId.toString(),
                                    },
                                })
                            }
                        >
                            {post.user.name} {post.user.surname}
                        </h3>
                        <div className='flex items-center space-x-2 text-sm text-slate-500'>
                            <span>{formatTimeAgo(post.createdAt)}</span>
                            <PrivacyIcon level={post.privacyLevel} />
                        </div>
                    </div>
                </div>
                <DropdownMenu
                    trigger={
                        <button className='cursor-pointer rounded-full p-1 hover:bg-slate-100'>
                            <IconDotsVertical
                                size={20}
                                className='text-slate-400'
                            />
                        </button>
                    }
                    items={postMenuItems}
                    placement='bottom-start'
                    className='border-slate-300 shadow-lg'
                />
            </div>

            {post.content && (
                <div className='px-4 pb-3'>
                    <p className='text-sm leading-relaxed text-slate-700'>
                        {post.content}
                    </p>
                </div>
            )}

            {post.contentUrl && (
                <div className='mb-3'>
                    {post.contentType === 'photo' && (
                        <img
                            src={post.contentUrl}
                            alt='Post content'
                            className='max-h-[500px] w-full object-cover'
                        />
                    )}
                    {post.contentType === 'video' && (
                        <div className='relative bg-black'>
                            <video
                                src={post.contentUrl}
                                className='max-h-[500px] w-full object-cover'
                                controls
                                preload='metadata'
                            />
                        </div>
                    )}
                </div>
            )}

            {!post.contentUrl && post.contentType === 'photo' && (
                <div className='mx-4 mb-3 flex h-64 items-center justify-center rounded-lg bg-slate-100'>
                    <div className='text-center text-slate-500'>
                        <IconCamera size={32} className='mx-auto mb-2' />
                        <span>Photo Content</span>
                    </div>
                </div>
            )}

            {!post.contentUrl && post.contentType === 'video' && (
                <div className='mx-4 mb-3 flex h-64 items-center justify-center rounded-lg bg-slate-900'>
                    <div className='text-center text-white'>
                        <IconVideo size={32} className='mx-auto mb-2' />
                        <span>Video Content</span>
                    </div>
                </div>
            )}

            {(post.postReactions?.length > 0 || post.comments?.length > 0) && (
                <div className='border-t border-slate-100 px-4 py-2'>
                    <div className='flex items-center justify-between text-sm text-slate-500'>
                        {post.postReactions?.length > 0 && (
                            <button
                                onClick={handleLikesClick}
                                className='cursor-pointer hover:underline'
                            >
                                {post.postReactions.length}{' '}
                                {post.postReactions.length === 1
                                    ? 'like'
                                    : 'likes'}
                            </button>
                        )}
                        {post.comments?.length > 0 && (
                            <button
                                onClick={() => setShowComments(!showComments)}
                                className='cursor-pointer hover:underline'
                            >
                                {post.comments.length}{' '}
                                {post.comments.length === 1
                                    ? 'comment'
                                    : 'comments'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className='border-t border-slate-100 px-4 py-2'>
                <div className='flex items-center justify-between'>
                    <button
                        onClick={handleLike}
                        disabled={togglePostLike.isPending}
                        className={`flex cursor-pointer items-center space-x-2 rounded-lg px-4 py-2 transition-colors ${
                            isLiked
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <IconHeart
                            size={20}
                            fill={isLiked ? 'currentColor' : 'none'}
                        />
                        <span className='font-medium'>Like</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className='flex cursor-pointer items-center space-x-2 rounded-lg px-4 py-2 text-slate-600 transition-colors hover:bg-slate-50'
                    >
                        <IconMessageCircle size={20} />
                        <span className='font-medium'>Comment</span>
                    </button>
                </div>
            </div>

            {showComments && (
                <div className='border-t border-slate-100'>
                    <CommentsSection postId={post.id} />
                </div>
            )}

            <PostLikesDialog
                isOpen={likesDialog.isOpen}
                onClose={likesDialog.closeDialog}
                post={post}
            />
        </div>
    );
}
