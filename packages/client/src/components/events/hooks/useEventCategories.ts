import { useQuery } from '@tanstack/react-query';
import type { EventCategory } from '../../../types/events';

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

export function useEventCategories(options?: { enabled?: boolean }) {
    const query = useQuery({
        queryKey: ['event-categories'],
        queryFn: async (): Promise<EventCategory[]> => {
            const response = await apiCall('/events/categories');
            return response.data || [];
        },
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 60,
        enabled: options?.enabled ?? true,
    });

    return {
        categories: query.data || [],
        isLoading: query.isLoading,
        error: query.error?.message || null,
        refetch: query.refetch,
        isRefetching: query.isRefetching,
        isError: query.isError,
    };
}
