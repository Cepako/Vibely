import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import type {
    CreateEventData,
    Event,
    EventParticipant,
} from '../../../types/events';

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`/api${endpoint}`, {
        headers: {
            ...options.headers,
        },
        ...options,
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response
            .json()
            .catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
};

export function useEventActions() {
    const queryClient = useQueryClient();

    const joinEventMutation = useMutation({
        mutationFn: async (eventId: number) => {
            return await apiCall(`/events/${eventId}/join`, {
                method: 'POST',
            });
        },
        onSuccess: (_, eventId) => {
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
            queryClient.invalidateQueries({
                queryKey: ['events'],
                exact: false,
            });
            queryClient.invalidateQueries({ queryKey: ['event-participants'] });
        },
        onError: (error) => {
            console.error('Failed to join event:', error);
        },
    });

    const leaveEventMutation = useMutation({
        mutationFn: async (eventId: number) => {
            return await apiCall(`/events/${eventId}/leave`, {
                method: 'DELETE',
            });
        },
        onSuccess: (_, eventId) => {
            queryClient.invalidateQueries({
                queryKey: ['event', eventId],
            });
            queryClient.invalidateQueries({
                queryKey: ['events'],
                exact: false,
            });
            queryClient.invalidateQueries({ queryKey: ['event-participants'] });
        },
        onError: (error) => {
            console.error('Failed to leave event:', error);
        },
    });

    const respondToInvitationMutation = useMutation({
        mutationFn: async ({
            eventId,
            status,
        }: {
            eventId: number;
            status: 'going' | 'declined';
        }) => {
            return await apiCall(`/events/${eventId}/respond`, {
                method: 'POST',
                body: JSON.stringify({ status }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['event', variables.eventId],
            });
            queryClient.invalidateQueries({
                queryKey: ['events'],
                exact: false,
            });
            queryClient.invalidateQueries({ queryKey: ['event-participants'] });
        },
        onError: (error) => {
            console.error('Failed to respond to invitation:', error);
        },
    });

    const createEventMutation = useMutation({
        mutationFn: async (eventData: CreateEventData): Promise<Event> => {
            const response = await apiCall('/events/create', {
                method: 'POST',
                body: JSON.stringify(eventData),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['events'],
                exact: false,
            });
        },
        onError: (error) => {
            console.error('Failed to create event:', error);
        },
    });

    const updateEventMutation = useMutation({
        mutationFn: async ({
            eventId,
            eventData,
        }: {
            eventId: number;
            eventData: Partial<CreateEventData>;
        }): Promise<Event> => {
            const response = await apiCall(`/events/${eventId}`, {
                method: 'PUT',
                body: JSON.stringify(eventData),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['events'],
                exact: false,
            });
            queryClient.invalidateQueries({
                queryKey: ['event', variables.eventId],
            });
        },
        onError: (error) => {
            console.error('Failed to update event:', error);
        },
    });

    const deleteEventMutation = useMutation({
        mutationFn: async (eventId: number) => {
            return await apiCall(`/events/${eventId}`, {
                method: 'DELETE',
            });
        },
        onSuccess: (_, eventId) => {
            queryClient.invalidateQueries({
                queryKey: ['events'],
                exact: false,
            });
            queryClient.removeQueries({ queryKey: ['event', eventId] });
            queryClient.removeQueries({
                queryKey: ['event-participants', eventId],
            });
        },
        onError: (error) => {
            console.error('Failed to delete event:', error);
        },
    });

    const inviteUsersMutation = useMutation({
        mutationFn: async ({
            eventId,
            userIds,
        }: {
            eventId: number;
            userIds: number[];
        }) => {
            return await apiCall(`/events/${eventId}/invite`, {
                method: 'POST',
                body: JSON.stringify({ userIds }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['events'],
                exact: false,
            });
            queryClient.invalidateQueries({
                queryKey: ['event', variables.eventId],
            });
            queryClient.invalidateQueries({
                queryKey: ['event-participants', variables.eventId],
            });
        },
        onError: (error) => {
            console.error('Failed to invite users:', error);
        },
    });

    const createEventCategoryMutation = useMutation({
        mutationFn: async ({
            name,
            description,
        }: {
            name: string;
            description?: string;
        }) => {
            const response = await apiCall('/events/categories', {
                method: 'POST',
                body: JSON.stringify({ name, description }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event-categories'] });
        },
        onError: (error) => {
            console.error('Failed to create event category:', error);
        },
    });

    return {
        joinEvent: joinEventMutation.mutate,
        joinEventAsync: joinEventMutation.mutateAsync,
        isJoiningEvent: joinEventMutation.isPending,

        leaveEvent: leaveEventMutation.mutate,
        leaveEventAsync: leaveEventMutation.mutateAsync,
        isLeavingEvent: leaveEventMutation.isPending,

        respondToInvitation: (eventId: number, status: 'going' | 'declined') =>
            respondToInvitationMutation.mutate({ eventId, status }),
        respondToInvitationAsync: respondToInvitationMutation.mutateAsync,
        isRespondingToInvitation: respondToInvitationMutation.isPending,

        createEvent: createEventMutation.mutate,
        createEventAsync: createEventMutation.mutateAsync,
        isCreatingEvent: createEventMutation.isPending,

        updateEvent: (eventId: number, eventData: Partial<CreateEventData>) =>
            updateEventMutation.mutate({ eventId, eventData }),
        updateEventAsync: updateEventMutation.mutateAsync,
        isUpdatingEvent: updateEventMutation.isPending,

        deleteEvent: deleteEventMutation.mutate,
        deleteEventAsync: deleteEventMutation.mutateAsync,
        isDeletingEvent: deleteEventMutation.isPending,

        inviteUsers: (eventId: number, userIds: number[]) =>
            inviteUsersMutation.mutate({ eventId, userIds }),
        inviteUsersAsync: inviteUsersMutation.mutateAsync,
        isInvitingUsers: inviteUsersMutation.isPending,

        createEventCategory: (name: string, description?: string) =>
            createEventCategoryMutation.mutate({ name, description }),
        createEventCategoryAsync: createEventCategoryMutation.mutateAsync,
        isCreatingEventCategory: createEventCategoryMutation.isPending,

        isLoading:
            joinEventMutation.isPending ||
            leaveEventMutation.isPending ||
            respondToInvitationMutation.isPending ||
            createEventMutation.isPending ||
            updateEventMutation.isPending ||
            deleteEventMutation.isPending ||
            inviteUsersMutation.isPending ||
            createEventCategoryMutation.isPending,
    };
}

export function useEventParticipants(eventId: number, enabled: boolean = true) {
    return useQuery<Array<EventParticipant>>({
        queryKey: ['event-participants', eventId],
        queryFn: async () => {
            const response = await apiCall(`/events/${eventId}/participants`);
            return response.data;
        },
        enabled: enabled && !!eventId,
        staleTime: 1000 * 5,
        refetchInterval: 1000 * 10,
        refetchOnMount: 'always',
    });
}

export function useEventDetail(eventId: number, enabled: boolean = true) {
    return useQuery({
        queryKey: ['event', eventId],
        queryFn: async (): Promise<Event> => {
            const response = await apiCall(`/events/${eventId}`);
            return response.data;
        },
        enabled: enabled && !!eventId,
        staleTime: 1000 * 5,
        refetchInterval: 1000 * 10,
        refetchOnMount: 'always',
    });
}

export function useSearchEvents(
    query: string,
    filters?: any,
    enabled: boolean = true
) {
    return useQuery({
        queryKey: ['search-events', query, filters],
        queryFn: async () => {
            const searchParams = new URLSearchParams({ query });

            if (filters?.categoryId)
                searchParams.append(
                    'categoryId',
                    filters.categoryId.toString()
                );
            if (filters?.privacyLevel)
                searchParams.append('privacyLevel', filters.privacyLevel);
            if (filters?.startDate)
                searchParams.append('startDate', filters.startDate);
            if (filters?.endDate)
                searchParams.append('endDate', filters.endDate);
            if (filters?.location)
                searchParams.append('location', filters.location);

            const response = await apiCall(
                `/events/search?${searchParams.toString()}`
            );
            return response.data;
        },
        enabled: enabled && query.length > 0,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}
