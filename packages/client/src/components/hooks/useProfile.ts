import { useQuery } from '@tanstack/react-query';
import { type User } from '../../types/user';
import type { FriendshipStatus } from '../profile/hooks/useFriendship';

export type UserProfile = User & { friendshipStatus: FriendshipStatus };

export function useProfile(profileId: number) {
    return useQuery<UserProfile>({
        queryKey: ['profile', profileId],
        queryFn: async () => {
            const res = await fetch(`/api/user/profile/${profileId}`, {
                credentials: 'include',
            });

            if (!res.ok) return null;

            const data = await res.json();
            return data;
        },
        staleTime: 3000,
        refetchInterval: 3000,
    });
}
