import { IconCalendarEvent } from '@tabler/icons-react';
import EventCard from './EventCard';
import type { Event } from '../../types/events';

interface EventsListProps {
    events: Event[];
    isLoading: boolean;
}

export default function EventsList({ events, isLoading }: EventsListProps) {
    if (isLoading) {
        return (
            <div className='flex-1 overflow-y-auto p-6'>
                <div className='grid gap-6'>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className='animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-sm'
                        >
                            <div className='mb-4 flex items-center gap-3'>
                                <div className='h-12 w-12 rounded-full bg-gray-200'></div>
                                <div className='space-y-2'>
                                    <div className='h-4 w-32 rounded bg-gray-200'></div>
                                    <div className='h-3 w-24 rounded bg-gray-200'></div>
                                </div>
                            </div>
                            <div className='space-y-3'>
                                <div className='h-6 w-3/4 rounded bg-gray-200'></div>
                                <div className='h-4 w-full rounded bg-gray-200'></div>
                                <div className='h-4 w-5/6 rounded bg-gray-200'></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className='h-full flex-1 overflow-y-auto p-6'>
            <div className='grid gap-6'>
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>

            {events.length === 0 && !isLoading && (
                <div className='py-12 text-center'>
                    <IconCalendarEvent
                        size={64}
                        className='mx-auto mb-4 text-gray-300'
                    />
                    <h3 className='mb-2 text-xl font-semibold text-gray-500'>
                        No events found
                    </h3>
                    <p className='text-gray-400'>
                        Try adjusting your search or filters
                    </p>
                </div>
            )}
        </div>
    );
}
