import { useState, useEffect, useRef } from 'react';
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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            const maxHeight = 60;
            textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
        }
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [content]);

    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [autoFocus]);

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

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    if (!currentUser.data) return null;

    return (
        <div
            className={`${parentComment ? 'ml-8 rounded-lg bg-slate-50 p-4' : 'border-t border-slate-100 p-4'}`}
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
                        ref={textareaRef}
                        value={content}
                        onChange={handleContentChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className='w-full resize-none overflow-y-auto border-none bg-transparent text-sm placeholder-slate-500 outline-none'
                        style={{
                            minHeight: '24px', // 1 row height
                            maxHeight: '60px',
                        }}
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
                                        className='flex cursor-pointer items-center space-x-1 rounded-md px-3 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800'
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
                                    className='bg-primary-500 hover:bg-primary-600 flex cursor-pointer items-center space-x-1 rounded-md px-3 py-1 text-xs text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
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
