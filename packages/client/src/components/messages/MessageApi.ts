import type {
    Message,
    Conversation,
    CreateMessageData,
    CreateConversationData,
    MessageResponse,
    UpdateConversationNameData,
    UpdateParticipantNicknameData,
} from '../../types/message';

class MessageApi {
    private async request<T = any>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const response = await fetch(`/api/message${endpoint}`, {
            ...options,
            headers: {
                ...options.headers,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error?.message || `HTTP ${response.status}`);
        }

        return response.json();
    }

    async getConversations(limit = 20, offset = 0): Promise<Conversation[]> {
        const response = await this.request<MessageResponse>(
            `/conversations?limit=${limit}&offset=${offset}`
        );
        const data = response?.data;
        if (Array.isArray(data)) return data as Conversation[];
        return (data ? [data as Conversation] : []) as Conversation[];
    }

    async getConversation(conversationId: number): Promise<Conversation> {
        const response = await this.request<MessageResponse>(
            `/conversations/${conversationId}`
        );
        return response?.data as Conversation;
    }

    async createConversation(
        data: CreateConversationData
    ): Promise<Conversation> {
        const response = await this.request<MessageResponse>('/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response?.data as Conversation;
    }

    async updateConversationName(
        conversationId: number,
        data: UpdateConversationNameData
    ): Promise<Conversation> {
        const response = await this.request<MessageResponse>(
            `/conversations/${conversationId}`,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }
        );
        return response?.data as Conversation;
    }

    async updateParticipantNickname(
        conversationId: number,
        data: UpdateParticipantNicknameData
    ): Promise<void> {
        await this.request(
            `/conversations/${conversationId}/participants/nickname`,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }
        );
    }

    async addParticipant(
        conversationId: number,
        userId: number
    ): Promise<void> {
        await this.request(`/conversations/${conversationId}/participants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });
    }

    async removeParticipant(
        conversationId: number,
        userId: number
    ): Promise<void> {
        await this.request(
            `/conversations/${conversationId}/participants/${userId}`,
            {
                method: 'DELETE',
            }
        );
    }

    async getMessages(
        conversationId: number,
        limit = 50,
        offset = 0
    ): Promise<Message[]> {
        const response = await this.request<MessageResponse>(
            `/messages?conversationId=${conversationId}&limit=${limit}&offset=${offset}`
        );
        const data = response?.data;
        if (Array.isArray(data)) return data as Message[];
        return (data ? [data as Message] : []) as Message[];
    }

    async sendMessage(data: CreateMessageData): Promise<Message> {
        try {
            const formData = new FormData();
            formData.append('conversationId', data.conversationId.toString());
            formData.append('content', data.content || '');
            if (data.contentType)
                formData.append('contentType', data.contentType);
            if (data.file) formData.append('file', data.file);

            const response = await fetch(`/api/message/messages`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error?.message || `HTTP ${response.status}`);
            }

            const result = await response.json();
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
        await this.request('/messages/read', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageIds }),
        });
    }

    async deleteMessage(messageId: number): Promise<void> {
        await this.request(`/messages/${messageId}`, { method: 'DELETE' });
    }

    async leaveConversation(conversationId: number): Promise<void> {
        await this.request(`/conversations/${conversationId}/leave`, {
            method: 'DELETE',
        });
    }
}

export const messageApiService = new MessageApi();
