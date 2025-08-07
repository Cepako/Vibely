import { useState } from 'react';
import { IconSend, IconX } from '@tabler/icons-react';
import type { Comment } from '../../types/comment';
import UserAvatar from '../ui/UserAvatar';
import { useCreateComment } from './hooks/useComments';
import { useCurrentUser } from '../hooks/useCurrentUser';

interface CommentFormProps {
    postId: number;
    parentComment?: Comment;
    onCancel?: () => void;
    placeholder?: string;
    autoFocus?: boolean;
}

export default function CommentForm({
    postId,
    parentComment,
    onCancel,
    placeholder = 'Add a comment...',
    autoFocus = false,
}: CommentFormProps) {
    const [content, setContent] = useState('');
    const createComment = useCreateComment(postId);
    const currentUser = useCurrentUser();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) return;

        const commentData = {
            content: content.trim(),
            ...(parentComment && { parentId: parentComment.id }),
        };

        createComment.mutate(commentData, {
            onSuccess: () => {
                setContent('');
                if (onCancel) onCancel();
            },
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
        if (e.key === 'Escape' && onCancel) {
            onCancel();
        }
    };

    if (!currentUser.data) return null;

    return (
        <div
            className={`${parentComment ? 'ml-8 bg-slate-50 p-4' : 'border-t border-slate-100 p-4'}`}
        >
            {parentComment && (
                <div className='mb-3 text-xs text-slate-600'>
                    Replying to{' '}
                    <span className='font-medium'>
                        {parentComment.user.name} {parentComment.user.surname}
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit} className='flex space-x-3'>
                <UserAvatar user={currentUser.data} size='sm' />
                <div className='flex-1'>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className='w-full resize-none border-none bg-transparent text-sm placeholder-slate-500 outline-none'
                        rows={parentComment ? 2 : 1}
                        autoFocus={autoFocus}
                        disabled={createComment.isPending}
                    />

                    {(content.trim() || parentComment) && (
                        <div className='mt-2 flex items-center justify-between'>
                            <div className='text-xs text-slate-400'>
                                {parentComment
                                    ? 'Press Enter to reply, Esc to cancel'
                                    : 'Press Enter to post, Shift+Enter for new line'}
                            </div>
                            <div className='flex items-center space-x-2'>
                                {onCancel && (
                                    <button
                                        type='button'
                                        onClick={onCancel}
                                        className='flex items-center space-x-1 px-3 py-1 text-xs text-slate-600 transition-colors hover:text-slate-800'
                                    >
                                        <IconX size={14} />
                                        <span>Cancel</span>
                                    </button>
                                )}
                                <button
                                    type='submit'
                                    disabled={
                                        !content.trim() ||
                                        createComment.isPending
                                    }
                                    className='flex items-center space-x-1 rounded-md bg-blue-500 px-3 py-1 text-xs text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50'
                                >
                                    <IconSend size={14} />
                                    <span>
                                        {createComment.isPending
                                            ? 'Posting...'
                                            : parentComment
                                              ? 'Reply'
                                              : 'Post'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
