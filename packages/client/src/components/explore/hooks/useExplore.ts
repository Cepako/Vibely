import { useQuery } from '@tanstack/react-query';

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`/api${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response
            .json()
            .catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
};

// Types based on your backend schemas
export interface PotentialFriend {
    id: number;
    name: string;
    surname: string;
    profilePictureUrl?: string | null;
    bio?: string | null;
    city?: string | null;
    region?: string | null;
    mutualFriendsCount: number;
    mutualInterestsCount: number;
    matchScore: number;
    commonInterests: Array<{
        id: number;
        name: string;
    }>;
}

export interface TrendingPost {
    id: number;
    userId: number;
    content: string;
    contentType: string;
    contentUrl: string;
    privacyLevel: string;
    createdAt: string;
    user: {
        id: number;
        name: string;
        surname: string;
        profilePictureUrl?: string | null;
    };
    likeCount: number;
    commentCount: number;
    isLiked: boolean;
}

export interface EventWithDetails {
    id: number;
    title: string;
    description: string;
    location: string;
    startTime: string;
    endTime: string;
    organizerId: number;
    categoryId: number;
    privacyLevel: string;
    user: {
        id: number;
        name: string;
        surname: string;
        profilePictureUrl?: string | null;
    };
    eventCategory: {
        id: number;
        name: string;
        description: string;
    };
    participantCount: number;
    isParticipating: boolean;
    canJoin: boolean;
}

export interface TrendingContent {
    posts: TrendingPost[];
    events: EventWithDetails[];
}

export interface ExploreFilters {
    location?: {
        city?: string;
        region?: string;
    };
    interests?: number[];
    ageRange?: {
        min?: number;
        max?: number;
    };
    gender?: 'male' | 'female';
}

export interface EventFilters {
    categoryId?: number;
    location?: string;
    dateRange?: {
        start?: string;
        end?: string;
    };
    privacyLevel?: 'public' | 'friends';
}

// Hook for getting potential friends
export const usePotentialFriends = (limit = 20, filters?: ExploreFilters) => {
    return useQuery({
        queryKey: ['explore', 'potential-friends', limit, filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('limit', limit.toString());

            if (filters?.location?.city)
                params.append('city', filters.location.city);
            if (filters?.location?.region)
                params.append('region', filters.location.region);
            if (filters?.interests?.length)
                params.append('interests', filters.interests.join(','));
            if (filters?.ageRange?.min)
                params.append('minAge', filters.ageRange.min.toString());
            if (filters?.ageRange?.max)
                params.append('maxAge', filters.ageRange.max.toString());
            if (filters?.gender) params.append('gender', filters.gender);

            const response = await apiCall(
                `/explore/friends/potential?${params}`
            );
            return response;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook for getting recommended events
export const useRecommendedEvents = (limit = 20, filters?: EventFilters) => {
    return useQuery({
        queryKey: ['explore', 'recommended-events', limit, filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('limit', limit.toString());

            if (filters?.categoryId)
                params.append('categoryId', filters.categoryId.toString());
            if (filters?.location) params.append('location', filters.location);
            if (filters?.dateRange?.start)
                params.append('startDate', filters.dateRange.start);
            if (filters?.dateRange?.end)
                params.append('endDate', filters.dateRange.end);
            if (filters?.privacyLevel)
                params.append('privacyLevel', filters.privacyLevel);

            const response = await apiCall(
                `/explore/events/recommended?${params}`
            );
            return response;
        },
        staleTime: 5 * 60 * 1000,
    });
};

// Hook for getting trending content
export const useTrendingContent = (limit = 10) => {
    return useQuery({
        queryKey: ['explore', 'trending', limit],
        queryFn: async () => {
            const response = await apiCall(`/explore/trending?limit=${limit}`);
            return response;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes for trending content
    });
};

// Hook for searching people
export const useSearchPeople = (
    query: string,
    filters?: Omit<ExploreFilters, 'interests' | 'ageRange'>
) => {
    return useQuery({
        queryKey: ['explore', 'search-people', query, filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('q', query);

            if (filters?.location?.city)
                params.append('city', filters.location.city);
            if (filters?.location?.region)
                params.append('region', filters.location.region);
            if (filters?.gender) params.append('gender', filters.gender);

            const response = await apiCall(`/explore/people/search?${params}`);
            return response;
        },
        enabled: query.length >= 2, // Only search if query is at least 2 characters
        staleTime: 30 * 1000, // 30 seconds
    });
};

// Hook for interest-based recommendations
export const useInterestBasedRecommendations = (limit = 10) => {
    return useQuery({
        queryKey: ['explore', 'interest-based', limit],
        queryFn: async () => {
            const response = await apiCall(
                `/explore/recommendations/interests?limit=${limit}`
            );
            return response;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook for explore stats
export const useExploreStats = () => {
    return useQuery({
        queryKey: ['explore', 'stats'],
        queryFn: async () => {
            const response = await apiCall('/explore/stats');
            return response;
        },
        staleTime: 15 * 60 * 1000, // 15 minutes
    });
};
