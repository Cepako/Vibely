import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthProvider';
import { messageApiService } from '../MessageApi';
import type {
    Message,
    Conversation,
    CreateMessageData,
    CreateConversationData,
    UpdateConversationNameData,
    UpdateParticipantNicknameData,
} from '../../../types/message';

interface UseMessagesReturn {
    conversations: Conversation[];
    messages: Message[];
    loading: boolean;
    error: string | null;
    sending: boolean;

    loadConversations: () => Promise<void>;
    loadMessages: (conversationId: number) => Promise<void>;
    sendMessage: (content: string, file?: File) => Promise<void>;
    createConversation: (
        participantIds: number[],
        name?: string,
        type?: 'direct' | 'group'
    ) => Promise<void>;
    markAsRead: (messageIds: number[]) => Promise<void>;
    deleteMessage: (messageId: number) => Promise<void>;
    leaveConversation: (conversationId: number) => Promise<void>;
    updateConversationName: (
        conversationId: number,
        name: string
    ) => Promise<void>;
    updateParticipantNickname: (
        conversationId: number,
        userId: number,
        nickname: string
    ) => Promise<void>;
    addParticipant: (conversationId: number, userId: number) => Promise<void>;
    removeParticipant: (
        conversationId: number,
        userId: number
    ) => Promise<void>;
}

