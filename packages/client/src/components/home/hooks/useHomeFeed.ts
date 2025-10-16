import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthProvider';
import type { Post } from '../../../types/post';
import { apiClient } from '../../../lib/apiClient';

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
    return await apiClient.get<HomeFeedResponse>(
        `/post/home-feed?limit=${limit}&offset=${offset}`
    );
};

export const useHomeFeed = (limit: number = 20) => {
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
