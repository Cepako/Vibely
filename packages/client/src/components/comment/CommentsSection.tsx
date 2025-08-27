import { useState, forwardRef } from 'react';
import { IconMessageCircle, IconMessage } from '@tabler/icons-react';
import type { Comment } from '../../types/comment';
import { usePostComments } from './hooks/useComments';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

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
                <div className='flex flex-col items-center justify-center px-4 py-8'>
                    <IconMessage size={32} className='mb-3 text-slate-300' />
                    <p className='text-center text-sm text-slate-500'>
                        Unable to load comments
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className='text-primary-600 hover:text-primary-700 mt-2 text-xs transition-colors'
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return (
            <div ref={ref} className='flex h-full flex-col'>
                <div className='flex-1 overflow-y-auto'>
                    {isLoading ? (
                        <div className='flex items-center justify-center py-12'>
                            <div className='flex items-center space-x-3'>
                                <div className='border-primary-500 h-5 w-5 animate-spin rounded-full border-2 border-t-transparent'></div>
                                <span className='text-sm text-slate-500'>
                                    Loading comments...
                                </span>
                            </div>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className='flex flex-col items-center justify-center px-6 py-16'>
                            <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100'>
                                <IconMessageCircle
                                    size={28}
                                    className='text-slate-400'
                                />
                            </div>
                            <h4 className='mb-1 font-medium text-slate-900'>
                                No comments yet
                            </h4>
                            <p className='text-center text-sm text-slate-500'>
                                Be the first to share your thoughts!
                            </p>
                        </div>
                    ) : (
                        <div className='divide-y divide-slate-50'>
                            {comments.map((comment) => (
                                <div key={comment.id}>
                                    <CommentItem
                                        comment={comment}
                                        postId={postId}
                                        onReply={handleReply}
                                    />

                                    {replyingTo?.id === comment.id && (
                                        <div className='border-t border-slate-100 bg-slate-50/80'>
                                            <CommentForm
                                                postId={postId}
                                                parentComment={replyingTo}
                                                onCancel={handleCancelReply}
                                                placeholder={`Reply to ${replyingTo.user.name}...`}
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {!replyingTo && (
                    <div className='sticky bottom-0 border-t border-slate-100 bg-white shadow-sm'>
                        <CommentForm postId={postId} />
                    </div>
                )}
            </div>
        );
    }
);

CommentsSection.displayName = 'CommentsSection';

export default CommentsSection;
