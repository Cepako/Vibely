import { useState } from 'react';
import type { Conversation } from '../../types/message';
import { IconDeviceFloppy, IconTrash, IconUserX } from '@tabler/icons-react';
import { useAuth } from '../auth/AuthProvider';
import { useConversation } from './hooks/useConversation';

export function Nicknames({
    conversation,
    isCurrentUserIsAdmin,
}: {
    conversation: Conversation;
    isCurrentUserIsAdmin?: boolean;
}) {
    const { user } = useAuth();
    const { updateParticipantNickname, removeParticipant } = useConversation(
        conversation.id
    );

    const [editingNick, setEditingNick] = useState<{
        [userId: number]: string;
    }>({});

    const handleNicknameChange = async (userId: number) => {
        const nickname = editingNick[userId]?.trim();
        if (nickname) {
            updateParticipantNickname(userId, nickname);
        }
    };

    const handleRemoveNickname = async (userId: number) => {
        updateParticipantNickname(userId, '');
        setEditingNick((prev) => ({ ...prev, [userId]: '' }));
    };

    const handleRemove = async (userId: number) => {
        removeParticipant(userId);
    };

    return (
        <div>
            <h3 className='font-semibold text-slate-700'>Nicknames</h3>
            <ul className='divide-y divide-slate-200'>
                {conversation.participants.map((p) => (
                    <li
                        key={p.userId}
                        className='flex items-center justify-between py-2'
                    >
                        <div className='flex-1'>
                            <p className='flex items-center gap-3 font-medium text-slate-800'>
                                {p.user.name} {p.user.surname}
                                {isCurrentUserIsAdmin &&
                                    user?.id !== p.userId && (
                                        <button
                                            onClick={() =>
                                                handleRemove(p.userId)
                                            }
                                            title='Remove participant'
                                            className='cursor-pointer text-rose-500 hover:text-rose-600'
                                        >
                                            <IconUserX size={18} />
                                        </button>
                                    )}
                            </p>
                            <div className='mt-1 flex items-center gap-2'>
                                <input
                                    type='text'
                                    placeholder={p.nickname || 'Set nickname'}
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
                                            handleRemoveNickname(p.userId)
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
    );
}
