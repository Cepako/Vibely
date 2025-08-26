import { useState } from 'react';
import {
    IconX,
    IconSearch,
    IconUserPlus,
    IconCheck,
} from '@tabler/icons-react';
import { useEventActions } from './hooks/useEventActions';
import { useFriends } from '../profile/hooks/useFriendship';
import { useCurrentUser } from '../hooks/useCurrentUser';

interface InviteFriendsModalProps {
    eventId: number;
    closeModal: () => void;
    maxParticipants?: number;
    currentParticipantCount: number;
    alreadyInvitedFriendIds: number[];
}

export default function InviteFriendsModal({
    eventId,
    closeModal,
    maxParticipants,
    currentParticipantCount,
    alreadyInvitedFriendIds,
}: InviteFriendsModalProps) {
    const [selectedFriends, setSelectedFriends] = useState<Set<number>>(
        new Set()
    );
    const currentUser = useCurrentUser();
    const friendsQuery = useFriends(currentUser.data?.id ?? 0);
    const [searchQuery, setSearchQuery] = useState('');

    const { inviteUsers, isInvitingUsers } = useEventActions();

    const friends = friendsQuery.data ?? [];
    const filteredFriends = friends.filter((friend) =>
        `${friend.name} ${friend.surname}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    const availableSpots = maxParticipants
        ? maxParticipants - currentParticipantCount
        : null;
    const hasAvailableSpots = !maxParticipants || availableSpots! > 0;
    const remainingSpotsAfterSelection = availableSpots
        ? availableSpots - selectedFriends.size
        : null;

    const toggleFriendSelection = (friendId: number) => {
        const newSelected = new Set(selectedFriends);
        if (newSelected.has(friendId)) {
            newSelected.delete(friendId);
        } else {
            if (
                remainingSpotsAfterSelection === null ||
                remainingSpotsAfterSelection > 0
            ) {
                newSelected.add(friendId);
            }
        }
        setSelectedFriends(newSelected);
    };

    const handleInvite = async () => {
        if (selectedFriends.size === 0) return;

        try {
            inviteUsers(eventId, Array.from(selectedFriends));
            closeModal();
        } catch (error) {
            console.error('Failed to invite friends:', error);
        }
    };

    const isFriendDisabled = (friendId: number) => {
        if (alreadyInvitedFriendIds.includes(friendId)) {
            return true;
        }

        if (
            !selectedFriends.has(friendId) &&
            remainingSpotsAfterSelection === 0
        ) {
            return true;
        }

        return false;
    };

    const getFriendStatusText = (friendId: number) => {
        if (alreadyInvitedFriendIds.includes(friendId)) {
            return 'Already invited';
        }
        return null;
    };

    return (
        <div className='max-h-[80vh] w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-xl'>
            <div className='border-b border-slate-200 p-6'>
                <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-semibold text-slate-900'>
                        Invite Friends
                    </h2>
                    <button
                        onClick={closeModal}
                        className='cursor-pointer text-slate-400 hover:text-slate-600'
                    >
                        <IconX size={24} />
                    </button>
                </div>
                {maxParticipants && (
                    <div className='mt-3 text-sm text-slate-600'>
                        {availableSpots! > 0 ? (
                            <div className='rounded-lg border border-blue-200 bg-blue-50 p-3'>
                                <p>
                                    <span className='font-medium'>
                                        {availableSpots} spots remaining
                                    </span>{' '}
                                    ({currentParticipantCount}/{maxParticipants}{' '}
                                    participants)
                                </p>
                                {selectedFriends.size > 0 && (
                                    <p className='mt-1'>
                                        After inviting {selectedFriends.size}{' '}
                                        friend
                                        {selectedFriends.size === 1 ? '' : 's'}:
                                        <span className='ml-1 font-medium'>
                                            {remainingSpotsAfterSelection} spots
                                            remaining
                                        </span>
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
                                <p className='font-medium text-red-700'>
                                    Event is at maximum capacity (
                                    {currentParticipantCount}/{maxParticipants}{' '}
                                    participants)
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className='flex max-h-[60vh] flex-col'>
                <div className='border-b border-slate-200 p-4'>
                    <div className='relative'>
                        <IconSearch
                            size={20}
                            className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-400'
                        />
                        <input
                            type='text'
                            placeholder='Search friends...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='focus:border-primary-500 focus:ring-primary-500 focus:ring-0.5 w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 outline-none'
                        />
                    </div>
                </div>

                {friendsQuery.error && (
                    <div className='border-b border-slate-200 p-4'>
                        <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
                            <p className='text-sm text-red-600'>
                                {friendsQuery.error.message}
                            </p>
                        </div>
                    </div>
                )}

                <div className='flex-1 overflow-y-auto'>
                    {friendsQuery.isLoading ? (
                        <div className='space-y-3 p-4'>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className='flex animate-pulse items-center gap-3'
                                >
                                    <div className='h-12 w-12 rounded-full bg-slate-200'></div>
                                    <div className='flex-1 space-y-2'>
                                        <div className='h-4 w-32 rounded bg-slate-200'></div>
                                        <div className='h-3 w-24 rounded bg-slate-200'></div>
                                    </div>
                                    <div className='h-6 w-6 rounded bg-slate-200'></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredFriends.length === 0 ? (
                        <div className='p-8 text-center'>
                            <div className='mb-3 text-4xl'>👥</div>
                            <p className='text-slate-500'>
                                {friends.length === 0
                                    ? 'You have no friends to invite yet'
                                    : 'No friends match your search'}
                            </p>
                        </div>
                    ) : (
                        <div className='space-y-1 p-4'>
                            {filteredFriends.map((friend) => {
                                const disabled = isFriendDisabled(friend.id);
                                const statusText = getFriendStatusText(
                                    friend.id
                                );
                                const isSelected = selectedFriends.has(
                                    friend.id
                                );

                                return (
                                    <div
                                        key={friend.id}
                                        onClick={() =>
                                            !disabled &&
                                            toggleFriendSelection(friend.id)
                                        }
                                        className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                                            disabled
                                                ? 'cursor-not-allowed opacity-50'
                                                : 'cursor-pointer hover:bg-slate-50'
                                        } ${
                                            isSelected
                                                ? 'bg-primary-50 ring-primary-200 ring-1'
                                                : ''
                                        }`}
                                    >
                                        {friend.profilePictureUrl ? (
                                            <img
                                                src={friend.profilePictureUrl}
                                                alt={`${friend.name} ${friend.surname}`}
                                                className='h-12 w-12 rounded-full object-cover'
                                            />
                                        ) : (
                                            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 font-medium text-slate-600'>
                                                {friend.name[0]}
                                            </div>
                                        )}

                                        <div className='flex-1'>
                                            <h3 className='font-medium text-slate-900'>
                                                {friend.name} {friend.surname}
                                            </h3>
                                            {statusText && (
                                                <p className='text-sm text-slate-500'>
                                                    {statusText}
                                                </p>
                                            )}
                                        </div>

                                        <div className='flex items-center'>
                                            {isSelected ? (
                                                <div className='bg-primary-500 flex h-6 w-6 items-center justify-center rounded-full text-white'>
                                                    <IconCheck size={16} />
                                                </div>
                                            ) : (
                                                <div
                                                    className={`h-6 w-6 rounded-full border-2 ${
                                                        disabled
                                                            ? 'border-slate-200'
                                                            : 'border-slate-300'
                                                    }`}
                                                ></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className='border-t border-slate-200 p-4'>
                <div className='flex items-center justify-between'>
                    <p className='text-sm text-slate-500'>
                        {selectedFriends.size > 0
                            ? `${selectedFriends.size} friend${selectedFriends.size === 1 ? '' : 's'} selected`
                            : !hasAvailableSpots
                              ? 'Event is at maximum capacity'
                              : 'Select friends to invite'}
                    </p>
                    <div className='flex gap-3'>
                        <button
                            onClick={closeModal}
                            disabled={isInvitingUsers}
                            className='cursor-pointer rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50'
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleInvite}
                            disabled={
                                selectedFriends.size === 0 ||
                                isInvitingUsers ||
                                !hasAvailableSpots
                            }
                            className='bg-primary-500 hover:bg-primary-600 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50'
                        >
                            <IconUserPlus size={16} />
                            {isInvitingUsers
                                ? 'Sending...'
                                : `Invite ${selectedFriends.size > 0 ? `(${selectedFriends.size})` : ''}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