export const useMessages = (
    conversationId: number | null
): UseMessagesReturn => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    const {
        data: conversations = [],
        isLoading: conversationsLoading,
        refetch: refetchConversations,
    } = useQuery<Conversation[], Error>({
        queryKey: ['conversations'],
        queryFn: () => messageApiService.getConversations(),
        enabled: Boolean(user?.id),
    });

    const {
        data: messages = [],
        isLoading: messagesLoading,
        refetch: refetchMessages,
    } = useQuery<Message[], Error>({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            if (!conversationId) return [];
            return messageApiService.getMessages(conversationId);
        },
        enabled: !!conversationId,
    });

    const sendMessageMutation = useMutation<Message, Error, CreateMessageData>({
        mutationFn: (data) => messageApiService.sendMessage(data),
        onSuccess: (newMessage) => {
            queryClient.invalidateQueries({
                queryKey: ['messages', newMessage.conversationId],
            });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
        onError: (err: any) =>
            setError(
                err instanceof Error ? err.message : 'Failed to send message'
            ),
    });

    const createConversationMutation = useMutation<
        Conversation,
        Error,
        CreateConversationData
    >({
        mutationFn: (data) => messageApiService.createConversation(data),
        onSuccess: (newConversation) => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
        onError: (err: any) =>
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to create conversation'
            ),
    });

    const updateConversationNameMutation = useMutation<
        Conversation,
        Error,
        { conversationId: number; data: UpdateConversationNameData }
    >({
        mutationFn: ({ conversationId, data }) =>
            messageApiService.updateConversationName(conversationId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
        onError: (err: any) =>
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to update conversation name'
            ),
    });

    const updateParticipantNicknameMutation = useMutation<
        void,
        Error,
        { conversationId: number; data: UpdateParticipantNicknameData }
    >({
        mutationFn: ({ conversationId, data }) =>
            messageApiService.updateParticipantNickname(conversationId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
        onError: (err: any) =>
            setError(
                err instanceof Error ? err.message : 'Failed to update nickname'
            ),
    });

    const addParticipantMutation = useMutation<
        void,
        Error,
        { conversationId: number; userId: number }
    >({
        mutationFn: ({ conversationId, userId }) =>
            messageApiService.addParticipant(conversationId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
        onError: (err: any) =>
            setError(
                err instanceof Error ? err.message : 'Failed to add participant'
            ),
    });

    const removeParticipantMutation = useMutation<
        void,
        Error,
        { conversationId: number; userId: number }
    >({
        mutationFn: ({ conversationId, userId }) =>
            messageApiService.removeParticipant(conversationId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
        onError: (err: any) =>
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to remove participant'
            ),
    });

    const markAsReadMutation = useMutation<void, Error, number[]>({
        mutationFn: (messageIds) =>
            messageApiService.markMessagesAsRead(messageIds),

        onSuccess: (_, messageIds) => {
            if (conversationId) {
                queryClient.setQueryData<Message[]>(
                    ['messages', conversationId],
                    (old = []) =>
                        old.map((m) =>
                            messageIds.includes(m.id)
                                ? { ...m, isRead: true }
                                : m
                        )
                );
            }
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
        onError: (err: any) =>
            console.error('Failed to mark messages as read', err),
    });

    const deleteMessageMutation = useMutation<void, Error, number>({
        mutationFn: (messageId) => messageApiService.deleteMessage(messageId),

        onSuccess: (_, messageId) => {
            if (conversationId) {
                queryClient.setQueryData<Message[]>(
                    ['messages', conversationId],
                    (old = []) => old.filter((m) => m.id !== messageId)
                );
            }
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
        onError: (err: any) =>
            setError(
                err instanceof Error ? err.message : 'Failed to delete message'
            ),
    });

    const leaveConversationMutation = useMutation<void, Error, number>({
        mutationFn: (conversationIdToLeave) =>
            messageApiService.leaveConversation(conversationIdToLeave),

        onSuccess: (_, conversationIdToLeave) => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            if (conversationId === conversationIdToLeave) {
                queryClient.removeQueries({
                    queryKey: ['messages', conversationIdToLeave],
                });
            }
        },
        onError: (err: any) =>
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to leave conversation'
            ),
    });

    const loadConversations = useCallback(async (): Promise<void> => {
        try {
            await refetchConversations();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load conversations'
            );
        }
    }, [refetchConversations]);

    const loadMessages = useCallback(
        async (convId: number): Promise<void> => {
            try {
                await queryClient.fetchQuery({
                    queryKey: ['messages', convId],
                    queryFn: () => messageApiService.getMessages(convId),
                });
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load messages'
                );
            }
        },
        [conversations, queryClient]
    );

    const sendMessage = useCallback(
        async (content: string, file?: File): Promise<void> => {
            if (!conversationId) throw new Error('No conversation selected');
            if (!content.trim() && !file)
                throw new Error('Message content or file is required');

            try {
                setSending(true);
                const messageData: CreateMessageData = {
                    conversationId: conversationId,
                    content,
                    contentType: file
                        ? file.type.startsWith('image/')
                            ? 'image'
                            : 'video'
                        : 'text',
                    file,
                };
                await sendMessageMutation.mutateAsync(messageData);
            } finally {
                setSending(false);
            }
        },
        [conversationId, sendMessageMutation]
    );

    const createConversation = useCallback(
        async (
            participantIds: number[],
            name?: string,
            type?: 'direct' | 'group'
        ): Promise<void> => {
            try {
                const data: CreateConversationData = {
                    participantIds,
                    ...(name && { name }),
                    ...(type && { type }),
                };
                await createConversationMutation.mutateAsync(data);
            } catch (err) {
                throw err;
            }
        },
        [createConversationMutation]
    );

    const updateConversationName = useCallback(
        async (convId: number, name: string): Promise<void> => {
            try {
                await updateConversationNameMutation.mutateAsync({
                    conversationId: convId,
                    data: { name },
                });
            } catch (err) {
                throw err;
            }
        },
        [updateConversationNameMutation]
    );

    const updateParticipantNickname = useCallback(
        async (
            convId: number,
            userId: number,
            nickname: string
        ): Promise<void> => {
            try {
                await updateParticipantNicknameMutation.mutateAsync({
                    conversationId: convId,
                    data: { userId, nickname },
                });
            } catch (err) {
                throw err;
            }
        },
        [updateParticipantNicknameMutation]
    );

    const addParticipant = useCallback(
        async (convId: number, userId: number): Promise<void> => {
            try {
                await addParticipantMutation.mutateAsync({
                    conversationId: convId,
                    userId,
                });
            } catch (err) {
                throw err;
            }
        },
        [addParticipantMutation]
    );

    const removeParticipant = useCallback(
        async (convId: number, userId: number): Promise<void> => {
            try {
                await removeParticipantMutation.mutateAsync({
                    conversationId: convId,
                    userId,
                });
            } catch (err) {
                throw err;
            }
        },
        [removeParticipantMutation]
    );

    const markAsRead = useCallback(
        async (messageIds: number[]): Promise<void> => {
            if (messageIds.length === 0) return;
            try {
                await markAsReadMutation.mutateAsync(messageIds);
            } catch (err) {
                console.error(err);
            }
        },
        [markAsReadMutation]
    );

    const deleteMessage = useCallback(
        async (messageId: number): Promise<void> => {
            try {
                await deleteMessageMutation.mutateAsync(messageId);
            } catch (err) {
                throw err;
            }
        },
        [deleteMessageMutation]
    );

    const leaveConversation = useCallback(
        async (convId: number): Promise<void> => {
            try {
                await leaveConversationMutation.mutateAsync(convId);
            } catch (err) {
                throw err;
            }
        },
        [leaveConversationMutation]
    );

    useEffect(() => {
        if (!conversationId || messages.length === 0) return;
        const unreadMessages = messages
            .filter((msg) => !msg.isRead && msg.senderId !== user?.id)
            .map((m) => m.id);
        if (unreadMessages.length > 0) {
            markAsRead(unreadMessages);
        }
    }, [conversationId, messages, user?.id, markAsRead]);

    const loading = conversationsLoading || messagesLoading;

    return {
        conversations,
        messages,
        loading,
        error,
        sending,

        loadConversations,
        loadMessages,
        sendMessage,
        createConversation,
        markAsRead,
        deleteMessage,
        leaveConversation,
        updateConversationName,
        updateParticipantNickname,
        addParticipant,
        removeParticipant,
    };
};
