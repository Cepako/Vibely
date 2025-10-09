import { useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useWebSocket } from './useWebSocket';
import type { Message } from '../../types/message';

interface UseChatWebSocketProps {
    currentConversationId: number | null;
    onNewMessage?: (message: Message) => void;
    onMessageUpdate?: (message: Message) => void;
    onConversationUpdate?: () => void;
}

interface UseChatWebSocketReturn {
    isConnected: boolean;
    sendTypingIndicator: (isTyping: boolean) => void;
}

export const useChatWebSocket = ({
    currentConversationId,
    onNewMessage,
    onMessageUpdate,
    onConversationUpdate,
}: UseChatWebSocketProps): UseChatWebSocketReturn => {
    const { user } = useAuth();

    const chatWebSocketUrl = useMemo(() => {
        return user?.id && currentConversationId
            ? `ws://localhost:3000/ws/chat?userId=${user.id}&conversationId=${currentConversationId}`
            : null;
    }, [user?.id, currentConversationId]);

    const { isConnected, sendMessage } = useWebSocket({
        url: chatWebSocketUrl || '',
        enabled: !!chatWebSocketUrl,
        onMessage: useCallback(
            (message: any) => {
                console.log('Chat WebSocket message:', message);

                switch (message.type) {
                    case 'new_message':
                    case 'chat_message':
                        if (message.data && onNewMessage) {
                            onNewMessage(message.data);
                        }
                        if (onConversationUpdate) {
                            onConversationUpdate();
                        }
                        break;
                    case 'message_updated':
                        if (message.data && onMessageUpdate) {
                            onMessageUpdate(message.data);
                        }
                        break;
                    case 'conversation_updated':
                        if (onConversationUpdate) {
                            onConversationUpdate();
                        }
                        break;
                    case 'user_typing':
                        // Handle typing indicator
                        console.log(`User ${message.from} is typing`);
                        break;
                    case 'user_stopped_typing':
                        // Handle stop typing indicator
                        console.log(`User ${message.from} stopped typing`);
                        break;
                    case 'connected':
                        console.log(
                            'Connected to chat WebSocket:',
                            message.message
                        );
                        break;
                    default:
                        console.log('Unknown chat message type:', message.type);
                }
            },
            [onNewMessage, onMessageUpdate, onConversationUpdate]
        ),
        onConnect: useCallback(() => {
            console.log('Connected to chat WebSocket');
        }, []),
        onDisconnect: useCallback(() => {
            console.log('Disconnected from chat WebSocket');
        }, []),
    });

    // Send typing indicator
    const sendTypingIndicator = useCallback(
        (isTyping: boolean) => {
            if (sendMessage) {
                sendMessage({
                    type: isTyping ? 'start_typing' : 'stop_typing',
                    conversationId: currentConversationId,
                });
            }
        },
        [sendMessage, currentConversationId]
    );

    return {
        isConnected,
        sendTypingIndicator,
    };
};
