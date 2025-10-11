import { useQuery } from '@tanstack/react-query';
import { type User } from '../../types/user';
import { apiClient } from '../../lib/apiClient';

export function useCurrentUser() {
    return useQuery<User>({
        queryKey: ['me'],
        queryFn: async () => await apiClient.get('/user/me'),
        staleTime: 60 * 60 * 2,
    });
}
