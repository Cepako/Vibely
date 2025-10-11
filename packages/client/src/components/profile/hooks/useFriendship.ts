import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

const baseUrl = '/api/friendship';

const friendshipService = {
    async getFriends(userId: number): Promise<Friend[]> {
        const response = await fetch(`${baseUrl}/${userId}/friends`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch friends');
        }

        return response.json();
    },

    async getFriendRequests(): Promise<FriendRequest[]> {
        const response = await fetch(`${baseUrl}/friend-requests`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch friend requests');
        }

        return response.json();
    },

    async getSentFriendRequests(): Promise<SentRequest[]> {
        const response = await fetch(`${baseUrl}/friend-requests/sent`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch sent friend requests');
        }

        return response.json();
    },

    async sendFriendRequest(friendId: number): Promise<{ message: string }> {
        const response = await fetch(`${baseUrl}/friend-requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ friendId }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to send friend request');
        }

        return response.json();
    },

    async respondToFriendRequest(
        friendshipId: number,
        status: 'accepted' | 'rejected'
    ): Promise<{ message: string }> {
        const response = await fetch(
            `${baseUrl}/friend-requests/${friendshipId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ status }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                error.error || 'Failed to respond to friend request'
            );
        }

        return response.json();
    },

    async cancelFriendRequest(
        friendshipId: number
    ): Promise<{ message: string }> {
        const response = await fetch(
            `${baseUrl}/friend-requests/${friendshipId}`,
            {
                method: 'DELETE',
                credentials: 'include',
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to cancel friend request');
        }

        return response.json();
    },

    async removeFriend(friendId: number): Promise<{ message: string }> {
        const response = await fetch(`${baseUrl}/friends/${friendId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to remove friend');
        }

        return response.json();
    },

    async blockUser(userId: number): Promise<{ message: string }> {
        const response = await fetch(`${baseUrl}/blocks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to block user');
        }

        return response.json();
    },

    async unblockUser(userId: number): Promise<{ message: string }> {
        const response = await fetch(`${baseUrl}/blocks/${userId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to unblock user');
        }

        return response.json();
    },

    async getBlockedUsers(): Promise<BlockedUser[]> {
        const response = await fetch(`${baseUrl}/blocks`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch blocked users');
        }

        return response.json();
    },

    async getFriendshipStatus(
        userId: number
    ): Promise<{ status: FriendshipStatus }> {
        const response = await fetch(`${baseUrl}/friendship-status/${userId}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to get friendship status');
        }

        return response.json();
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
