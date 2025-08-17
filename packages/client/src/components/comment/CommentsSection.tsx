import { useState, forwardRef } from 'react';
import { IconMessageCircle } from '@tabler/icons-react';
import type { Comment } from '../../types/comment';
import { usePostComments } from './hooks/useComments';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { cn } from '../../utils/utils';

interface CommentsSectionProps {
    postId: number;
}

const CommentsSection = forwardRef<HTMLDivElement, CommentsSectionProps>(
    ({ postId }, ref) => {
        const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
        const {
            data: comments = [],
            isLoading,
            error,
        } = usePostComments(postId);

        const handleReply = (comment: Comment) => {
            setReplyingTo(comment);
        };

        const handleCancelReply = () => {
            setReplyingTo(null);
        };

        if (error) {
            return (
                <div className='p-4 text-center text-red-500'>
                    Failed to load comments. Please try again.
                </div>
            );
        }

        return (
            <div ref={ref} className='flex h-full flex-col overflow-hidden'>
                <div
                    className={cn(
                        'flex-1 overflow-y-auto',
                        replyingTo ? 'max-h-[570px]' : 'max-h-[440px]'
                    )}
                >
                    {isLoading && (
                        <div className='flex items-center justify-center py-8'>
                            <div className='h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></div>
                        </div>
                    )}
                    {!isLoading && (
                        <>
                            {comments.length === 0 ? (
                                <div className='flex flex-col items-center justify-center py-8 text-slate-500'>
                                    <IconMessageCircle
                                        size={48}
                                        className='mb-2 opacity-50'
                                    />
                                    <p className='text-sm'>No comments yet</p>
                                    <p className='text-xs'>
                                        Be the first to comment!
                                    </p>
                                </div>
                            ) : (
                                <div className='flex flex-col'>
                                    {comments.map((comment) => (
                                        <div key={comment.id}>
                                            <CommentItem
                                                comment={comment}
                                                postId={postId}
                                                onReply={handleReply}
                                            />

                                            {replyingTo?.id === comment.id && (
                                                <CommentForm
                                                    postId={postId}
                                                    parentComment={replyingTo}
                                                    onCancel={handleCancelReply}
                                                    placeholder={`Reply to ${replyingTo.user.name}...`}
                                                    autoFocus
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {!replyingTo && (
                    <div className='border-t border-slate-200 bg-white'>
                        <CommentForm postId={postId} />
                    </div>
                )}
            </div>
        );
    }
);

CommentsSection.displayName = 'CommentsSection';

export default CommentsSection;
