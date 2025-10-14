import { ConversationList } from './ConversationList';
import { NewConversationModal } from './NewConversationModal';
import { Outlet, useNavigate, useParams } from '@tanstack/react-router';
import { Dialog, useDialog } from '../ui/Dialog';
import { useConversations } from './hooks/useConversations';

export default function MessagesView() {
    const dialog = useDialog(false);
    const navigate = useNavigate();
    const params = useParams({ strict: false });
    const conversationId = params.conversationId
        ? Number(params.conversationId)
        : null;

    const { conversations, isLoading } = useConversations();

    const handleSelectConversation = (conversation: any) => {
        navigate({
            to:
                params.conversationId &&
                conversation.id === Number(params.conversationId)
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
                        isLoading={isLoading}
                    />
                </div>
                <Outlet />
            </div>

            <Dialog
                isOpen={dialog.isOpen}
                onClose={dialog.closeDialog}
                size='md'
            >
                <NewConversationModal onClose={dialog.closeDialog} />
            </Dialog>
        </>
    );
}
