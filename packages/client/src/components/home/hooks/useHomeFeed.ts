import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthProvider';
import type { Post } from '../../../types/post';

interface HomeFeedResponse {
    posts: Post[];
    pagination: {
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

const fetchHomeFeed = async (
    limit: number = 20,
    offset: number = 0
): Promise<HomeFeedResponse> => {
    const response = await fetch(
        `/api/post/home-feed?limit=${limit}&offset=${offset}`,
        {
            method: 'GET',
            credentials: 'include',
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch home feed');
    }

    return response.json();
};

export const useHomeFeed = (limit: number = 20) => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['homeFeed', limit],
        queryFn: () => fetchHomeFeed(limit, 0),
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true,
        select: (data) => data.posts,
    });
};

export const useInfiniteHomeFeed = (limit: number = 20) => {
    const { user } = useAuth();

    return useInfiniteQuery({
        queryKey: ['homeFeed', 'infinite', limit],
        queryFn: ({ pageParam = 0 }) => fetchHomeFeed(limit, pageParam),
        initialPageParam: 0,
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: true,
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage.pagination.hasMore) return undefined;
            return allPages.length * limit;
        },
        select: (data) => ({
            pages: data.pages.map((page) => page.posts),
            pageParams: data.pageParams,
        }),
    });
};

export const useHomeFeedPosts = (limit: number = 20) => {
    const { data, isLoading, error, refetch } = useHomeFeed(limit);

    return {
        posts: data || [],
        isLoading,
        error,
        refetch,
    };
};
