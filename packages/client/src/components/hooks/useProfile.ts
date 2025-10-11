import { useQuery } from '@tanstack/react-query';
import { type User } from '../../types/user';
import type { FriendshipStatus } from '../profile/hooks/useFriendship';
import { apiClient } from '../../lib/apiClient';

export type Interest = { id: number; name?: string; description?: string };

export type UserProfile = User & {
    friendshipStatus: FriendshipStatus;
    interests?: Interest[];
};

export function useProfile(profileId: number) {
    return useQuery<UserProfile | null>({
        queryKey: ['profile', profileId],
        queryFn: async () =>
            await apiClient.get<UserProfile>(`/user/profile/${profileId}`),
        staleTime: 3000,
        refetchInterval: 3000,
    });
}
