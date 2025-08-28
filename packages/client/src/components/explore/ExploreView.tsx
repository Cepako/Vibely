import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
    usePotentialFriends,
    useRecommendedEvents,
    useTrendingContent,
    useSearchPeople,
    useInterestBasedRecommendations,
    type PotentialFriend,
    type EventWithDetails,
    type TrendingPost,
    type ExploreFilters,
    type EventFilters,
} from './hooks/useExplore';
import {
    IconSearch,
    IconHeart,
    IconMessageCircle,
    IconUserPlus,
    IconCalendarEvent,
    IconMapPin,
    IconUsers,
    IconStar,
    IconFilter,
} from '@tabler/icons-react';

export default function ExploreView() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<
        'discover' | 'trending' | 'search' | 'interests'
    >('discover');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [friendFilters, setFriendFilters] = useState<ExploreFilters>({});
    const [eventFilters, setEventFilters] = useState<EventFilters>({});

    // Queries
    const { data: potentialFriends, isLoading: loadingFriends } =
        usePotentialFriends(20, friendFilters);
    const { data: recommendedEvents, isLoading: loadingEvents } =
        useRecommendedEvents(20, eventFilters);
    const { data: trendingContent, isLoading: loadingTrending } =
        useTrendingContent(10);
    const { data: searchResults, isLoading: loadingSearch } = useSearchPeople(
        searchQuery,
        activeTab === 'search' && searchQuery.length >= 2
            ? friendFilters
            : undefined
    );
    const { data: interestBased, isLoading: loadingInterests } =
        useInterestBasedRecommendations(10);

    const handleUserClick = (userId: number) => {
        navigate({
            to: '/profile/$profileId',
            params: { profileId: userId.toString() },
        });
    };

    const handleEventClick = (eventId: number) => {
        navigate({
            to: '/events/$eventId',
            params: { eventId: eventId.toString() },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderUserCard = (user: PotentialFriend, showMatchScore = true) => (
        <div
            key={user.id}
            className='cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md'
            onClick={() => handleUserClick(user.id)}
        >
            <div className='flex items-start gap-3'>
                <div className='h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-slate-200'>
                    {user.profilePictureUrl ? (
                        <img
                            src={user.profilePictureUrl}
                            alt={`${user.name} ${user.surname}`}
                            className='h-full w-full object-cover'
                        />
                    ) : (
                        <div className='flex h-full w-full items-center justify-center text-slate-500'>
                            <IconUsers size={24} />
                        </div>
                    )}
                </div>
                <div className='flex-1'>
                    <h3 className='font-semibold text-gray-900'>
                        {user.name} {user.surname}
                    </h3>
                    {user.city && (
                        <p className='flex items-center gap-1 text-sm text-gray-500'>
                            <IconMapPin size={14} />
                            {user.city}
                            {user.region && `, ${user.region}`}
                        </p>
                    )}
                    {user.bio && (
                        <p className='mt-1 line-clamp-2 text-sm text-gray-600'>
                            {user.bio}
                        </p>
                    )}
                    <div className='mt-2 flex items-center gap-4 text-sm text-gray-500'>
                        {user.mutualFriendsCount > 0 && (
                            <span className='flex items-center gap-1'>
                                <IconUsers size={14} />
                                {user.mutualFriendsCount} mutual friends
                            </span>
                        )}
                        {user.mutualInterestsCount > 0 && (
                            <span className='flex items-center gap-1'>
                                <IconStar size={14} />
                                {user.mutualInterestsCount} common interests
                            </span>
                        )}
                        {showMatchScore && (
                            <span className='text-primary-600 font-medium'>
                                Match: {user.matchScore}%
                            </span>
                        )}
                    </div>
                    {user.commonInterests.length > 0 && (
                        <div className='mt-2 flex flex-wrap gap-1'>
                            {user.commonInterests
                                .slice(0, 3)
                                .map((interest) => (
                                    <span
                                        key={interest.id}
                                        className='bg-primary-100 text-primary-700 rounded-full px-2 py-1 text-xs'
                                    >
                                        {interest.name}
                                    </span>
                                ))}
                        </div>
                    )}
                </div>
                <button className='hover:bg-primary-50 rounded-full p-2 transition-colors'>
                    <IconUserPlus size={20} className='text-primary-600' />
                </button>
            </div>
        </div>
    );

    const renderEventCard = (event: EventWithDetails) => (
        <div
            key={event.id}
            className='cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md'
            onClick={() => handleEventClick(event.id)}
        >
            <div className='flex items-start gap-3'>
                <div className='bg-primary-100 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg'>
                    <IconCalendarEvent size={24} className='text-primary-600' />
                </div>
                <div className='flex-1'>
                    <h3 className='line-clamp-1 font-semibold text-gray-900'>
                        {event.title}
                    </h3>
                    <p className='mt-1 line-clamp-2 text-sm text-gray-600'>
                        {event.description}
                    </p>
                    <div className='mt-2 flex items-center gap-4 text-sm text-gray-500'>
                        <span className='flex items-center gap-1'>
                            <IconMapPin size={14} />
                            {event.location}
                        </span>
                        <span>{formatDate(event.startTime)}</span>
                        {event.participantCount > 0 && (
                            <span className='flex items-center gap-1'>
                                <IconUsers size={14} />
                                {event.participantCount} attending
                            </span>
                        )}
                    </div>
                    <div className='mt-3 flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <div className='h-6 w-6 overflow-hidden rounded-full bg-slate-200'>
                                {event.user.profilePictureUrl ? (
                                    <img
                                        src={event.user.profilePictureUrl}
                                        alt={`${event.user.name} ${event.user.surname}`}
                                        className='h-full w-full object-cover'
                                    />
                                ) : (
                                    <div className='h-full w-full bg-slate-300'></div>
                                )}
                            </div>
                            <span className='text-sm text-gray-600'>
                                by {event.user.name} {event.user.surname}
                            </span>
                        </div>
                        <span className='rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700'>
                            {event.eventCategory.name}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPostCard = (post: TrendingPost) => (
        <div key={post.id} className='rounded-lg border bg-white p-4 shadow-sm'>
            <div className='flex items-start gap-3'>
                <div className='h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-slate-200'>
                    {post.user.profilePictureUrl ? (
                        <img
                            src={post.user.profilePictureUrl}
                            alt={`${post.user.name} ${post.user.surname}`}
                            className='h-full w-full object-cover'
                        />
                    ) : (
                        <div className='h-full w-full bg-slate-300'></div>
                    )}
                </div>
                <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                        <h4 className='font-medium text-gray-900'>
                            {post.user.name} {post.user.surname}
                        </h4>
                        <span className='text-sm text-gray-500'>
                            {formatDate(post.createdAt)}
                        </span>
                    </div>
                    <p className='mt-2 text-gray-700'>{post.content}</p>
                    {post.contentUrl && (
                        <div className='mt-3 overflow-hidden rounded-lg'>
                            <img
                                src={post.contentUrl}
                                alt='Post content'
                                className='h-48 w-full object-cover'
                            />
                        </div>
                    )}
                    <div className='mt-3 flex items-center gap-4 text-sm'>
                        <button className='flex items-center gap-1 text-gray-500 hover:text-red-500'>
                            <IconHeart
                                size={16}
                                className={
                                    post.isLiked
                                        ? 'fill-red-500 text-red-500'
                                        : ''
                                }
                            />
                            {post.likeCount}
                        </button>
                        <button className='flex items-center gap-1 text-gray-500 hover:text-blue-500'>
                            <IconMessageCircle size={16} />
                            {post.commentCount}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className='h-full w-full flex-1 overflow-hidden'>
            {/* Header */}
            <div className='border-b border-slate-200 bg-white p-4'>
                <div className='flex items-center justify-between'>
                    <h1 className='text-2xl font-bold text-gray-900'>
                        Explore
                    </h1>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className='bg-primary-100 text-primary-700 hover:bg-primary-200 flex items-center gap-2 rounded-lg px-3 py-2 transition-colors'
                    >
                        <IconFilter size={20} />
                        Filters
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className='mt-4 flex gap-6'>
                    {[
                        { key: 'discover', label: 'Discover' },
                        { key: 'trending', label: 'Trending' },
                        { key: 'search', label: 'Search' },
                        { key: 'interests', label: 'For You' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() =>
                                setActiveTab(tab.key as typeof activeTab)
                            }
                            className={`border-b-2 pb-2 font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search Bar for Search Tab */}
                {activeTab === 'search' && (
                    <div className='relative mt-4'>
                        <IconSearch
                            size={20}
                            className='absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400'
                        />
                        <input
                            type='text'
                            placeholder='Search for people...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='focus:ring-primary-500 w-full rounded-lg border border-slate-300 py-3 pr-4 pl-10 focus:border-transparent focus:ring-2'
                        />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className='h-full w-full flex-1 overflow-hidden p-4'>
                {activeTab === 'discover' && (
                    <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                        {/* Potential Friends */}
                        <div className='h-full w-full overflow-y-auto'>
                            <h2 className='mb-4 text-xl font-semibold text-gray-900'>
                                People You May Know
                            </h2>
                            {loadingFriends ? (
                                <div className='space-y-4'>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className='animate-pulse rounded-lg bg-white p-4 shadow-sm'
                                        >
                                            <div className='flex gap-3'>
                                                <div className='h-12 w-12 rounded-full bg-gray-200'></div>
                                                <div className='flex-1'>
                                                    <div className='mb-2 h-4 w-3/4 rounded bg-gray-200'></div>
                                                    <div className='mb-2 h-3 w-1/2 rounded bg-gray-200'></div>
                                                    <div className='h-3 w-2/3 rounded bg-gray-200'></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='h-full w-full space-y-4 overflow-y-auto'>
                                    {potentialFriends?.data
                                        ?.slice(0, 8)
                                        .map(renderUserCard)}
                                </div>
                            )}
                        </div>

                        {/* Recommended Events */}
                        <div>
                            <h2 className='mb-4 text-xl font-semibold text-gray-900'>
                                Recommended Events
                            </h2>
                            {loadingEvents ? (
                                <div className='space-y-4'>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className='animate-pulse rounded-lg bg-white p-4 shadow-sm'
                                        >
                                            <div className='flex gap-3'>
                                                <div className='h-12 w-12 rounded-lg bg-gray-200'></div>
                                                <div className='flex-1'>
                                                    <div className='mb-2 h-4 w-3/4 rounded bg-gray-200'></div>
                                                    <div className='mb-2 h-3 w-full rounded bg-gray-200'></div>
                                                    <div className='h-3 w-1/2 rounded bg-gray-200'></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='h-full w-full space-y-4 overflow-y-auto'>
                                    {recommendedEvents?.data
                                        ?.slice(0, 8)
                                        .map(renderEventCard)}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'trending' && (
                    <div className='mx-auto max-w-2xl'>
                        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
                            Trending Now
                        </h2>
                        {loadingTrending ? (
                            <div className='space-y-4'>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className='animate-pulse rounded-lg bg-white p-4 shadow-sm'
                                    >
                                        <div className='flex gap-3'>
                                            <div className='h-10 w-10 rounded-full bg-gray-200'></div>
                                            <div className='flex-1'>
                                                <div className='mb-2 h-4 w-1/4 rounded bg-gray-200'></div>
                                                <div className='mb-2 h-3 w-full rounded bg-gray-200'></div>
                                                <div className='mb-2 h-32 rounded bg-gray-200'></div>
                                                <div className='h-3 w-1/3 rounded bg-gray-200'></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {trendingContent?.data?.posts.map(
                                    renderPostCard
                                )}
                                {trendingContent?.data?.events.map(
                                    renderEventCard
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'search' && (
                    <div className='mx-auto max-w-2xl'>
                        {searchQuery.length < 2 ? (
                            <div className='py-12 text-center'>
                                <IconSearch
                                    size={48}
                                    className='mx-auto mb-4 text-gray-400'
                                />
                                <h3 className='mb-2 text-lg font-medium text-gray-900'>
                                    Search for People
                                </h3>
                                <p className='text-gray-500'>
                                    Enter at least 2 characters to start
                                    searching
                                </p>
                            </div>
                        ) : loadingSearch ? (
                            <div className='space-y-4'>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className='animate-pulse rounded-lg bg-white p-4 shadow-sm'
                                    >
                                        <div className='flex gap-3'>
                                            <div className='h-12 w-12 rounded-full bg-gray-200'></div>
                                            <div className='flex-1'>
                                                <div className='mb-2 h-4 w-3/4 rounded bg-gray-200'></div>
                                                <div className='mb-2 h-3 w-1/2 rounded bg-gray-200'></div>
                                                <div className='h-3 w-2/3 rounded bg-gray-200'></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : searchResults?.data?.length === 0 ? (
                            <div className='py-12 text-center'>
                                <p className='text-gray-500'>
                                    No people found for "{searchQuery}"
                                </p>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                <h3 className='text-lg font-semibold'>
                                    Search Results for "{searchQuery}"
                                </h3>
                                {searchResults?.data?.map(
                                    (user: PotentialFriend) =>
                                        renderUserCard(user, false)
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'interests' && (
                    <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                        <div>
                            <h2 className='mb-4 text-xl font-semibold text-gray-900'>
                                Based on Your Interests
                            </h2>
                            {loadingInterests ? (
                                <div className='space-y-4'>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className='animate-pulse rounded-lg bg-white p-4 shadow-sm'
                                        >
                                            <div className='flex gap-3'>
                                                <div className='h-12 w-12 rounded-full bg-gray-200'></div>
                                                <div className='flex-1'>
                                                    <div className='mb-2 h-4 w-3/4 rounded bg-gray-200'></div>
                                                    <div className='h-3 w-1/2 rounded bg-gray-200'></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='space-y-4'>
                                    {interestBased?.data?.friends.map(
                                        renderUserCard
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className='mb-4 text-xl font-semibold text-gray-900'>
                                Events for You
                            </h2>
                            {loadingInterests ? (
                                <div className='space-y-4'>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className='animate-pulse rounded-lg bg-white p-4 shadow-sm'
                                        >
                                            <div className='flex gap-3'>
                                                <div className='h-12 w-12 rounded-lg bg-gray-200'></div>
                                                <div className='flex-1'>
                                                    <div className='mb-2 h-4 w-3/4 rounded bg-gray-200'></div>
                                                    <div className='h-3 w-full rounded bg-gray-200'></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='space-y-4'>
                                    {interestBased?.data?.events.map(
                                        renderEventCard
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
