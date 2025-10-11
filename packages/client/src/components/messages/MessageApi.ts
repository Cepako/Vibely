import type {
    Message,
    Conversation,
    CreateMessageData,
    CreateConversationData,
    MessageResponse,
    UpdateConversationNameData,
    UpdateParticipantNicknameData,
} from '../../types/message';
import { apiClient } from '../../lib/apiClient';

class MessageApi {
    async getConversations(limit = 20, offset = 0): Promise<Conversation[]> {
        const response = await apiClient.get<MessageResponse>(
            `/message/conversations?limit=${limit}&offset=${offset}`
        );
        const data = response?.data;
        if (Array.isArray(data)) return data as Conversation[];
        return (data ? [data as Conversation] : []) as Conversation[];
    }

    async getConversation(conversationId: number): Promise<Conversation> {
        const response = await apiClient.get<MessageResponse>(
            `/message/conversations/${conversationId}`
        );
        return response?.data as Conversation;
    }

    async createConversation(
        data: CreateConversationData
    ): Promise<Conversation> {
        const response = await apiClient.post<MessageResponse>(
            '/message/conversations',
            data
        );
        return response?.data as Conversation;
    }

    async updateConversationName(
        conversationId: number,
        data: UpdateConversationNameData
    ): Promise<Conversation> {
        const response = await apiClient.patch<MessageResponse>(
            `/message/conversations/${conversationId}`,
            data
        );
        return response?.data as Conversation;
    }

    async updateParticipantNickname(
        conversationId: number,
        data: UpdateParticipantNicknameData
    ): Promise<void> {
        await apiClient.patch(
            `/message/conversations/${conversationId}/participants/nickname`,
            data
        );
    }

    async addParticipant(
        conversationId: number,
        userId: number
    ): Promise<void> {
        await apiClient.post(
            `/message/conversations/${conversationId}/participants`,
            { userId }
        );
    }

    async removeParticipant(
        conversationId: number,
        userId: number
    ): Promise<void> {
        await apiClient.delete(
            `/message/conversations/${conversationId}/participants/${userId}`
        );
    }

    async getMessages(
        conversationId: number,
        limit = 50,
        offset = 0
    ): Promise<Message[]> {
        const response = await apiClient.get<MessageResponse>(
            `/message/messages?conversationId=${conversationId}&limit=${limit}&offset=${offset}`
        );
        const data = response?.data;
        if (Array.isArray(data)) return data as Message[];
        return (data ? [data as Message] : []) as Message[];
    }

    async sendMessage(data: CreateMessageData): Promise<Message> {
        try {
            const formData = new FormData();
            formData.append('conversationId', data.conversationId.toString());
            if (data.content) formData.append('content', data.content);

            if (data.file) {
                if (data.file.type.startsWith('image/')) {
                    formData.append('contentType', 'image');
                } else if (data.file.type.startsWith('video/')) {
                    formData.append('contentType', 'video');
                } else {
                    formData.append('contentType', 'file');
                }
                formData.append('file', data.file);
            } else if (data.contentType) {
                formData.append('contentType', data.contentType);
            }
            const result = await apiClient.upload<any>(
                `/message/messages`,
                formData
            );

            if (!result?.success || !result?.data) {
                throw new Error(
                    result?.message || 'Invalid response from server'
                );
            }

            return result.data as Message;
        } catch (err) {
            console.error('Send message API error:', err);
            throw err;
        }
    }

    async markMessagesAsRead(messageIds: number[]): Promise<void> {
        await apiClient.patch('/message/messages/read', { messageIds });
    }

    async deleteMessage(messageId: number): Promise<void> {
        await apiClient.delete(`/message/messages/${messageId}`);
    }

    async leaveConversation(conversationId: number): Promise<void> {
        await apiClient.delete(
            `/message/conversations/${conversationId}/leave`
        );
    }
}

export const messageApiService = new MessageApi();
