import { useEffect, useRef } from 'react';
import { IconCamera } from '@tabler/icons-react';
import { useHomeFeed } from './hooks/useHomeFeed';
import HomePostCard from './HomePostCard';
import type { Post } from '../../types/post';

export default function PostsFeed() {
    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useHomeFeed(10);

    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const allPosts: Array<Post> = data?.pages.flat() || [];

    if (isLoading) {
        return (
            <div className='space-y-6'>
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className='rounded-lg border border-slate-200 bg-white p-4 shadow-sm'
                    >
                        <div className='animate-pulse'>
                            <div className='mb-4 flex items-center space-x-3'>
                                <div className='h-10 w-10 rounded-full bg-slate-300'></div>
                                <div className='flex-1'>
                                    <div className='mb-2 h-4 rounded bg-slate-300'></div>
                                    <div className='h-3 w-1/2 rounded bg-slate-300'></div>
                                </div>
                            </div>
                            <div className='mb-2 h-4 rounded bg-slate-300'></div>
                            <div className='mb-4 h-4 w-3/4 rounded bg-slate-300'></div>
                            <div className='h-48 rounded bg-slate-300'></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className='rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm'>
                <p className='text-slate-500'>
                    Unable to load posts. Please try again later.
                </p>
            </div>
        );
    }

    if (allPosts.length === 0) {
        return (
            <div className='rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm'>
                <IconCamera size={48} className='mx-auto mb-4 text-slate-400' />
                <h3 className='mb-2 text-lg font-semibold text-slate-900'>
                    No posts yet
                </h3>
                <p className='mb-4 text-slate-500'>
                    Start sharing your thoughts, photos, and videos with your
                    friends!
                </p>
                <p className='text-sm text-slate-400'>
                    Add some friends to see their posts in your feed.
                </p>
            </div>
        );
    }

    return (
        <div className='w-full space-y-6'>
            {allPosts.map((post) => (
                <HomePostCard key={post.id} post={post} />
            ))}

            <div ref={loadMoreRef} className='h-4'>
                {isFetchingNextPage && (
                    <div className='flex justify-center py-4'>
                        <div className='border-primary-600 h-8 w-8 animate-spin rounded-full border-b-2'></div>
                    </div>
                )}
            </div>

            {!hasNextPage && allPosts.length > 0 && (
                <div className='py-4 text-center text-sm text-slate-500'>
                    You've reached the end of your feed
                </div>
            )}
        </div>
    );
}
