import { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import {
    usePotentialFriends,
    useSearchPeople,
    type ExploreFilters,
} from './hooks/useExplore';
import UserCard from './UserCard';

interface FriendsTabProps {
    filters: ExploreFilters;
    onFiltersChange: (filters: ExploreFilters) => void;
}

export default function FriendsTab({
    filters,
    onFiltersChange,
}: FriendsTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const isSearching = searchQuery.trim().length >= 2;

    const { data: potentialFriends, isLoading: loadingFriends } =
        usePotentialFriends(20, filters);
    const { data: searchResults, isLoading: loadingSearch } = useSearchPeople(
        searchQuery,
        isSearching
            ? { location: filters.location, gender: filters.gender }
            : undefined
    );

    const isLoading = isSearching ? loadingSearch : loadingFriends;
    const results = isSearching ? searchResults?.data : potentialFriends?.data;

    return (
        <div className='mx-auto max-w-4xl'>
            <div className='relative mb-6'>
                <IconSearch
                    size={20}
                    className='absolute top-1/2 left-3 -translate-y-1/2 transform text-slate-400'
                />
                <input
                    type='text'
                    placeholder='Search for people...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='focus:ring-primary-500 w-full rounded-lg border border-slate-300 py-3 pr-4 pl-10 outline-none focus:ring-1'
                />
            </div>

            <div>
                <h2 className='mb-4 text-xl font-semibold text-slate-900'>
                    {isSearching
                        ? `Search Results for "${searchQuery}"`
                        : 'People You May Know'}
                </h2>

                {isLoading ? (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className='animate-pulse rounded-lg bg-white p-4 shadow-sm'
                            >
                                <div className='flex gap-3'>
                                    <div className='h-12 w-12 rounded-full bg-slate-200'></div>
                                    <div className='flex-1'>
                                        <div className='mb-2 h-4 w-3/4 rounded bg-slate-200'></div>
                                        <div className='mb-2 h-3 w-1/2 rounded bg-slate-200'></div>
                                        <div className='h-3 w-2/3 rounded bg-slate-200'></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : results?.length === 0 ? (
                    <div className='py-12 text-center'>
                        <p className='text-slate-500'>
                            {isSearching
                                ? `No people found for "${searchQuery}"`
                                : 'No potential friends found'}
                        </p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {results?.map((user) => (
                            <UserCard key={user.id} user={user} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
