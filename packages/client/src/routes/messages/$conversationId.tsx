import { createFileRoute } from '@tanstack/react-router';
import { ConversationView } from '../../components/messages/ConversationView';

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

    return <ConversationView conversationId={conversationId} />;
}
