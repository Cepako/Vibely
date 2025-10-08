import { useState } from 'react';
import type { Conversation } from '../../types/message';
import { useMessages } from './hooks/useMessages';
import { Dialog } from '../ui/Dialog';
import { IconX } from '@tabler/icons-react';
import { IconTrash, IconDeviceFloppy } from '@tabler/icons-react';

interface PrivateSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversation: Conversation;
}

export default function PrivateSettingsModal({
    conversation,
    isOpen,
    onClose,
}: PrivateSettingsModalProps) {
    const { updateParticipantNickname } = useMessages(conversation.id);

    const [editingNick, setEditingNick] = useState<{
        [userId: number]: string;
    }>({});

    const handleNicknameChange = async (userId: number) => {
        const nickname = editingNick[userId]?.trim();
        if (nickname) {
            await updateParticipantNickname(conversation.id, userId, nickname);
        }
    };

    const handleRemoveNickname = async (userId: number) => {
        await updateParticipantNickname(conversation.id, userId, '');
        setEditingNick((prev) => ({ ...prev, [userId]: '' }));
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} size='lg'>
            <div className='flex flex-col gap-4 p-6'>
                <div className='flex items-center justify-between'>
                    <h2 className='text-primary-500 text-xl font-semibold'>
                        Conversation Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className='cursor-pointer text-slate-500 hover:text-slate-700'
                    >
                        <IconX size={20} />
                    </button>
                </div>

                <div>
                    <h3 className='text-xs font-semibold'>Nicknames</h3>
                    <ul className='divide-y divide-slate-200'>
                        {conversation.participants.map((p) => (
                            <li
                                key={p.userId}
                                className='flex items-center justify-between py-2'
                            >
                                <div className='flex-1'>
                                    <p className='font-medium text-slate-800'>
                                        {p.user.name} {p.user.surname}
                                    </p>
                                    <div className='mt-1 flex items-center gap-2'>
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
                                            className='focus:border-primary-500 w-full rounded border border-slate-200 px-2 py-1 text-sm outline-none'
                                        />
                                        <button
                                            onClick={() =>
                                                handleNicknameChange(p.userId)
                                            }
                                            title='Save nickname'
                                            className='bg-primary-500 hover:bg-primary-600 ml-1 inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs text-white duration-150 disabled:opacity-50'
                                        >
                                            <IconDeviceFloppy size={14} />
                                            <span>Save</span>
                                        </button>
                                        {p.nickname && (
                                            <button
                                                onClick={() =>
                                                    handleRemoveNickname(
                                                        p.userId
                                                    )
                                                }
                                                title='Remove nickname'
                                                className='ml-1 inline-flex cursor-pointer items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-rose-600 duration-150 hover:bg-rose-50 disabled:opacity-50'
                                            >
                                                <IconTrash size={14} />
                                                <span>Remove</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Dialog>
    );
}
