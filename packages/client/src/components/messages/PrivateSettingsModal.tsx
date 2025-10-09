import type { Conversation } from '../../types/message';
import { Dialog } from '../ui/Dialog';
import { IconX } from '@tabler/icons-react';
import { Nicknames } from './Nicknames';

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
                <Nicknames conversation={conversation} />
            </div>
        </Dialog>
    );
}
