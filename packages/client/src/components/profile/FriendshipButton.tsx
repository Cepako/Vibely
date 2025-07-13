import { IconMessageCircle } from '@tabler/icons-react';
import type { FriendshipStatus } from '../../types/user';

const friendShipValues: Record<string, { text: string; styles: string }> = {
    accepted: {
        text: 'Friends',
        styles: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    },
    pending: {
        text: 'Cancel request',
        styles: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    },
    default: {
        text: 'Add friend',
        styles: 'bg-primary-600 hover:bg-primary-700 text-white',
    },
};

interface FriendshipButtonProps {
    friendshipStatus: FriendshipStatus | null;
}

export default function FriendshipButton({
    friendshipStatus,
}: FriendshipButtonProps) {
    const values = friendShipValues[friendshipStatus ?? 'default'];

    return (
        <>
            <button
                onClick={() => {}}
                className={`cursor-pointer rounded-lg px-6 py-2 font-medium ${values.styles}`}
            >
                {values.text}
            </button>
            {friendshipStatus === 'accepted' && (
                <button
                    onClick={() => {}}
                    className='flex cursor-pointer items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200'
                >
                    <IconMessageCircle size={16} />
                    <span>Message</span>
                </button>
            )}
        </>
    );
}
