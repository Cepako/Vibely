// src/components/hooks/useMessages.ts
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { messageApiService } from '../MessageApi';
import type {
    Message,
    Conversation,
    CreateMessageData,
    CreateConversationData,
} from '../../../types/message';

interface UseMessagesReturn {
    // State
    conversations: Conversation[];
    currentConversation: Conversation | null;
    messages: Message[];
    loading: boolean;
    error: string | null;
    sending: boolean;

    // Actions
    loadConversations: () => Promise<void>;
    loadMessages: (conversationId: number) => Promise<void>;
    sendMessage: (content: string, file?: File) => Promise<void>;
    createConversation: (participantIds: number[]) => Promise<void>;
    markAsRead: (messageIds: number[]) => Promise<void>;
    deleteMessage: (messageId: number) => Promise<void>;
    leaveConversation: (conversationId: number) => Promise<void>;
    setCurrentConversation: (conversation: Conversation | null) => void;

    // Computed
    totalUnreadCount: number;
}

export const useMessages = (): UseMessagesReturn => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversation, setCurrentConversationState] =
        useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    // Load conversations
    const loadConversations = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError(null);
            const data = await messageApiService.getConversations();
            setConversations(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load conversations'
            );
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Load messages for a conversation
    const loadMessages = useCallback(async (conversationId: number) => {
        try {
            setLoading(true);
            setError(null);
            const data = await messageApiService.getMessages(conversationId);
            setMessages(data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to load messages'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // Send a message
    const sendMessage = useCallback(
        async (content: string, file?: File) => {
            if (!currentConversation) {
                throw new Error('No conversation selected');
            }

            if (!content.trim() && !file) {
                throw new Error('Message content or file is required');
            }

            try {
                setSending(true);
                setError(null);

                const messageData: CreateMessageData = {
                    conversationId: currentConversation.id,
                    content,
                    contentType: file
                        ? file.type.startsWith('image/')
                            ? 'image'
                            : 'video'
                        : 'text',
                    file,
                };

                const newMessage =
                    await messageApiService.sendMessage(messageData);

                // Add message to current messages
                setMessages((prev) => [...prev, newMessage]);

                // Update conversation with new last message
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.id === currentConversation.id
                            ? {
                                  ...conv,
                                  lastMessage: newMessage,
                                  updatedAt: newMessage.createdAt,
                              }
                            : conv
                    )
                );
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Failed to send message';
                setError(errorMessage);
                console.error('Send message error:', err);
                throw new Error(errorMessage);
            } finally {
                setSending(false);
            }
        },
        [currentConversation]
    );

    // Create new conversation
    const createConversation = useCallback(async (participantIds: number[]) => {
        try {
            setLoading(true);
            setError(null);

            const data: CreateConversationData = { participantIds };
            const newConversation =
                await messageApiService.createConversation(data);

            setConversations((prev) => [newConversation, ...prev]);
            setCurrentConversationState(newConversation);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to create conversation'
            );
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Mark messages as read
    const markAsRead = useCallback(
        async (messageIds: number[]) => {
            if (messageIds.length === 0) return;

            try {
                await messageApiService.markMessagesAsRead(messageIds);

                // Update messages read status
                setMessages((prev) =>
                    prev.map((msg) =>
                        messageIds.includes(msg.id)
                            ? { ...msg, isRead: true }
                            : msg
                    )
                );

                // Update conversation unread count
                if (currentConversation) {
                    setConversations((prev) =>
                        prev.map((conv) =>
                            conv.id === currentConversation.id
                                ? {
                                      ...conv,
                                      unreadCount: Math.max(
                                          0,
                                          conv.unreadCount - messageIds.length
                                      ),
                                  }
                                : conv
                        )
                    );
                }
            } catch (err) {
                console.error('Failed to mark messages as read:', err);
            }
        },
        [currentConversation]
    );

    // Delete message
    const deleteMessage = useCallback(async (messageId: number) => {
        try {
            await messageApiService.deleteMessage(messageId);
            setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to delete message'
            );
            throw err;
        }
    }, []);

    // Leave conversation
    const leaveConversation = useCallback(
        async (conversationId: number) => {
            try {
                await messageApiService.leaveConversation(conversationId);
                setConversations((prev) =>
                    prev.filter((conv) => conv.id !== conversationId)
                );

                if (currentConversation?.id === conversationId) {
                    setCurrentConversationState(null);
                    setMessages([]);
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to leave conversation'
                );
                throw err;
            }
        },
        [currentConversation]
    );

    // Set current conversation and load its messages
    const setCurrentConversation = useCallback(
        (conversation: Conversation | null) => {
            setCurrentConversationState(conversation);
            if (conversation) {
                loadMessages(conversation.id);
            } else {
                setMessages([]);
            }
        },
        [loadMessages]
    );

    // Calculate total unread count
    const totalUnreadCount = conversations.reduce(
        (sum, conv) => sum + conv.unreadCount,
        0
    );

    // Auto-mark messages as read when viewing conversation
    useEffect(() => {
        if (currentConversation && messages.length > 0) {
            const unreadMessages = messages
                .filter((msg) => !msg.isRead && msg.senderId !== user?.id)
                .map((msg) => msg.id);

            if (unreadMessages.length > 0) {
                markAsRead(unreadMessages);
            }
        }
    }, [currentConversation, messages, user?.id, markAsRead]);

    // Load conversations on mount
    useEffect(() => {
        if (user?.id) {
            loadConversations();
        }
    }, [user?.id, loadConversations]);

    return {
        // State
        conversations,
        currentConversation,
        messages,
        loading,
        error,
        sending,

        // Actions
        loadConversations,
        loadMessages,
        sendMessage,
        createConversation,
        markAsRead,
        deleteMessage,
        leaveConversation,
        setCurrentConversation,

        // Computed
        totalUnreadCount,
    };
};
