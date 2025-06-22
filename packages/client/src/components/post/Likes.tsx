import { IconHeart, IconHeartFilled, IconX } from '@tabler/icons-react';
import { formatTimeAgo } from '../../utils/utils';

export interface User {
    id: number;
    username: string;
    avatar: string;
}

interface Like {
    id: number;
    user: User;
    created_at: string;
}

interface LikesProps {
    postId: number;
    onClose?: () => void;
}

export const dummyUsers: User[] = [
    {
        id: 1,
        username: 'alex_hiker',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    },
    {
        id: 2,
        username: 'sarah_graduate',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face',
    },
    {
        id: 3,
        username: 'fitness_mike',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    },
    {
        id: 4,
        username: 'emma_thoughts',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    },
    {
        id: 5,
        username: 'chef_maria',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
    },
    {
        id: 6,
        username: 'beach_squad',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
    },
    {
        id: 7,
        username: 'dev_john',
        avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=40&h=40&fit=crop&crop=face',
    },
    {
        id: 8,
        username: 'music_lisa',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
    },
];

const dummyLikes: Record<number, Like[]> = {
    1: [
        { id: 1, user: dummyUsers[1], created_at: '2025-06-22T11:00:00Z' },
        { id: 2, user: dummyUsers[2], created_at: '2025-06-22T11:30:00Z' },
        { id: 3, user: dummyUsers[4], created_at: '2025-06-22T12:00:00Z' },
        { id: 4, user: dummyUsers[6], created_at: '2025-06-22T12:30:00Z' },
        { id: 5, user: dummyUsers[7], created_at: '2025-06-22T13:00:00Z' },
    ],
    2: [
        { id: 6, user: dummyUsers[0], created_at: '2025-06-21T19:00:00Z' },
        { id: 7, user: dummyUsers[3], created_at: '2025-06-21T19:30:00Z' },
        { id: 8, user: dummyUsers[5], created_at: '2025-06-21T20:00:00Z' },
        { id: 9, user: dummyUsers[6], created_at: '2025-06-21T20:30:00Z' },
    ],
    3: [
        { id: 10, user: dummyUsers[1], created_at: '2025-06-21T08:30:00Z' },
        { id: 11, user: dummyUsers[4], created_at: '2025-06-21T09:00:00Z' },
    ],
};

const Likes: React.FC<LikesProps> = ({ postId, onClose }) => {
    const likes = dummyLikes[postId] || [];

    return (
        <div className='flex h-full max-h-[500px] flex-col rounded-xl bg-white'>
            {/* Header */}
            <div className='relative rounded-t-xl p-3 text-center'>
                <h3 className='text-lg font-semibold text-slate-700'>Likes</h3>
                <IconX
                    className='hover:text-primary-500 absolute top-[50%] right-3 translate-y-[-50%] cursor-pointer duration-200'
                    onClick={onClose}
                />
            </div>

            {/* Likes List */}
            <div className='flex-1 overflow-y-auto'>
                {likes.length > 0 ? (
                    <div className='space-y-3 p-4'>
                        {likes.map((like: any) => (
                            <div
                                key={like.id}
                                className='flex items-center justify-between'
                            >
                                <div className='flex cursor-pointer items-center space-x-3'>
                                    <img
                                        src={like.user.avatar}
                                        alt={like.user.username}
                                        className='h-10 w-10 rounded-full object-cover'
                                    />
                                    <div>
                                        <div className='flex items-center space-x-2'>
                                            <span className='font-semibold text-gray-900'>
                                                {like.user.username}
                                            </span>
                                        </div>
                                        <p className='text-xs text-gray-500'>
                                            {formatTimeAgo(like.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <IconHeartFilled className='h-5 w-5 text-red-500' />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
                        <IconHeart className='mb-2 h-12 w-12 text-gray-300' />
                        <p className='text-sm'>No likes yet</p>
                        <p className='text-xs'>
                            Be the first to like this post!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Likes;
