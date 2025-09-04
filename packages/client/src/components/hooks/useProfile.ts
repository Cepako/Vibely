import { useQuery } from '@tanstack/react-query';
import { type User } from '../../types/user';
import type { FriendshipStatus } from '../profile/hooks/useFriendship';

export type Interest = { id: number; name?: string; description?: string };

export type UserProfile = User & {
    friendshipStatus: FriendshipStatus;
    interests?: Interest[];
};

export function useProfile(profileId: number) {
    return useQuery<UserProfile | null>({
        queryKey: ['profile', profileId],
        queryFn: async () => {
            const res = await fetch(`/api/user/profile/${profileId}`, {
                credentials: 'include',
            });

            if (!res.ok) return null;

            const data = await res.json();
            return data as UserProfile;
        },
        staleTime: 3000,
        refetchInterval: 3000,
    });
}
