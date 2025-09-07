import { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { useRecommendedEvents, type EventFilters } from './hooks/useExplore';
import EventCard from './EventCard';

interface EventsTabProps {
    filters: EventFilters;
    onFiltersChange: (filters: EventFilters) => void;
}

export default function EventsTab({
    filters,
    onFiltersChange,
}: EventsTabProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const currentFilters = searchQuery.trim()
        ? { ...filters, location: searchQuery.trim() }
        : filters;

    const { data: recommendedEvents, isLoading: loadingEvents } =
        useRecommendedEvents(20, currentFilters);

    return (
        <div className='mx-auto max-w-4xl'>
            <div className='relative mb-3'>
                <IconSearch
                    size={20}
                    className='absolute top-1/2 left-3 -translate-y-1/2 transform text-slate-400'
                />
                <input
                    type='text'
                    placeholder='Search events by location...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='focus:ring-primary-500 w-full rounded-lg border border-slate-300 py-3 pr-4 pl-10 outline-none focus:ring-1'
                />
            </div>

            <div>
                <h2 className='mb-4 text-xl font-semibold text-slate-900'>
                    {searchQuery.trim()
                        ? `Events in "${searchQuery}"`
                        : 'Recommended Events'}
                </h2>

                {loadingEvents ? (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className='animate-pulse rounded-lg bg-white p-4 shadow-sm'
                            >
                                <div className='flex gap-3'>
                                    <div className='h-12 w-12 rounded-lg bg-slate-200'></div>
                                    <div className='flex-1'>
                                        <div className='mb-2 h-4 w-3/4 rounded bg-slate-200'></div>
                                        <div className='mb-2 h-3 w-full rounded bg-slate-200'></div>
                                        <div className='h-3 w-1/2 rounded bg-slate-200'></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : recommendedEvents?.data?.length === 0 ? (
                    <div className='py-12 text-center'>
                        <p className='text-slate-500'>
                            {searchQuery.trim()
                                ? `No events found for "${searchQuery}"`
                                : 'No recommended events found'}
                        </p>
                    </div>
                ) : (
                    <div className='grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2'>
                        {recommendedEvents?.data?.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
