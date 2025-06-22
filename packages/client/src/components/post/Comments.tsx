import {
    IconDotsVertical,
    IconHeart,
    IconHeartFilled,
    IconMessageCircle,
    IconMessageReport,
    IconSend,
    IconX,
} from '@tabler/icons-react';
import DropdownMenu, { type DropdownMenuItem } from '../ui/DropdownMenu';
import { dummyUsers, type User } from './Likes';
import { defaultDateFormat, formatTimeAgo } from '../../utils/utils';
import { useState } from 'react';
import Tooltip from '../ui/Tooltip';
import { format } from 'date-fns';

interface Comment {
    id: number;
    user: User;
    content: string;
    created_at: string;
    likes: number;
    isLiked: boolean;
    replies?: Comment[];
    isReply?: boolean;
}

interface CommentsProps {
    postId: number;
    onClose?: () => void;
}

const dummyComments: Record<number, Comment[]> = {
    1: [
        {
            id: 1,
            user: dummyUsers[1],
            content:
                'Absolutely stunning view! 😍 Which trail did you take to get there?',
            created_at: '2025-06-22T11:15:00Z',
            likes: 3,
            isLiked: false,
            replies: [
                {
                    id: 11,
                    user: dummyUsers[0],
                    content:
                        "Thanks! I took the Blue Ridge Trail. It's about 3 hours hike but totally worth it!",
                    created_at: '2025-06-22T11:45:00Z',
                    likes: 1,
                    isLiked: true,
                    isReply: true,
                },
            ],
        },
        {
            id: 2,
            user: dummyUsers[2],
            content:
                'Great workout and amazing scenery! Perfect combination 💪',
            created_at: '2025-06-22T12:30:00Z',
            likes: 5,
            isLiked: true,
        },
        {
            id: 3,
            user: dummyUsers[4],
            content:
                'I need to visit this place! Adding it to my bucket list ✨',
            created_at: '2025-06-22T13:20:00Z',
            likes: 2,
            isLiked: false,
        },
    ],
    2: [
        {
            id: 4,
            user: dummyUsers[3],
            content:
                "Congratulations! 🎉 You've worked so hard for this moment!",
            created_at: '2025-06-21T19:15:00Z',
            likes: 8,
            isLiked: true,
        },
        {
            id: 5,
            user: dummyUsers[5],
            content: "So proud of you! What's next on your journey?",
            created_at: '2025-06-21T20:00:00Z',
            likes: 4,
            isLiked: false,
            replies: [
                {
                    id: 12,
                    user: dummyUsers[1],
                    content:
                        "Thank you! Starting my master's degree in the fall 📚",
                    created_at: '2025-06-21T20:30:00Z',
                    likes: 2,
                    isLiked: false,
                    isReply: true,
                },
            ],
        },
    ],
    3: [
        {
            id: 6,
            user: dummyUsers[6],
            content: "Love the morning energy! What's your favorite exercise?",
            created_at: '2025-06-21T08:00:00Z',
            likes: 2,
            isLiked: false,
        },
    ],
};

const Comments: React.FC<CommentsProps> = ({ postId, onClose }) => {
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState(dummyComments[postId] || []);

    const handleSubmitComment = () => {
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: Date.now(),
            user: dummyUsers[0], // Current user
            content: newComment,
            created_at: new Date().toISOString(),
            likes: 0,
            isLiked: false,
        };

        setComments([comment, ...comments]);
        setNewComment('');
    };

    const handleReply = (commentId: number) => {
        console.log('Reply to comment:', commentId);
        // Implement reply logic
    };

    return (
        <div className='flex h-full max-h-[600px] flex-col rounded-xl border border-slate-300 bg-white'>
            {/* Header */}
            <div className='relative p-3 text-center'>
                <h3 className='text-lg font-semibold text-gray-900'>
                    Comments
                </h3>
                <IconX
                    className='hover:text-primary-500 absolute top-[50%] right-3 translate-y-[-50%] cursor-pointer duration-200'
                    onClick={onClose}
                />
            </div>

            {/* Comments List */}
            <div className='flex-1 overflow-y-auto px-4'>
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onReply={handleReply}
                        />
                    ))
                ) : (
                    <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
                        <IconMessageCircle className='mb-2 h-12 w-12 text-gray-300' />
                        <p className='text-sm'>No comments yet</p>
                        <p className='text-xs'>Be the first to comment!</p>
                    </div>
                )}
            </div>

            {/* Comment Input */}
            <div className='border-t border-gray-200 p-4'>
                <div className='flex items-center space-x-3'>
                    <img
                        src={dummyUsers[0].avatar}
                        alt='Your avatar'
                        className='h-8 w-8 rounded-full object-cover'
                    />
                    <div className='flex-1'>
                        <div className='flex items-end space-x-2'>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder='Write a comment...'
                                className='focus:border-primary-500 flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none'
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmitComment();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim()}
                        className='bg-primary-500 hover:bg-primary-600 cursor-pointer rounded-lg p-2 text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300'
                    >
                        <IconSend className='h-4 w-4' />
                    </button>
                </div>
            </div>
        </div>
    );
};

