import { IconSettings } from '@tabler/icons-react';
import { useDialog } from '../ui/Dialog';
import { GroupSettingsModal } from './GroupSettingsModal';
import type { Conversation } from '../../types/message';
import { useAuth } from '../auth/AuthProvider';
import PrivateSettingsModal from './PrivateSettingsModal';

export function ChatWindowHeader({
    conversation,
}: {
    conversation: Conversation;
}) {
    const dialog = useDialog(false);
    const { type, participants } = conversation;
    const { user } = useAuth();

    const getConversationInfo = () => {
        if (!conversation) return { name: '', isOnline: false };

        if (type === 'direct') {
            const otherParticipant = participants.find(
                (p) => p.userId !== user?.id
            );

            return {
                name: otherParticipant
                    ? (otherParticipant.nickname ??
                      `${otherParticipant.user.name} ${otherParticipant.user.surname}`)
                    : 'Unknown User',
                isOnline: otherParticipant?.user.isOnline || false,
            };
        } else {
            const participantNames = participants
                .filter((p) => p.userId !== user?.id)
                .map((p) => p.user.name);

            return {
                name:
                    conversation.name ??
                    (participantNames.length > 0
                        ? `${participantNames.join(', ')}${participants.length > 3 ? ` +${participants.length - 3}` : ''}`
                        : 'Group Chat'),
                isOnline: false,
            };
        }
    };

    const { name } = getConversationInfo();

    return (
        <>
            <div className='flex items-center justify-between gap-3 p-4'>
                <h2 className='text-xl font-semibold'>{name}</h2>

                <button
                    className='hover:text-primary-600 cursor-pointer'
                    onClick={dialog.openDialog}
                >
                    <IconSettings size={20} />
                </button>
            </div>

            {type === 'direct' ? (
                <PrivateSettingsModal
                    isOpen={dialog.isOpen}
                    onClose={dialog.closeDialog}
                    conversation={conversation}
                />
            ) : (
                <GroupSettingsModal
                    isOpen={dialog.isOpen}
                    onClose={dialog.closeDialog}
                    conversation={conversation}
                />
            )}
        </>
    );
}
