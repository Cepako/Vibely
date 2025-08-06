import { useState } from 'react';
import {
    IconUsers,
    IconUserPlus,
    IconUserMinus,
    IconUserX,
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

type FriendsTab = 'friends' | 'requests' | 'sent' | 'blocked';

interface FriendsListProps {
    userId?: number;
}

export default function FriendsList({ userId }: FriendsListProps) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<FriendsTab>('friends');

    const targetUserId = userId || user?.id;
    const isOwnProfile = !userId || userId === user?.id;

    const { data: friends, isLoading: friendsLoading } = useFriends(
        targetUserId!
    );
    const { data: friendRequests, isLoading: requestsLoading } =
        useFriendRequests();
    const { data: sentRequests, isLoading: sentLoading } =
        useSentFriendRequests();
    const { data: blockedUsers, isLoading: blockedLoading } = useBlockedUsers();

    if (!targetUserId) {
        return <div>Loading...</div>;
    }

    const tabs = [
        {
            key: 'friends' as FriendsTab,
            label: 'Friends',
            icon: IconUsers,
            count: friends?.length || 0,
            show: true,
        },
        {
            key: 'requests' as FriendsTab,
            label: 'Requests',
            icon: IconUserPlus,
            count: friendRequests?.length || 0,
            show: isOwnProfile,
        },
        {
            key: 'sent' as FriendsTab,
            label: 'Sent',
            icon: IconUserMinus,
            count: sentRequests?.length || 0,
            show: isOwnProfile,
        },
        {
            key: 'blocked' as FriendsTab,
            label: 'Blocked',
            icon: IconUserX,
            count: blockedUsers?.length || 0,
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
                if (!friends?.length) {
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
                        {friends.map((friend) => (
                            <FriendCard
                                key={friend.id}
                                friend={friend}
                                isFriendMe={friend.id === user?.id}
                                isOwnProfile={isOwnProfile}
                            />
                        ))}
                    </div>
                );

            case 'requests':
                if (requestsLoading) return <LoadingState />;
                if (!friendRequests?.length)
                    return <EmptyState message='No friend requests' />;
                return (
                    <div className='space-y-4'>
                        {friendRequests.map((request) => (
                            <FriendRequestCard
                                key={request.id}
                                request={request}
                            />
                        ))}
                    </div>
                );

            case 'sent':
                if (sentLoading) return <LoadingState />;
                if (!sentRequests?.length)
                    return <EmptyState message='No sent requests' />;
                return (
                    <div className='space-y-4'>
                        {sentRequests.map((request) => (
                            <SentRequestCard
                                key={request.id}
                                request={request}
                            />
                        ))}
                    </div>
                );

            case 'blocked':
                if (blockedLoading) return <LoadingState />;
                if (!blockedUsers?.length)
                    return <EmptyState message='No blocked users' />;
                return (
                    <div className='space-y-4'>
                        {blockedUsers.map((blockedUser) => (
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
            <div className='mb-6 flex border-b border-slate-200'>
                {tabs
                    .filter((tab) => tab.show)
                    .map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    'flex cursor-pointer items-center space-x-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                                    activeTab === tab.key
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                )}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                                {tab.count > 0 && (
                                    <span
                                        className={cn(
                                            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                                            activeTab === tab.key
                                                ? 'bg-primary-100 text-primary-600'
                                                : 'bg-slate-100 text-slate-600'
                                        )}
                                    >
                                        {tab.count}
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
