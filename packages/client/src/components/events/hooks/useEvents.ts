import { useQuery } from '@tanstack/react-query';
import type { Event, EventTab } from '../../../types/events';

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

const getEndpointByTab = (tab: EventTab): string => {
    switch (tab) {
        case 'discover':
            return '/events';
        case 'upcoming':
            return '/events/upcoming';
        case 'my-events':
            return '/events/my';
        default:
            return '/events';
    }
};

export function useEvents(tab: EventTab) {
    const query = useQuery({
        queryKey: ['events', tab],
        queryFn: async (): Promise<Event[]> => {
            const endpoint = getEndpointByTab(tab);
            const response = await apiCall(endpoint);
            return response.data || [];
        },
        staleTime: 1000 * 5,
        refetchInterval: 1000 * 5,
        refetchOnMount: 'always',
        refetchIntervalInBackground: true,
        gcTime: 1000 * 60 * 30,
    });

    return {
        events: query.data || [],
        isLoading: query.isLoading,
        error: query.error?.message || null,
        refetch: query.refetch,
        isRefetching: query.isRefetching,
        isError: query.isError,
    };
}
