import { useEffect } from 'react';
import { ChatWindow } from './ChatWindow';
import { useMessages } from './hooks/useMessages';

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
        sendMessage,
        deleteMessage,
    } = useMessages(conversationId);

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
        return <div className='p-4'>Conversation not found</div>;
    }

    if (loading && messages.length === 0) {
        return <div className='p-4'>Loading...</div>;
    }

    return (
        <ChatWindow
            conversation={conversation}
            messages={messages}
            onSendMessage={sendMessage}
            onDeleteMessage={deleteMessage}
            loading={loading}
            sending={sending}
        />
    );
}
