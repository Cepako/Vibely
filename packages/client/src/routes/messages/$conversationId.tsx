import { createFileRoute } from '@tanstack/react-router';
import { ConversationView } from '../../components/messages/ConversationView';
import { ChatWebSocketProvider } from '../../components/providers/ChatWebSocketProvider';

export const Route = createFileRoute('/messages/$conversationId')({
    beforeLoad: ({ context }) => {
        if (!context.auth.isAuthenticated) {
            throw new Error('unauthenticated');
        }
    },
    component: ConversationComponent,
});

function ConversationComponent() {
    const params = Route.useParams();
    const conversationId = Number(params.conversationId);

    return (
        <ChatWebSocketProvider conversationId={conversationId}>
            <ConversationView conversationId={conversationId} />
        </ChatWebSocketProvider>
    );
}
