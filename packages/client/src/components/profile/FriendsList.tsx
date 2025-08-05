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

    // Only fetch data for own profile features, and ensure targetUserId is defined
    const { data: friends, isLoading: friendsLoading } = useFriends(
        targetUserId!
    );
    const { data: friendRequests, isLoading: requestsLoading } =
        useFriendRequests();
    const { data: sentRequests, isLoading: sentLoading } =
        useSentFriendRequests();
    const { data: blockedUsers, isLoading: blockedLoading } = useBlockedUsers();

    // Don't render if we don't have a valid user ID
    if (!targetUserId) {
        return <div>Loading...</div>;
    }

    const tabs = [
        {
            key: 'friends' as FriendsTab,
            label: 'Friends',
            icon: IconUsers,
            count: friends?.length || 0,
            show: true, // Always show friends tab
        },
        {
            key: 'requests' as FriendsTab,
            label: 'Requests',
            icon: IconUserPlus,
            count: friendRequests?.length || 0,
            show: isOwnProfile, // Only show for own profile
        },
        {
            key: 'sent' as FriendsTab,
            label: 'Sent',
            icon: IconUserMinus,
            count: sentRequests?.length || 0,
            show: isOwnProfile, // Only show for own profile
        },
        {
            key: 'blocked' as FriendsTab,
            label: 'Blocked',
            icon: IconUserX,
            count: blockedUsers?.length || 0,
            show: isOwnProfile, // Only show for own profile
        },
    ];

    // Reset to friends tab if viewing someone else's profile
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
            {/* Tabs */}
            <div className='mb-6 flex border-b border-gray-200'>
                {tabs
                    .filter((tab) => tab.show)
                    .map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    'flex items-center space-x-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                                    activeTab === tab.key
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                )}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                                {tab.count > 0 && (
                                    <span
                                        className={cn(
                                            'rounded-full px-2 py-1 text-xs font-semibold',
                                            activeTab === tab.key
                                                ? 'bg-primary-100 text-primary-600'
                                                : 'bg-gray-100 text-gray-600'
                                        )}
                                    >
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
            </div>

            {/* Content */}
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
            <div className='mb-2 text-gray-400'>
                <IconUsers size={48} className='mx-auto' />
            </div>
            <p className='text-gray-500'>{message}</p>
        </div>
    );
}