const CommentItem: React.FC<{
    comment: Comment;
    onReply?: (commentId: number) => void;
}> = ({ comment, onReply }) => {
    const [isLiked, setIsLiked] = useState(comment.isLiked);
    const [likesCount, setLikesCount] = useState(comment.likes);
    const [showReplies, setShowReplies] = useState(false);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    };

    const commentMenuItems: DropdownMenuItem[] = [
        {
            id: 'report',
            label: 'Report',
            icon: <IconMessageReport />,
            onClick: () => console.log('Report comment', comment.id),
            className: 'p-2',
        },
    ];

    return (
        <div
            className={`${comment.isReply ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}
        >
            <div className='flex space-x-3 py-3'>
                <img
                    src={comment.user.avatar}
                    alt={comment.user.username}
                    className='h-8 w-8 rounded-full object-cover'
                />
                <div className='flex-1'>
                    <div className='rounded-lg bg-gray-50 px-3 py-2'>
                        <div className='mb-1 flex items-center space-x-2'>
                            <span className='text-sm font-semibold text-gray-900'>
                                {comment.user.username}
                            </span>
                        </div>
                        <p className='text-sm text-gray-800'>
                            {comment.content}
                        </p>
                    </div>

                    <div className='mt-2 flex items-center space-x-4 text-xs text-gray-500'>
                        <Tooltip
                            content={
                                <div>
                                    {format(
                                        comment.created_at,
                                        defaultDateFormat
                                    )}
                                </div>
                            }
                            className='opacity-100'
                        >
                            <span>{formatTimeAgo(comment.created_at)}</span>
                        </Tooltip>
                        <button
                            onClick={handleLike}
                            className={`flex cursor-pointer items-center space-x-1 transition-colors hover:text-red-500 ${
                                isLiked ? 'text-red-500' : ''
                            }`}
                        >
                            {isLiked ? (
                                <IconHeartFilled className='h-3 w-3' />
                            ) : (
                                <IconHeart className='h-3 w-3' />
                            )}
                            <span>{likesCount}</span>
                        </button>
                        {!comment.isReply && (
                            <button
                                onClick={() => onReply?.(comment.id)}
                                className='hover:text-primary-500 cursor-pointer transition-colors'
                            >
                                Reply
                            </button>
                        )}
                        <DropdownMenu
                            trigger={
                                <IconDotsVertical className='hover:text-primary-500 h-3 w-3 cursor-pointer duration-200' />
                            }
                            items={commentMenuItems}
                            placement='bottom-start'
                            className='border-slate-300 shadow-lg'
                        />
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className='mt-2'>
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className='text-primary-500 hover:text-primary-600 text-xs font-medium'
                            >
                                {showReplies ? 'Hide' : 'Show'}{' '}
                                {comment.replies.length}{' '}
                                {comment.replies.length === 1
                                    ? 'reply'
                                    : 'replies'}
                            </button>
                            {showReplies && (
                                <div className='mt-2'>
                                    {comment.replies.map((reply) => (
                                        <CommentItem
                                            key={reply.id}
                                            comment={reply}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Comments;
