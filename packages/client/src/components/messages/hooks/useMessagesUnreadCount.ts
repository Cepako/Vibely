import { useQuery, useQueryClient } from '@tanstack/react-query';
import { messageApiService } from '../../messages/MessageApi';

export const useMessagesUnreadCount = () => {
    const queryClient = useQueryClient();

    const { data: unreadMessagesCount = 0, isLoading } = useQuery<
        number,
        Error
    >({
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

    return {
        unreadMessagesCount,
        isLoading,
        refetch: () =>
            queryClient.invalidateQueries({ queryKey: ['conversations'] }),
    };
};
