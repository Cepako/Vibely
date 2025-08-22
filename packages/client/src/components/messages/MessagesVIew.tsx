import { useState, useCallback } from 'react';
import { useMessages } from './hooks/useMessages';
import { useChatWebSocket } from '../hooks/useChatWebSocket';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { NewConversationModal } from './NewConversationModal';

export default function MessagesView() {
    const [showNewConversationModal, setShowNewConversationModal] =
        useState(false);

    const {
        conversations,
        currentConversation,
        messages,
        loading,
        error,
        sending,
        sendMessage,
        createConversation,
        deleteMessage,
        setCurrentConversation,
        totalUnreadCount,
        loadConversations,
        loadMessages,
    } = useMessages();

    // WebSocket for real-time chat updates
    useChatWebSocket({
        currentConversationId: currentConversation?.id || null,
        onNewMessage: useCallback(
            (message) => {
                // If the message is for the current conversation, refresh messages immediately
                if (
                    currentConversation &&
                    message.conversationId === currentConversation.id
                ) {
                    loadMessages(currentConversation.id);
                }

                // Always refresh conversations to update last message and unread counts
                loadConversations();
            },
            [currentConversation, loadMessages, loadConversations]
        ),
        onConversationUpdate: useCallback(() => {
            loadConversations();
        }, [loadConversations]),
    });

    const handleCreateConversation = async (participantIds: number[]) => {
        try {
            await createConversation(participantIds);
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    const handleSelectConversation = (conversation: any) => {
        setCurrentConversation(conversation);
    };

    const handleSendMessage = async (content: string, file?: File) => {
        if (!currentConversation) {
            console.error('No conversation selected for sending message');
            return;
        }

        try {
            await sendMessage(content, file);
        } catch (error) {
            console.error('Error in handleSendMessage:', error);
            // Optionally show user-friendly error message
        }
    };

    const handleDeleteMessage = async (messageId: number) => {
        try {
            await deleteMessage(messageId);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    return (
        <>
            {/* Messages Layout */}
            <div className='flex h-full flex-1'>
                {/* Conversation List Sidebar */}
                <div className='w-80 flex-shrink-0 border-r border-gray-200'>
                    <ConversationList
                        conversations={conversations}
                        currentConversation={currentConversation}
                        onSelectConversation={handleSelectConversation}
                        onNewConversation={() =>
                            setShowNewConversationModal(true)
                        }
                        loading={loading}
                        totalUnreadCount={totalUnreadCount}
                    />
                </div>

                {/* Chat Window */}
                <div className='flex-1'>
                    <ChatWindow
                        conversation={currentConversation}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onDeleteMessage={handleDeleteMessage}
                        loading={loading}
                        sending={sending}
                    />
                </div>
            </div>

            {/* New Conversation Modal */}
            <NewConversationModal
                isOpen={showNewConversationModal}
                onClose={() => setShowNewConversationModal(false)}
                onCreateConversation={handleCreateConversation}
            />

            {/* Error Display */}
            {error && (
                <div className='fixed right-4 bottom-4 rounded-lg bg-red-500 px-4 py-2 text-white shadow-lg'>
                    {error}
                </div>
            )}
        </>
    );
}
