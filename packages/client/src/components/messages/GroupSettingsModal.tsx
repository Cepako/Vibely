import { useState } from 'react';
import { useMessages } from './hooks/useMessages';
import { Dialog } from '../ui/Dialog';
import { IconX, IconUserPlus, IconTrash } from '@tabler/icons-react';
import { useFriends } from '../profile/hooks/useFriendship';
import { useAuth } from '../auth/AuthProvider';
import type { Conversation } from '../../types/message';
import { Nicknames } from './Nicknames';
import { IconDeviceFloppy } from '@tabler/icons-react';

interface GroupSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversation: Conversation;
}

export function GroupSettingsModal({
    isOpen,
    onClose,
    conversation,
}: GroupSettingsModalProps) {
    const user = useAuth();
    const { updateConversationName, addParticipant } = useMessages(
        conversation.id
    );

    const [newName, setNewName] = useState(conversation.name || '');

    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const isCurrentUserIsAdmin = conversation.participants.some(
        (p) => p.userId === user.user?.id && p.role === 'admin'
    );

    const friends = useFriends(user.user?.id ?? -1);
    const availableFriends =
        friends.data?.filter(
            (f) => !conversation.participants.some((p) => p.userId === f.id)
        ) || [];

    const handleSaveName = async () => {
        if (newName.trim() && newName !== conversation.name) {
            await updateConversationName(conversation.id, newName.trim());
        }
    };

    const handleRemoveName = async () => {
        if (!conversation.name) return;
        await updateConversationName(conversation.id, '');
        setNewName('');
    };

    const handleAddParticipant = async (userId: number) => {
        await addParticipant(conversation.id, userId);
        setSelectedUserId(null);
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} size='lg'>
            <div className='flex flex-col gap-3 p-6'>
                <div className='flex items-center justify-between'>
                    <h2 className='text-primary-500 text-xl font-semibold'>
                        Group Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className='cursor-pointer text-slate-500 hover:text-slate-700'
                    >
                        <IconX size={20} />
                    </button>
                </div>

                <div>
                    <h3 className='mb-2 font-semibold text-slate-800'>
                        Group Name
                    </h3>
                    <div className='flex gap-2'>
                        <input
                            value={conversation.name || ''}
                            onChange={(e) => setNewName(e.target.value)}
                            className='focus:border-primary-500 flex-1 rounded-lg border border-slate-200 px-3 py-1 outline-none'
                            placeholder='Set group name...'
                        />
                        <button
                            onClick={handleSaveName}
                            className='bg-primary-500 hover:bg-primary-600 ml-1 inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs text-white duration-150 disabled:opacity-50'
                            title='Save group name'
                        >
                            <IconDeviceFloppy size={14} />
                            <span>Save</span>
                        </button>
                        {conversation.name && (
                            <button
                                onClick={handleRemoveName}
                                className='ml-2 inline-flex cursor-pointer items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-rose-600 duration-150 hover:bg-rose-50 disabled:opacity-50'
                                title='Remove group name'
                            >
                                <IconTrash size={14} />
                                <span>Remove</span>
                            </button>
                        )}
                    </div>
                </div>

                <Nicknames
                    conversation={conversation}
                    isCurrentUserIsAdmin={isCurrentUserIsAdmin}
                />

                {isCurrentUserIsAdmin && (
                    <div>
                        <h3 className='mb-2 font-semibold text-slate-800'>
                            Add Participant
                        </h3>
                        <div className='flex gap-2'>
                            <select
                                className='flex-1 rounded-lg border border-slate-200 px-3 py-2'
                                value={selectedUserId ?? ''}
                                onChange={(e) =>
                                    setSelectedUserId(Number(e.target.value))
                                }
                            >
                                <option value=''>Select friend...</option>
                                {availableFriends.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.name} {f.surname}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() =>
                                    selectedUserId &&
                                    handleAddParticipant(selectedUserId)
                                }
                                className='bg-primary-500 hover:bg-primary-600 flex items-center gap-1 rounded-lg px-3 py-2 text-white'
                            >
                                <IconUserPlus size={16} />
                                Add
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Dialog>
    );
}
