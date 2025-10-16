import { useMemo, useState } from 'react';
import {
    IconUsers,
    IconUserPlus,
    IconUserMinus,
    IconUserX,
    IconSearch,
    IconX,
} from '@tabler/icons-react';
import {
    useFriends,
    useFriendRequests,
    useSentFriendRequests,
    useBlockedUsers,
} from './hooks/useFriendship';
import { useAuth } from '../auth/AuthProvider';
import { cn } from '../../utils/utils';
import FriendCard from './FriendCard';
import FriendRequestCard from './FriendRequestCard';
import SentRequestCard from './SentRequestCard';
import BlockedUserCard from './BlockedUserCard';
import { useConversations } from '../messages/hooks/useConversations';

type FriendsTab = 'friends' | 'requests' | 'sent' | 'blocked';

interface FriendsListProps {
    userId?: number;
}

export default function FriendsList({ userId }: FriendsListProps) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<FriendsTab>('friends');
    const [searchQuery, setSearchQuery] = useState('');

    const targetUserId = userId || user?.id;
    const isOwnProfile = !userId || userId === user?.id;

    const { data: friends, isLoading: friendsLoading } = useFriends(
        targetUserId!
    );

    const viewerIdForQuery = user?.id;
    const { data: myFriends } = useFriends(viewerIdForQuery ?? -1);

    const myFriendIds = new Set(myFriends?.map((f) => f.id) || []);

    const { data: friendRequests, isLoading: requestsLoading } =
        useFriendRequests();
    const { data: sentRequests, isLoading: sentLoading } =
        useSentFriendRequests();
    const { data: blockedUsers, isLoading: blockedLoading } = useBlockedUsers();

    const { conversations, isLoading: areConversationsLoading } =
        useConversations();
    const directConversations = conversations
        ? conversations.filter((c) => c.type === 'direct')
        : [];

    function compareSearch(name: string, surname: string, query: string) {
        return (
            `${name} ${surname}`.toLowerCase().includes(query) ||
            name.toLowerCase().includes(query) ||
            surname.toLowerCase().includes(query)
        );
    }

    const filteredFriends = useMemo(() => {
        if (!friends || !searchQuery.trim()) return friends;

        const query = searchQuery.toLowerCase().trim();
        return friends.filter((friend) =>
            compareSearch(friend.name, friend.surname, query)
        );
    }, [friends, searchQuery]);

    const filteredFriendRequests = useMemo(() => {
        if (!friendRequests || !searchQuery.trim()) return friendRequests;

        const query = searchQuery.toLowerCase().trim();
        return friendRequests.filter((request) =>
            compareSearch(
                request.user_userId.name,
                request.user_userId.surname,
                query
            )
        );
    }, [friendRequests, searchQuery]);

    const filteredSentRequests = useMemo(() => {
        if (!sentRequests || !searchQuery.trim()) return sentRequests;

        const query = searchQuery.toLowerCase().trim();
        return sentRequests.filter((request) =>
            compareSearch(
                request.user_friendId.name,
                request.user_friendId.surname,
                query
            )
        );
    }, [sentRequests, searchQuery]);

    const filteredBlockedUsers = useMemo(() => {
        if (!blockedUsers || !searchQuery.trim()) return blockedUsers;

        const query = searchQuery.toLowerCase().trim();
        return blockedUsers.filter((blockedUser) =>
            compareSearch(
                blockedUser.user_friendId.name,
                blockedUser.user_friendId.surname,
                query
            )
        );
    }, [blockedUsers, searchQuery]);

    if (!targetUserId || areConversationsLoading) {
        return <div>Loading...</div>;
    }

    const tabs = [
        {
            key: 'friends' as FriendsTab,
            label: 'Friends',
            icon: IconUsers,
            count: friends?.length || 0,
            filteredCount: filteredFriends?.length || 0,
            show: true,
        },
        {
            key: 'requests' as FriendsTab,
            label: 'Requests',
            icon: IconUserPlus,
            count: friendRequests?.length || 0,
            filteredCount: filteredFriendRequests?.length || 0,
            show: isOwnProfile,
        },
        {
            key: 'sent' as FriendsTab,
            label: 'Sent',
            icon: IconUserMinus,
            count: sentRequests?.length || 0,
            filteredCount: filteredSentRequests?.length || 0,
            show: isOwnProfile,
        },
        {
            key: 'blocked' as FriendsTab,
            label: 'Blocked',
            icon: IconUserX,
            count: blockedUsers?.length || 0,
            filteredCount: filteredBlockedUsers?.length || 0,
            show: isOwnProfile,
        },
    ];

    if (!isOwnProfile && activeTab !== 'friends') {
        setActiveTab('friends');
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'friends':
                if (friendsLoading) return <LoadingState />;
                if (!filteredFriends?.length) {
                    return (
                        <EmptyState
                            message={
                                isOwnProfile
                                    ? 'No friends yet'
                                    : 'This user has no friends to show'
                            }
                        />
                    );
                }
                return (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {filteredFriends.map((friend) => {
                            const isMe = friend.id === user?.id;
                            const isFriend =
                                isOwnProfile || myFriendIds.has(friend.id);

                            const conversationId = directConversations.find(
                                (c) =>
                                    c.participants.some(
                                        (p) => p.userId === friend.id
                                    )
                            )?.id;

                            return (
                                <FriendCard
                                    key={friend.id}
                                    friend={friend}
                                    isMe={isMe}
                                    isFriend={isFriend}
                                    conversationId={conversationId}
                                />
                            );
                        })}
                    </div>
                );

            case 'requests':
                if (requestsLoading) return <LoadingState />;
                if (!filteredFriendRequests?.length)
                    return <EmptyState message='No friend requests' />;
                return (
                    <div className='space-y-4'>
                        {filteredFriendRequests.map((request) => (
                            <FriendRequestCard
                                key={request.id}
                                request={request}
                            />
                        ))}
                    </div>
                );

            case 'sent':
                if (sentLoading) return <LoadingState />;
                if (!filteredSentRequests?.length)
                    return <EmptyState message='No sent requests' />;
                return (
                    <div className='space-y-4'>
                        {filteredSentRequests.map((request) => (
                            <SentRequestCard
                                key={request.id}
                                request={request}
                            />
                        ))}
                    </div>
                );

            case 'blocked':
                if (blockedLoading) return <LoadingState />;
                if (!filteredBlockedUsers?.length)
                    return <EmptyState message='No blocked users' />;
                return (
                    <div className='space-y-4'>
                        {filteredBlockedUsers.map((blockedUser) => (
                            <BlockedUserCard
                                key={blockedUser.user_friendId.id}
                                user={blockedUser}
                            />
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className='w-full'>
            <div className='mb-4 px-6'>
                <div className='relative'>
                    <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                        <IconSearch size={18} className='text-slate-400' />
                    </div>
                    <input
                        type='text'
                        placeholder={`Search ${tabs.find((t) => t.key === activeTab)?.label.toLowerCase() || 'friends'}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-slate-300 py-2 pr-10 pl-10 text-sm outline-none'
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className='absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 transition-colors'
                        >
                            <IconX
                                size={18}
                                className='text-slate-400 hover:text-rose-500'
                            />
                        </button>
                    )}
                </div>

                {searchQuery && (
                    <div className='mt-2 text-sm text-slate-600'>
                        {(() => {
                            const activeTabData = tabs.find(
                                (t) => t.key === activeTab
                            );
                            const filteredCount =
                                activeTabData?.filteredCount || 0;
                            const totalCount = activeTabData?.count || 0;

                            if (filteredCount === 0 && totalCount > 0) {
                                return `No results found for "${searchQuery}"`;
                            } else if (filteredCount > 0) {
                                return `Showing ${filteredCount} of ${totalCount} ${activeTab}`;
                            }
                            return '';
                        })()}
                    </div>
                )}
            </div>

            <div className='mb-6 flex border-b border-slate-200'>
                {tabs
                    .filter((tab) => tab.show)
                    .map((tab) => {
                        const Icon = tab.icon;
                        const displayCount = searchQuery
                            ? tab.filteredCount
                            : tab.count;

                        return (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setSearchQuery('');
                                }}
                                className={cn(
                                    'flex cursor-pointer items-center space-x-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                                    activeTab === tab.key
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                )}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                                {displayCount > 0 && (
                                    <span
                                        className={cn(
                                            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                                            activeTab === tab.key
                                                ? 'bg-primary-100 text-primary-600'
                                                : 'bg-slate-100 text-slate-600'
                                        )}
                                    >
                                        {displayCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
            </div>

            <div className='px-6'>{renderContent()}</div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className='flex items-center justify-center py-12'>
            <div className='border-primary-500 h-8 w-8 animate-spin rounded-full border-b-2'></div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className='py-12 text-center'>
            <div className='mb-2 text-slate-400'>
                <IconUsers size={48} className='mx-auto' />
            </div>
            <p className='text-slate-500'>{message}</p>
        </div>
    );
}
