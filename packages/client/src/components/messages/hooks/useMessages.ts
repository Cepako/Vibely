import { useCallback, useMemo } from 'react';
import {
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from '@tanstack/react-query';
import { messageApiService } from '../MessageApi';
import type {
    Message,
    Conversation,
    CreateMessageData,
} from '../../../types/message';

interface UseMessagesReturn {
    messages: Message[];
    isLoading: boolean;
    isSending: boolean;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    sendMessage: (content: string, file?: File) => Promise<void>;
    markAsRead: (
        messageIds: number[],
        countToDecrement: number
    ) => Promise<void>;
    deleteMessage: (messageId: number) => Promise<void>;
}

const MESSAGE_PAGE_LIMIT = 50;

export const useMessages = (
    conversationId?: number | null
): UseMessagesReturn => {
    const queryClient = useQueryClient();

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteQuery({
            queryKey: ['messages', conversationId],
            queryFn: async ({ pageParam = 0 }: { pageParam: number }) => {
                if (!conversationId) return [];
                return messageApiService.getMessages(
                    conversationId,
                    MESSAGE_PAGE_LIMIT,
                    pageParam
                );
            },
            initialPageParam: 0,
            getNextPageParam: (lastPage, allPages) => {
                if (
                    !Array.isArray(lastPage) ||
                    !Array.isArray(allPages) ||
                    lastPage.length < MESSAGE_PAGE_LIMIT
                ) {
                    return undefined;
                }

                return allPages.flat().length;
            },
            enabled: !!conversationId,
            select: (data) => ({
                ...data,
                pages: [...data.pages].reverse(),
            }),
        });

    const messages = useMemo(() => data?.pages.flat() ?? [], [data]);

    const sendMessageMutation = useMutation<Message, Error, CreateMessageData>({
        mutationFn: (data) => messageApiService.sendMessage(data),
        onSuccess: (newMessage) => {
            queryClient.invalidateQueries({
                queryKey: ['messages', newMessage.conversationId],
            });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    const markAsReadMutation = useMutation<
        void,
        Error,
        { messageIds: number[]; countToDecrement: number }
    >({
        mutationFn: ({ messageIds }) =>
            messageApiService.markMessagesAsRead(messageIds),
        onMutate: async ({ countToDecrement }) => {
            await queryClient.cancelQueries({
                queryKey: ['conversations', 'unreadCount'],
            });

            queryClient.setQueryData<number>(
                ['conversations', 'unreadCount'],
                (old = 0) => Math.max(0, old - countToDecrement)
            );

            queryClient.setQueryData<Conversation[]>(
                ['conversations'],
                (old = []) =>
                    old.map((c) =>
                        c.id === conversationId
                            ? {
                                  ...c,
                                  unreadCount: Math.max(
                                      0,
                                      c.unreadCount - countToDecrement
                                  ),
                              }
                            : c
                    )
            );
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    const deleteMessageMutation = useMutation<void, Error, number>({
        mutationFn: (messageId) => messageApiService.deleteMessage(messageId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['messages', conversationId],
            });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    const sendMessage = useCallback(
        async (content: string, file?: File): Promise<void> => {
            if (!conversationId) throw new Error('No conversation selected');
            if (!content.trim() && !file)
                throw new Error('Message content or file is required');

            const messageData: CreateMessageData = {
                conversationId: conversationId,
                content,
                contentType: (() => {
                    if (!file) return 'text';
                    if (file.type.startsWith('image/')) return 'image';
                    if (file.type.startsWith('video/')) return 'video';
                    return 'file';
                })(),
                file,
            };
            await sendMessageMutation.mutateAsync(messageData);
        },
        [conversationId, sendMessageMutation]
    );

    const markAsRead = useCallback(
        async (
            messageIds: number[],
            countToDecrement: number
        ): Promise<void> => {
            if (messageIds.length === 0) return;
            await markAsReadMutation.mutateAsync({
                messageIds,
                countToDecrement,
            });
        },
        [markAsReadMutation]
    );

    const deleteMessage = useCallback(
        async (messageId: number): Promise<void> => {
            await deleteMessageMutation.mutateAsync(messageId);
        },
        [deleteMessageMutation]
    );

    return {
        messages,
        isLoading,
        isSending: sendMessageMutation.isPending,
        fetchNextPage,
        hasNextPage: hasNextPage ?? false,
        isFetchingNextPage,
        sendMessage,
        markAsRead,
        deleteMessage,
    };
};
