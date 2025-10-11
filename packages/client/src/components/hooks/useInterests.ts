import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';

export const useInterests = () =>
    useQuery({
        queryKey: ['interests'],
        queryFn: async () => await apiClient.get('/user/interests'),
        staleTime: 1000 * 60 * 5,
    });
