import { useState } from 'react';
import { IconSearch, IconCheck, IconUser, IconX } from '@tabler/icons-react';
import { useFriends } from '../profile/hooks/useFriendship';
import { useCurrentUser } from '../hooks/useCurrentUser';
import UserAvatar from '../ui/UserAvatar';

interface FriendSelectionProps {
    selectedFriends: number[];
    onSelectionChange: (friendIds: number[]) => void;
    maxSelections?: number;
    className?: string;
}

export default function FriendSelection({
    selectedFriends,
    onSelectionChange,
    maxSelections,
    className = '',
}: FriendSelectionProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const currentUser = useCurrentUser();

    const friendsQuery = useFriends(currentUser.data?.id ?? 0);
    const friends = friendsQuery.data ?? [];

    const filteredFriends = friends.filter((friend) =>
        `${friend.name} ${friend.surname}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    const toggleFriendSelection = (friendId: number) => {
        const newSelection = selectedFriends.includes(friendId)
            ? selectedFriends.filter((id) => id !== friendId)
            : maxSelections && selectedFriends.length >= maxSelections
              ? selectedFriends
              : [...selectedFriends, friendId];

        onSelectionChange(newSelection);
    };

    const selectAll = () => {
        const allFilteredIds = filteredFriends.map((f) => f.id);
        const newSelection = maxSelections
            ? allFilteredIds.slice(0, maxSelections)
            : allFilteredIds;
        onSelectionChange(newSelection);
    };

    const clearAll = () => {
        onSelectionChange([]);
    };

    if (friendsQuery.isLoading) {
        return (
            <div className={`space-y-3 ${className}`}>
                <div className='flex items-center justify-between'>
                    <label className='block text-sm font-medium text-slate-700'>
                        Invite Friends
                    </label>
                    <div className='h-4 w-16 animate-pulse rounded bg-slate-200'></div>
                </div>
                <div className='space-y-2'>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className='flex animate-pulse items-center gap-3'
                        >
                            <div className='h-8 w-8 rounded-full bg-slate-200'></div>
                            <div className='h-4 w-32 rounded bg-slate-200'></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (friendsQuery.error) {
        return (
            <div className={className}>
                <label className='mb-2 block text-sm font-medium text-slate-700'>
                    Invite Friends
                </label>
                <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
                    <p className='text-sm text-red-600'>
                        Failed to load friends
                    </p>
                </div>
            </div>
        );
    }

    if (friends.length === 0) {
        return (
            <div className={className}>
                <label className='mb-2 block text-sm font-medium text-slate-700'>
                    Invite Friends
                </label>
                <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 text-center'>
                    <IconUser
                        size={24}
                        className='mx-auto mb-2 text-slate-400'
                    />
                    <p className='text-sm text-slate-500'>
                        No friends to invite yet
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className='mb-3 flex items-center justify-between'>
                <label className='block text-sm font-medium text-slate-700'>
                    Invite Friends
                    {selectedFriends.length > 0 && (
                        <span className='text-primary-600 ml-2'>
                            ({selectedFriends.length} selected)
                        </span>
                    )}
                </label>
                <button
                    type='button'
                    onClick={() => setIsExpanded(!isExpanded)}
                    className='text-primary-600 hover:text-primary-700 cursor-pointer text-sm font-medium'
                >
                    {isExpanded ? 'Collapse' : 'Expand'}
                </button>
            </div>

            {!isExpanded && selectedFriends.length > 0 && (
                <div className='mb-3'>
                    <div className='flex flex-wrap gap-2'>
                        {selectedFriends.slice(0, 6).map((friendId) => {
                            const friend = friends.find(
                                (f) => f.id === friendId
                            );
                            if (!friend) return null;

                            return (
                                <div
                                    key={friend.id}
                                    className='bg-primary-100 flex items-center gap-2 rounded-full px-3 py-1 text-sm'
                                >
                                    <UserAvatar
                                        user={friend as any}
                                        size='sm'
                                    />
                                    <span className='text-primary-700 font-medium'>
                                        {friend.name}
                                    </span>
                                    <button
                                        type='button'
                                        onClick={() =>
                                            toggleFriendSelection(friend.id)
                                        }
                                        className='text-primary-600 hover:text-primary-800 ml-1 cursor-pointer'
                                    >
                                        <IconX size={15} />
                                    </button>
                                </div>
                            );
                        })}
                        {selectedFriends.length > 6 && (
                            <div className='flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600'>
                                +{selectedFriends.length - 6} more
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isExpanded && (
                <div className='space-y-3'>
                    <div className='flex gap-2'>
                        <div className='relative flex-1'>
                            <IconSearch
                                size={16}
                                className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-400'
                            />
                            <input
                                type='text'
                                placeholder='Search friends...'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='focus:border-primary-500 focus:ring-primary-500 focus:ring-0.5 w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm outline-none'
                            />
                        </div>
                        <button
                            type='button'
                            onClick={selectAll}
                            disabled={filteredFriends.length === 0}
                            className='cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50'
                        >
                            Select All
                        </button>
                        <button
                            type='button'
                            onClick={clearAll}
                            disabled={selectedFriends.length === 0}
                            className='cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50'
                        >
                            Clear
                        </button>
                    </div>

                    {maxSelections &&
                    selectedFriends.length >= maxSelections ? (
                        <div className='rounded-lg border border-amber-200 bg-amber-50 p-2'>
                            <p className='text-sm text-amber-600'>
                                Maximum {maxSelections} friends can be selected
                            </p>
                        </div>
                    ) : null}

                    <div className='max-h-60 overflow-y-auto rounded-lg border border-slate-200'>
                        {filteredFriends.length === 0 ? (
                            <div className='p-4 text-center text-sm text-slate-500'>
                                {searchQuery
                                    ? 'No friends match your search'
                                    : 'No friends available'}
                            </div>
                        ) : (
                            <div className='divide-y divide-slate-200'>
                                {filteredFriends.map((friend) => {
                                    const isSelected = selectedFriends.includes(
                                        friend.id
                                    );
                                    const isDisabled =
                                        !isSelected &&
                                        maxSelections &&
                                        selectedFriends.length >= maxSelections;

                                    return (
                                        <div
                                            key={friend.id}
                                            onClick={() =>
                                                !isDisabled &&
                                                toggleFriendSelection(friend.id)
                                            }
                                            className={`flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-slate-50 ${
                                                isSelected
                                                    ? 'bg-primary-50'
                                                    : ''
                                            } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                                        >
                                            <UserAvatar
                                                user={friend as any}
                                                size='sm'
                                            />

                                            <div className='min-w-0 flex-1'>
                                                <p className='truncate font-medium text-slate-900'>
                                                    {friend.name}{' '}
                                                    {friend.surname}
                                                </p>
                                            </div>

                                            <div className='flex items-center'>
                                                {isSelected ? (
                                                    <div className='bg-primary-500 flex h-5 w-5 items-center justify-center rounded-full text-white'>
                                                        <IconCheck size={12} />
                                                    </div>
                                                ) : (
                                                    <div className='h-5 w-5 rounded-full border-2 border-slate-300'></div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <p className='mt-2 text-xs text-slate-500'>
                Selected friends will receive invitations when the event is
                created
                {maxSelections && ` (max ${maxSelections})`}
            </p>
        </div>
    );
}
