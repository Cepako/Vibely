import { useQuery } from '@tanstack/react-query';
import type { EventCategory } from '../../../types/events';
import { apiClient } from '../../../lib/apiClient';

export function useEventCategories(options?: { enabled?: boolean }) {
    const query = useQuery({
        queryKey: ['event-categories'],
        queryFn: async (): Promise<EventCategory[]> => {
            const response = await apiClient.get('/events/categories');
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
