import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageApiService } from '../MessageApi';
import type {
    Conversation,
    UpdateConversationNameData,
    UpdateParticipantNicknameData,
} from '../../../types/message';
import toast from 'react-hot-toast';

export const useConversation = (conversationId: number) => {
    const queryClient = useQueryClient();

    const {
        data: conversation,
        isLoading,
        error,
    } = useQuery<Conversation, Error>({
        queryKey: ['conversations', conversationId],
        queryFn: () => messageApiService.getConversation(conversationId),
        enabled: !!conversationId,
    });

    const updateConversationNameMutation = useMutation<
        Conversation,
        Error,
        UpdateConversationNameData
    >({
        mutationFn: (data) =>
            messageApiService.updateConversationName(conversationId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['conversations', conversationId],
            });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            toast.success('Conversation name updated.');
        },
        onError: (err) => toast.error(err.message || 'Failed to update name.'),
    });

    const addParticipantMutation = useMutation<void, Error, { userId: number }>(
        {
            mutationFn: ({ userId }) =>
                messageApiService.addParticipant(conversationId, userId),
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ['conversations', conversationId],
                });
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
                toast.success('Participant added.');
            },
            onError: (err) =>
                toast.error(err.message || 'Failed to add participant.'),
        }
    );

    const removeParticipantMutation = useMutation<
        void,
        Error,
        { userId: number }
    >({
        mutationFn: ({ userId }) =>
            messageApiService.removeParticipant(conversationId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['conversations', conversationId],
            });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            toast.success('Participant removed.');
        },
        onError: (err) =>
            toast.error(err.message || 'Failed to remove participant.'),
    });

    const updateParticipantNicknameMutation = useMutation<
        void,
        Error,
        UpdateParticipantNicknameData
    >({
        mutationFn: (data) =>
            messageApiService.updateParticipantNickname(conversationId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['conversations', conversationId],
            });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            toast.success('Nickname updated.');
        },
        onError: (err) =>
            toast.error(err.message || 'Failed to update nickname.'),
    });

    const leaveConversationMutation = useMutation<void, Error, void>({
        mutationFn: () => messageApiService.leaveConversation(conversationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.removeQueries({
                queryKey: ['conversations', conversationId],
            });
            queryClient.removeQueries({
                queryKey: ['messages', conversationId],
            });
            toast.success('You have left the conversation.');
        },
        onError: (err) =>
            toast.error(err.message || 'Failed to leave conversation.'),
    });

    const updateConversationName = (name: string) =>
        updateConversationNameMutation.mutate({ name });

    const addParticipant = (userId: number) =>
        addParticipantMutation.mutate({ userId });

    const removeParticipant = (userId: number) =>
        removeParticipantMutation.mutate({ userId });

    const updateParticipantNickname = (userId: number, nickname: string) =>
        updateParticipantNicknameMutation.mutate({ userId, nickname });

    const leaveConversation = () => leaveConversationMutation.mutate();

    return {
        conversation,
        isLoading,
        error,
        updateConversationName,
        addParticipant,
        removeParticipant,
        updateParticipantNickname,
        leaveConversation,
    };
};
