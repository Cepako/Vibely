// src/components/messages/NewConversationModal.tsx
import React, { useState, useEffect } from 'react';
import { IconSearch, IconX, IconCheck } from '@tabler/icons-react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useFriends } from '../profile/hooks/useFriendship';

interface NewConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateConversation: (participantIds: number[]) => Promise<void>;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
    isOpen,
    onClose,
    onCreateConversation,
}) => {
    const currentUser = useCurrentUser();
    const friendsQuery = useFriends(currentUser.data?.id ?? 0);

    const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [creating, setCreating] = useState(false);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedFriends([]);
            setSearchTerm('');
        }
    }, [isOpen]);

    const handleFriendToggle = (friendId: number) => {
        setSelectedFriends((prev) =>
            prev.includes(friendId)
                ? prev.filter((id) => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleCreateConversation = async () => {
        if (selectedFriends.length === 0) return;

        try {
            setCreating(true);
            await onCreateConversation(selectedFriends);
            handleClose();
        } catch (error) {
            console.error('Failed to create conversation:', error);
        } finally {
            setCreating(false);
        }
    };

    const handleClose = () => {
        setSelectedFriends([]);
        setSearchTerm('');
        onClose();
    };

    // Get friends data from the hook
    const friends = friendsQuery.data || [];
    const loading = friendsQuery.isLoading;
    const error = friendsQuery.error;

    // Don't show modal if user data isn't loaded yet
    if (!currentUser.data?.id) {
        return null;
    }

    const filteredFriends = friends.filter((friend) =>
        `${friend.name} ${friend.surname}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-5'>
            <div
                className='flex max-h-[80vh] w-full max-w-md flex-col rounded-xl bg-white shadow-xl'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className='flex items-center justify-between border-b border-gray-200 p-5'>
                    <h2 className='text-xl font-semibold text-gray-900'>
                        New Conversation
                    </h2>
                    <button
                        className='rounded p-1 transition-colors hover:bg-gray-100'
                        onClick={handleClose}
                    >
                        <IconX size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className='flex-1 overflow-y-auto p-5'>
                    {/* Search */}
                    <div className='mb-5'>
                        <div className='relative'>
                            <IconSearch className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                            <input
                                type='text'
                                placeholder='Search friends...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='focus:ring-primary-500 w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-10 text-sm focus:border-transparent focus:bg-white focus:ring-2 focus:outline-none'
                            />
                        </div>
                    </div>

                    {/* Selected Friends */}
                    {selectedFriends.length > 0 && (
                        <div className='mb-5 border-b border-gray-200 pb-5'>
                            <h3 className='mb-3 text-base font-semibold text-gray-900'>
                                Selected ({selectedFriends.length})
                            </h3>
                            <div className='flex flex-wrap gap-2'>
                                {selectedFriends.map((friendId) => {
                                    const friend = friends.find(
                                        (f) => f.id === friendId
                                    );
                                    if (!friend) return null;

                                    return (
                                        <div
                                            key={friendId}
                                            className='bg-primary-50 text-primary-700 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium'
                                        >
                                            <span>
                                                {friend.name} {friend.surname}
                                            </span>
                                            <button
                                                className='hover:bg-primary-200 rounded-full p-0.5 transition-colors'
                                                onClick={() =>
                                                    handleFriendToggle(friendId)
                                                }
                                            >
                                                <IconX size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Friends List */}
                    <div>
                        <h3 className='mb-3 text-base font-semibold text-gray-900'>
                            Friends
                        </h3>
                        {loading ? (
                            <div className='flex flex-col items-center justify-center py-10 text-gray-500'>
                                <div className='border-t-primary-500 mb-3 h-6 w-6 animate-spin rounded-full border-2 border-gray-200'></div>
                                <p>Loading friends...</p>
                            </div>
                        ) : error ? (
                            <div className='py-10 text-center text-red-500'>
                                <p>Failed to load friends. Please try again.</p>
                            </div>
                        ) : filteredFriends.length === 0 ? (
                            <div className='py-10 text-center text-gray-500'>
                                {searchTerm ? (
                                    <p>
                                        No friends found matching "{searchTerm}"
                                    </p>
                                ) : (
                                    <p>No friends available</p>
                                )}
                            </div>
                        ) : (
                            <div className='space-y-2'>
                                {filteredFriends.map((friend) => {
                                    const isSelected = selectedFriends.includes(
                                        friend.id
                                    );

                                    return (
                                        <div
                                            key={friend.id}
                                            className={`flex cursor-pointer items-center rounded-lg p-3 transition-colors ${
                                                isSelected
                                                    ? 'bg-primary-50 border-primary-200 border'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                            onClick={() =>
                                                handleFriendToggle(friend.id)
                                            }
                                        >
                                            {/* Avatar */}
                                            <div className='relative mr-3 flex-shrink-0'>
                                                {friend.profilePictureUrl ? (
                                                    <img
                                                        src={
                                                            friend.profilePictureUrl
                                                        }
                                                        alt={friend.name}
                                                        className='h-10 w-10 rounded-full object-cover'
                                                    />
                                                ) : (
                                                    <div className='from-primary-400 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br to-purple-500 font-semibold text-white'>
                                                        {friend.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                )}
                                                {friend.isOnline && (
                                                    <div className='absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500'></div>
                                                )}
                                            </div>

                                            {/* Friend Info */}
                                            <div className='flex-1'>
                                                <h4 className='font-medium text-gray-900'>
                                                    {friend.name}{' '}
                                                    {friend.surname}
                                                </h4>
                                                <span
                                                    className={`text-sm ${friend.isOnline ? 'text-green-600' : 'text-gray-500'}`}
                                                >
                                                    {friend.isOnline
                                                        ? 'Online'
                                                        : 'Offline'}
                                                </span>
                                            </div>

                                            {/* Checkbox */}
                                            <div
                                                className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                                                    isSelected
                                                        ? 'bg-primary-500 border-primary-500 text-white'
                                                        : 'border-gray-300'
                                                }`}
                                            >
                                                {isSelected && (
                                                    <IconCheck size={12} />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className='flex gap-3 border-t border-gray-200 p-5'>
                    <button
                        className='flex-1 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200'
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button
                        className='bg-primary-500 hover:bg-primary-600 flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                        onClick={handleCreateConversation}
                        disabled={selectedFriends.length === 0 || creating}
                    >
                        {creating ? (
                            <>
                                <div className='h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-white'></div>
                                Creating...
                            </>
                        ) : (
                            `Create${selectedFriends.length > 1 ? ' Group' : ''} Chat`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
