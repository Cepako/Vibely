import { useQuery, useQueryClient } from '@tanstack/react-query';
import { messageApiService } from '../../messages/MessageApi';
import { useNotificationWebSocketContext } from '../../providers/NotificationWebSocketProvider';
import { useEffect } from 'react';

export const useMessagesUnreadCount = () => {
    const queryClient = useQueryClient();
    const { setUnreadMessagesCount, unreadMessagesCount } =
        useNotificationWebSocketContext();

    const { data: unreadCount = 0, isLoading } = useQuery<number, Error>({
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
        setUnreadMessagesCount(unreadCount);
    }, [unreadCount, setUnreadMessagesCount]);

    return {
        unreadMessagesCount,
        isLoading,
        refetch: () =>
            queryClient.invalidateQueries({ queryKey: ['conversations'] }),
    };
};
