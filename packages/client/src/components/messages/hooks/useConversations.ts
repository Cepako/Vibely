import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageApiService } from '../MessageApi';
import type {
    Conversation,
    CreateConversationData,
} from '../../../types/message';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthProvider';

export const useConversations = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const {
        data: conversations = [],
        isLoading,
        error,
    } = useQuery<Conversation[], Error>({
        queryKey: ['conversations'],
        queryFn: () => messageApiService.getConversations(),
        enabled: !!user?.id,
        staleTime: 30000,
        refetchOnWindowFocus: true,
    });

    const createConversationMutation = useMutation<
        Conversation,
        Error,
        CreateConversationData
    >({
        mutationFn: (data) => messageApiService.createConversation(data),
        onSuccess: (newConversation) => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });

            queryClient.setQueryData(
                ['conversations', newConversation.id],
                newConversation
            );

            toast.success('Conversation created successfully!');

            return newConversation;
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to create conversation.');
        },
    });

    const createConversation = async (data: CreateConversationData) => {
        return await createConversationMutation.mutateAsync(data);
    };

    return {
        conversations,
        isLoading,
        error,
        createConversation,
        isCreating: createConversationMutation.isPending,
    };
};
