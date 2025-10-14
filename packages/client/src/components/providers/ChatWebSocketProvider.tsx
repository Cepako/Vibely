import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useWebSocket } from '../hooks/useWebSocket';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { messageApiService } from '../messages/MessageApi';
import type { Message as ChatMessage } from '../../types/message';

interface ChatWebSocketContextType {
    isConnected: boolean;
    sendMessage: (content: string, file?: File) => Promise<void>;
}

const ChatWebSocketContext = createContext<ChatWebSocketContextType | null>(
    null
);

export const useChatWebSocket = () => {
    const context = useContext(ChatWebSocketContext);
    if (!context) {
        throw new Error(
            'useChatWebSocket must be used within ChatWebSocketProvider'
        );
    }
    return context;
};

interface ChatWebSocketProviderProps {
    children: React.ReactNode;
    conversationId: number;
}

export const ChatWebSocketProvider: React.FC<ChatWebSocketProviderProps> = ({
    children,
    conversationId,
}) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const websocketUrl = useMemo(() => {
        return user?.id && conversationId
            ? `ws://localhost:3000/ws/chat?userId=${user.id}&conversationId=${conversationId}`
            : null;
    }, [user?.id, conversationId]);

    const { isConnected, sendMessage: wsSendMessage } = useWebSocket({
        url: websocketUrl || '',
        enabled: !!websocketUrl,
        onMessage: useCallback((message: any) => {
            if (message.type === 'chat_message') {
                const newMessage: ChatMessage = message.data;

                queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
                    ['messages', newMessage.conversationId],
                    (oldData) => {
                        if (!oldData) {
                            return {
                                pages: [[newMessage]],
                                pageParams: [0],
                            };
                        }

                        const newData = { ...oldData };
                        const newPages = [...newData.pages];

                        newPages[0] = [...newPages[0], newMessage];

                        return {
                            ...newData,
                            pages: newPages,
                        };
                    }
                );

                queryClient.invalidateQueries({ queryKey: ['conversations'] });
            } else if (message.type === 'connected') {
                console.log('Connected to chat WebSocket:', message.message);
            }
        }, []),
        onConnect: useCallback(() => {
            console.log('Connected to chat WebSocket');
        }, []),
        onDisconnect: useCallback(() => {
            console.log('Disconnected from chat WebSocket');
        }, []),
    });

    const sendMessage = useCallback(
        async (content: string, file?: File): Promise<void> => {
            if (!user) throw new Error('User not authenticated');
            if (file) {
                try {
                    await messageApiService.sendMessage({
                        conversationId: conversationId,
                        content: content,
                        file: file,
                    });
                } catch (error) {
                    console.error('HTTP message send failed:', error);
                    // Optionally show an error toast
                }
            } else {
                if (!isConnected) {
                    console.error('WebSocket not connected');
                    // Optionally show an error toast
                    return;
                }
                // Send the lightweight text message directly over the socket
                wsSendMessage({
                    type: 'chat_message',
                    content: content,
                });
            }
        },
        [isConnected, wsSendMessage, user, conversationId]
    );

    const contextValue = useMemo(
        () => ({
            isConnected,
            sendMessage,
        }),
        [isConnected, sendMessage]
    );

    return (
        <ChatWebSocketContext.Provider value={contextValue}>
            {children}
        </ChatWebSocketContext.Provider>
    );
};
