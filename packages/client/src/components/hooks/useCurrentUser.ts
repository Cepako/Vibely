import { useQuery } from '@tanstack/react-query';
import { type User } from '../../types/user';

export function useCurrentUser() {
    return useQuery<User>({
        queryKey: ['me'],
        queryFn: async () => {
            const res = await fetch('/api/user/me', {
                credentials: 'include',
            });

            if (!res.ok) return null;

            const data = res.json();
            return data;
        },
        staleTime: 60 * 60 * 2,
    });
}
