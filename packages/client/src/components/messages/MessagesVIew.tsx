import { useCallback } from 'react';
import { useMessages } from './hooks/useMessages';
import { useChatWebSocket } from '../hooks/useChatWebSocket';
import { ConversationList } from './ConversationList';
import { NewConversationModal } from './NewConversationModal';
import type { Message } from '../../types/message';
import { Outlet, useNavigate, useParams } from '@tanstack/react-router';
import { Dialog, useDialog } from '../ui/Dialog';

export default function MessagesView() {
    const dialog = useDialog(false);
    const navigate = useNavigate();
    const params = useParams({ strict: false });
    const conversationId = params.conversationId
        ? Number(params.conversationId)
        : null;

    const {
        conversations,
        loading,
        error,
        createConversation,
        totalUnreadCount,
        loadConversations,
        loadMessages,
    } = useMessages(conversationId);

    useChatWebSocket({
        currentConversationId: conversationId,
        onNewMessage: useCallback(
            (message: Message) => {
                if (
                    conversationId &&
                    message.conversationId === conversationId
                ) {
                    loadMessages(conversationId);
                }

                loadConversations();
            },
            [conversationId, loadMessages, loadConversations]
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
        navigate({
            to:
                conversation.id === params.conversationId
                    ? '/messages/'
                    : `/messages/${conversation.id}`,
        });
    };

    return (
        <>
            <div className='flex h-full flex-1'>
                <div className='w-96 flex-shrink-0 border-r border-slate-200'>
                    <ConversationList
                        conversations={conversations}
                        conversationId={conversationId}
                        onSelectConversation={handleSelectConversation}
                        onNewConversation={dialog.openDialog}
                        loading={loading}
                        totalUnreadCount={totalUnreadCount}
                    />
                </div>
                <Outlet />
            </div>

            <Dialog
                isOpen={dialog.isOpen}
                onClose={dialog.closeDialog}
                size='md'
            >
                <NewConversationModal
                    onClose={dialog.closeDialog}
                    onCreateConversation={handleCreateConversation}
                />
            </Dialog>

            {error && (
                <div className='fixed right-4 bottom-4 rounded-lg bg-rose-500 px-4 py-2 text-white shadow-lg'>
                    {error}
                </div>
            )}
        </>
    );
}
