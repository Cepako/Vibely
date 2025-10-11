import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';

export interface Friend {
    id: number;
    name: string;
    surname: string;
    profilePictureUrl?: string;
    friendshipId: number;
    since: string;
}

export interface FriendRequest {
    id: number;
    user_userId: {
        id: number;
        name: string;
        surname: string;
        profilePictureUrl?: string;
    };
    createdAt: string;
}

export interface SentRequest {
    id: number;
    user_friendId: {
        id: number;
        name: string;
        surname: string;
        profilePictureUrl?: string;
    };
    createdAt: string;
}

export interface BlockedUser {
    id: number;
    user_friendId: {
        id: number;
        name: string;
        surname: string;
        profilePictureUrl?: string;
    };
    createdAt: string;
}

export type FriendshipStatus =
    | 'none'
    | 'pending_sent'
    | 'pending_received'
    | 'accepted'
    | 'blocked_by_you'
    | 'blocked_by_them'
    | 'self';

const baseUrl = '/friendship';

const friendshipService = {
    async getFriends(userId: number): Promise<Friend[]> {
        return await apiClient.get<Friend[]>(`${baseUrl}/${userId}/friends`);
    },

    async getFriendRequests(): Promise<FriendRequest[]> {
        return await apiClient.get<FriendRequest[]>(
            `${baseUrl}/friend-requests`
        );
    },

    async getSentFriendRequests(): Promise<SentRequest[]> {
        return await apiClient.get<SentRequest[]>(
            `${baseUrl}/friend-requests/sent`
        );
    },

    async sendFriendRequest(friendId: number): Promise<{ message: string }> {
        return await apiClient.post(`${baseUrl}/friend-requests`, { friendId });
    },

    async respondToFriendRequest(
        friendshipId: number,
        status: 'accepted' | 'rejected'
    ): Promise<{ message: string }> {
        return await apiClient.put(
            `${baseUrl}/friend-requests/${friendshipId}`,
            { status }
        );
    },

    async cancelFriendRequest(
        friendshipId: number
    ): Promise<{ message: string }> {
        return await apiClient.delete(
            `${baseUrl}/friend-requests/${friendshipId}`
        );
    },

    async removeFriend(friendId: number): Promise<{ message: string }> {
        return await apiClient.delete(`${baseUrl}/friends/${friendId}`);
    },

    async blockUser(userId: number): Promise<{ message: string }> {
        return await apiClient.post(`${baseUrl}/blocks`, { userId });
    },

    async unblockUser(userId: number): Promise<{ message: string }> {
        return await apiClient.delete(`${baseUrl}/blocks/${userId}`);
    },

    async getBlockedUsers(): Promise<BlockedUser[]> {
        return await apiClient.get<BlockedUser[]>(`${baseUrl}/blocks`, {
            credentials: 'include',
        });
    },

    async getFriendshipStatus(
        userId: number
    ): Promise<{ status: FriendshipStatus }> {
        return await apiClient.get(`${baseUrl}/friendship-status/${userId}`);
    },
};

export function useFriends(userId: number) {
    return useQuery({
        queryKey: ['friends', userId],
        queryFn: () => friendshipService.getFriends(userId),
        enabled: !!userId,
    });
}

export function useFriendRequests() {
    return useQuery({
        queryKey: ['friendRequests'],
        queryFn: () => friendshipService.getFriendRequests(),
    });
}

export function useSentFriendRequests() {
    return useQuery({
        queryKey: ['sentFriendRequests'],
        queryFn: () => friendshipService.getSentFriendRequests(),
    });
}

export function useBlockedUsers() {
    return useQuery({
        queryKey: ['blockedUsers'],
        queryFn: () => friendshipService.getBlockedUsers(),
    });
}

export function useFriendshipStatus(userId: number) {
    return useQuery({
        queryKey: ['friendshipStatus', userId],
        queryFn: () => friendshipService.getFriendshipStatus(userId),
        enabled: !!userId,
    });
}

export function useSendFriendRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (friendId: number) =>
            friendshipService.sendFriendRequest(friendId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sentFriendRequests'] });
            queryClient.invalidateQueries({ queryKey: ['friendshipStatus'] });
        },
    });
}

export function useRespondToFriendRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            friendshipId,
            status,
        }: {
            friendshipId: number;
            status: 'accepted' | 'rejected';
        }) => friendshipService.respondToFriendRequest(friendshipId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
            queryClient.invalidateQueries({ queryKey: ['friends'] });
            queryClient.invalidateQueries({ queryKey: ['friendshipStatus'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}

export function useCancelFriendRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (friendshipId: number) =>
            friendshipService.cancelFriendRequest(friendshipId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sentFriendRequests'] });
            queryClient.invalidateQueries({ queryKey: ['friendshipStatus'] });
        },
    });
}

export function useRemoveFriend() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (friendId: number) =>
            friendshipService.removeFriend(friendId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friends'] });
            queryClient.invalidateQueries({ queryKey: ['friendshipStatus'] });
        },
    });
}

export function useBlockUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: number) => friendshipService.blockUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friends'] });
            queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
            queryClient.invalidateQueries({ queryKey: ['sentFriendRequests'] });
            queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
            queryClient.invalidateQueries({ queryKey: ['friendshipStatus'] });
        },
    });
}

export function useUnblockUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: number) => friendshipService.unblockUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
            queryClient.invalidateQueries({ queryKey: ['friendshipStatus'] });
        },
    });
}
