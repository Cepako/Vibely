import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { messageApiService } from '../../messages/MessageApi';
import { useWebSocketContext } from '../../../components/providers/WebSocketProvider';

export const useMessagesUnreadCount = () => {
    const queryClient = useQueryClient();
    const { addChatListener } = useWebSocketContext();

    const { data: totalUnread = 0, isLoading } = useQuery<number, Error>({
        queryKey: ['conversations', 'unreadCount'],
        queryFn: async () => {
            const conversations = await messageApiService.getConversations();
            return conversations.reduce(
                (sum, c: any) => sum + (c.unreadCount ?? 0),
                0
            );
        },

        staleTime: 30000,
    });

    useEffect(() => {
        if (!addChatListener) return;
        const unsub = addChatListener((event: any) => {
            if (!event || !event.conversationId) {
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
                return;
            }

            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        });

        return () => unsub();
    }, [addChatListener, queryClient]);

    return {
        totalUnread,
        isLoading,
        refetch: () =>
            queryClient.invalidateQueries({ queryKey: ['conversations'] }),
    };
};
