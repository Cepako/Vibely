import { useEffect } from 'react';
import { ChatWindow } from './ChatWindow';
import { useMessages } from './hooks/useMessages';
import { useChatWebSocket } from '../providers/ChatWebSocketProvider';

export function ConversationView({
    conversationId,
}: {
    conversationId: number;
}) {
    const {
        conversations,
        messages,
        loading,
        sending,
        loadMessages,
        markAsRead,
    } = useMessages(conversationId);

    const { sendMessage } = useChatWebSocket();

    useEffect(() => {
        if (!Number.isFinite(conversationId)) return;
        loadMessages(conversationId);
    }, [conversationId, conversations, loadMessages]);

    if (!Number.isFinite(conversationId)) {
        return <div className='p-4'>Invalid conversation</div>;
    }

    const conversation =
        conversations.find((c) => c.id === conversationId) || null;

    if (!conversation) {
        return (
            <div className='flex h-full w-full items-center justify-center p-4 text-2xl font-semibold text-slate-700'>
                Conversation not found
            </div>
        );
    }

    if (loading) {
        return (
            <div className='flex h-full w-full flex-col items-center justify-center text-slate-500'>
                <div className='border-t-primary-500 mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200'></div>
                <p>Loading conversation...</p>
            </div>
        );
    }

    return (
        <ChatWindow
            conversation={conversation}
            messages={messages}
            onSendMessage={sendMessage}
            loading={loading}
            sending={sending}
            markAsRead={markAsRead}
        />
    );
}
