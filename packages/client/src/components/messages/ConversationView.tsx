import { ChatWindow } from './ChatWindow';
import { useMessages } from './hooks/useMessages';
import { useChatWebSocket } from '../providers/ChatWebSocketProvider';
import { useConversation } from './hooks/useConversation';

export function ConversationView({
    conversationId,
}: {
    conversationId: number;
}) {
    const {
        messages,
        isLoading: areMessagesLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        markAsRead,
        isSending,
    } = useMessages(conversationId);

    const { conversation, isLoading: isConversationLoading } =
        useConversation(conversationId);

    const { sendMessage } = useChatWebSocket();

    if (!Number.isFinite(conversationId)) {
        return <div className='p-4'>Please select a conversation.</div>;
    }

    if (!conversation) {
        return (
            <div className='flex h-full w-full items-center justify-center p-4 text-2xl font-semibold text-slate-700'>
                Conversation not found
            </div>
        );
    }

    if (isConversationLoading || areMessagesLoading) {
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
            sendMessage={sendMessage}
            markAsRead={markAsRead}
            isSending={isSending}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
        />
    );
}
