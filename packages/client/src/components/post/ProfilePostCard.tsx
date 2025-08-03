import {
    IconHeart,
    IconMessageCircle,
    IconPlayerPlayFilled,
} from '@tabler/icons-react';

import type { Post } from '../../types/post';

interface ProfilePostCardProps {
    post: Post;
    onClick: () => void;
}

export function ProfilePostCard({ post, onClick }: ProfilePostCardProps) {
    return (
        <div
            className='group relative aspect-square w-[32%] cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-opacity'
            onClick={onClick}
        >
            {post.contentUrl ? (
                <div className='h-full w-full'>
                    {post.contentType === 'photo' && (
                        <img
                            src={post.contentUrl}
                            alt='Post content'
                            className='h-full w-full object-cover'
                        />
                    )}
                    {post.contentType === 'video' && (
                        <div className='relative h-full w-full'>
                            <video
                                src={post.contentUrl}
                                className='h-full w-full object-cover'
                                muted
                                playsInline
                                preload='metadata'
                            />
                            <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                                <div className='bg-opacity-60 rounded-full bg-black p-3 shadow-lg'>
                                    <IconPlayerPlayFilled
                                        className='text-white'
                                        size={24}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4'>
                    <p className='line-clamp-4 text-center text-sm text-gray-600'>
                        {post.content}
                    </p>
                </div>
            )}

            <div className='bg-opacity-0 absolute inset-0 flex items-center justify-center bg-black opacity-0 transition-all duration-200 group-hover:opacity-50'></div>
            <div className='bg-opacity-0 absolute inset-0 flex items-center justify-center bg-transparent opacity-0 transition-all duration-200 group-hover:opacity-100'>
                <div className='flex items-center space-x-6 text-white'>
                    <div className='flex items-center space-x-2'>
                        <IconHeart size={20} fill='white' />
                        <span className='font-semibold'>
                            {post.postReactions.length}
                        </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <IconMessageCircle size={20} fill='white' />
                        <span className='font-semibold'>
                            {post.comments.length}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
