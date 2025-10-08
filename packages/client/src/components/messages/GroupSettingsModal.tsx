import { useState } from 'react';
import { useMessages } from './hooks/useMessages';
import { Dialog } from '../ui/Dialog';
import { IconX, IconUserPlus, IconUserX } from '@tabler/icons-react';
import { useFriends } from '../profile/hooks/useFriendship';
import { useAuth } from '../auth/AuthProvider';
import type { Conversation } from '../../types/message';

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
    const {
        updateConversationName,
        updateParticipantNickname,
        addParticipant,
        removeParticipant,
    } = useMessages(conversation.id);

    const [newName, setNewName] = useState(conversation.name || '');
    const [editingNick, setEditingNick] = useState<{
        [userId: number]: string;
    }>({});
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const currentUserIsAdmin = conversation.participants.some(
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

    const handleNicknameChange = async (userId: number) => {
        const nickname = editingNick[userId]?.trim();
        if (nickname) {
            await updateParticipantNickname(conversation.id, userId, nickname);
        }
    };

    const handleAddParticipant = async (userId: number) => {
        await addParticipant(conversation.id, userId);
        setSelectedUserId(null);
    };

    const handleRemove = async (userId: number) => {
        await removeParticipant(conversation.id, userId);
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} size='lg'>
            <div className='p-6'>
                <div className='mb-5 flex items-center justify-between'>
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

                <div className='mb-6'>
                    <h3 className='mb-2 font-semibold text-slate-800'>
                        Group Name
                    </h3>
                    <div className='flex gap-2'>
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className='focus:ring-primary-200 flex-1 rounded-lg border border-slate-200 px-3 py-2 focus:ring'
                        />
                        <button
                            onClick={handleSaveName}
                            className='bg-primary-500 hover:bg-primary-600 rounded-lg px-3 py-2 text-white'
                        >
                            Save
                        </button>
                    </div>
                </div>

                <div className='mb-6'>
                    <h3 className='mb-2 text-sm font-semibold text-slate-800'>
                        Nicknames
                    </h3>
                    <ul className='divide-y divide-slate-200'>
                        {conversation.participants.map((p) => (
                            <li
                                key={p.userId}
                                className='flex items-center justify-between py-2'
                            >
                                <div>
                                    <p className='font-medium text-slate-800'>
                                        {p.user.name} {p.user.surname}
                                    </p>
                                    <input
                                        type='text'
                                        placeholder={
                                            p.nickname || 'Set nickname'
                                        }
                                        value={editingNick[p.userId] ?? ''}
                                        onChange={(e) =>
                                            setEditingNick((prev) => ({
                                                ...prev,
                                                [p.userId]: e.target.value,
                                            }))
                                        }
                                        onBlur={() =>
                                            handleNicknameChange(p.userId)
                                        }
                                        className='focus:border-primary-500 mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm outline-none'
                                    />
                                </div>
                                {currentUserIsAdmin && (
                                    <button
                                        onClick={() => handleRemove(p.userId)}
                                        className='cursor-pointer text-rose-500 hover:text-rose-600'
                                    >
                                        <IconUserX size={18} />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {currentUserIsAdmin && (
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
