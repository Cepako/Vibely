import { useState } from 'react';
import {
    IconDots,
    IconEdit,
    IconHeart,
    IconMessageCircle,
    IconTrash,
} from '@tabler/icons-react';
import type { Comment } from '../../types/comment';
import UserAvatar from '../ui/UserAvatar';
import { formatTimeAgo } from '../../utils/utils';
import { useAuth } from '../auth/AuthProvider';
import {
    useDeleteComment,
    useToggleCommentLike,
    useUpdateComment,
} from './hooks/useComments';
import DropdownMenu, { type DropdownMenuItem } from '../ui/DropdownMenu';
import { Dialog, useDialog } from '../ui/Dialog';
import { useNavigate } from '@tanstack/react-router';

interface CommentItemProps {
    comment: Comment;
    postId: number;
    onReply: (comment: Comment) => void;
    isReply?: boolean;
}

export default function CommentItem({
    comment,
    postId,
    onReply,
    isReply = false,
}: CommentItemProps) {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const navigate = useNavigate();

    const deleteComment = useDeleteComment(postId);
    const toggleCommentLike = useToggleCommentLike(postId);
    const updateComment = useUpdateComment(postId);
    const deleteDialog = useDialog(false);

    const isOwnComment = user?.id === comment.userId;
    const canEdit = isOwnComment;
    const canDelete = isOwnComment;

    const handleLike = () => {
        toggleCommentLike.mutate(comment.id);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        if (editContent.trim() && editContent !== comment.content) {
            updateComment.mutate(
                { commentId: comment.id, content: editContent.trim() },
                {
                    onSuccess: () => {
                        setIsEditing(false);
                    },
                }
            );
        } else {
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setEditContent(comment.content);
        setIsEditing(false);
    };

    const handleDelete = () => {
        deleteComment.mutate(comment.id, {
            onSuccess: () => {
                deleteDialog.closeDialog();
            },
        });
    };

    const handleProfileClick = () => {
        navigate({
            to: '/profile/$id',
            params: { id: comment.userId.toString() },
            reloadDocument: true,
        });
    };

    const commentMenuItems: DropdownMenuItem[] = [];

    if (canEdit) {
        commentMenuItems.push({
            id: 'edit',
            label: 'Edit',
            icon: <IconEdit size={16} />,
            onClick: handleEdit,
            className: 'p-2',
        });
    }

    if (canDelete) {
        commentMenuItems.push({
            id: 'delete',
            label: 'Delete',
            icon: <IconTrash size={16} />,
            onClick: deleteDialog.openDialog,
            className: 'p-2 text-rose-600 hover:text-rose-700',
        });
    }

    return (
        <>
            <div
                className={`${isReply ? 'ml-8' : ''} border-b border-slate-100 p-4`}
            >
                <div className='flex space-x-3'>
                    <UserAvatar
                        user={comment.user}
                        size='sm'
                        onClick={handleProfileClick}
                    />
                    <div className='flex-1'>
                        <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                                <div className='text-sm'>
                                    <span
                                        className='cursor-pointer font-semibold text-slate-900'
                                        onClick={() => handleProfileClick()}
                                    >
                                        {comment.user.name}{' '}
                                        {comment.user.surname}
                                    </span>
                                    <span className='ml-2 text-xs text-slate-500'>
                                        {comment.createdAt &&
                                            formatTimeAgo(comment.createdAt)}
                                    </span>
                                </div>

                                {isEditing ? (
                                    <div className='mt-2 space-y-2'>
                                        <textarea
                                            value={editContent}
                                            onChange={(e) =>
                                                setEditContent(e.target.value)
                                            }
                                            className='focus:border-primary-500 w-full resize-none rounded-md border border-slate-300 p-2 text-sm focus:outline-none'
                                            rows={3}
                                            autoFocus
                                        />
                                        <div className='flex space-x-2'>
                                            <button
                                                onClick={handleSaveEdit}
                                                className='bg-primary-500 hover:bg-primary-600 cursor-pointer rounded-md px-3 py-1 text-xs text-white transition-colors'
                                                disabled={
                                                    updateComment.isPending
                                                }
                                            >
                                                {updateComment.isPending
                                                    ? 'Saving...'
                                                    : 'Save'}
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className='cursor-pointer rounded-md bg-slate-200 px-3 py-1 text-xs text-slate-700 transition-colors hover:bg-slate-300'
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='mt-1 text-sm text-slate-800'>
                                        {comment.content}
                                    </div>
                                )}
                            </div>

                            {commentMenuItems.length > 0 && !isEditing && (
                                <DropdownMenu
                                    trigger={
                                        <IconDots className='h-4 w-4 cursor-pointer text-slate-400 duration-200 hover:text-slate-600' />
                                    }
                                    items={commentMenuItems}
                                    placement='bottom-end'
                                    className='border-slate-300 shadow-lg'
                                />
                            )}
                        </div>

                        {!isEditing && (
                            <div className='mt-2 flex items-center space-x-4 text-xs text-slate-500'>
                                <button
                                    onClick={handleLike}
                                    className={`flex cursor-pointer items-center space-x-1 transition-colors hover:text-rose-500 ${
                                        comment.isLiked ? 'text-rose-500' : ''
                                    }`}
                                    disabled={toggleCommentLike.isPending}
                                >
                                    <IconHeart
                                        size={14}
                                        fill={
                                            comment.isLiked
                                                ? 'currentColor'
                                                : 'none'
                                        }
                                    />
                                    <span>
                                        {comment.likeCount > 0
                                            ? comment.likeCount
                                            : 'Like'}
                                    </span>
                                </button>

                                {!isReply && (
                                    <button
                                        onClick={() => onReply(comment)}
                                        className='hover:text-primary-500 flex cursor-pointer items-center space-x-1 transition-colors'
                                    >
                                        <IconMessageCircle size={14} />
                                        <span>Reply</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {comment.replies && comment.replies.length > 0 && (
                <div className='bg-slate-50'>
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            postId={postId}
                            onReply={onReply}
                            isReply={true}
                        />
                    ))}
                </div>
            )}

            <Dialog
                isOpen={deleteDialog.isOpen}
                onClose={deleteDialog.closeDialog}
                size='sm'
            >
                <div className='flex flex-col gap-3 bg-white p-4'>
                    <div className='text-lg font-bold text-slate-700'>
                        Delete Comment
                    </div>
                    <div className='text-sm text-slate-600'>
                        Are you sure you want to delete this comment? This
                        action cannot be undone.
                    </div>
                    <div className='mt-4 flex w-full items-center justify-evenly gap-2'>
                        <button
                            className='flex-1 cursor-pointer rounded-lg bg-slate-100 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-200'
                            onClick={deleteDialog.closeDialog}
                        >
                            Cancel
                        </button>
                        <button
                            className='flex-1 cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-white transition-colors hover:bg-rose-600'
                            onClick={handleDelete}
                            disabled={deleteComment.isPending}
                        >
                            {deleteComment.isPending ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
