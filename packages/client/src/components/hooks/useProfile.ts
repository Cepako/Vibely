import { useQuery } from '@tanstack/react-query';
import { type FriendshipStatus, type User } from '../../types/user';

type UserProfile = User & { friendshipStatus: FriendshipStatus | null };

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
