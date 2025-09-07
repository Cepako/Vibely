import { useNavigate } from '@tanstack/react-router';
import { IconCalendarEvent, IconMapPin, IconUsers } from '@tabler/icons-react';
import type { EventWithDetails } from './hooks/useExplore';
import UserAvatar from '../ui/UserAvatar';

interface EventCardProps {
    event: EventWithDetails;
}

export default function EventCard({ event }: EventCardProps) {
    const navigate = useNavigate();

    const handleEventClick = () => {
        navigate({
            to: '/events/$eventId',
            params: { eventId: event.id.toString() },
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

    return (
        <div
            className='cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md'
            onClick={handleEventClick}
        >
            <div className='flex items-start gap-3'>
                <div className='bg-primary-100 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg'>
                    <IconCalendarEvent size={24} className='text-primary-600' />
                </div>
                <div className='flex-1'>
                    <h3 className='line-clamp-1 font-semibold text-slate-900'>
                        {event.title}
                    </h3>
                    <p className='mt-1 line-clamp-2 text-sm text-slate-600'>
                        {event.description}
                    </p>
                    <div className='mt-2 flex items-center gap-4 text-sm text-slate-500'>
                        {event.location && (
                            <span className='flex items-center gap-1'>
                                <IconMapPin size={14} />
                                {event.location}
                            </span>
                        )}
                        <span>{formatDate(event.startTime)}</span>
                        {event.participantCounts.total > 0 && (
                            <span className='flex items-center gap-1'>
                                <IconUsers size={14} />
                                {event.participantCounts.total} attending
                            </span>
                        )}
                    </div>
                    <div className='mt-3 flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <UserAvatar
                                user={event.organizer as any}
                                size='sm'
                            />

                            <span className='text-sm text-slate-600'>
                                by {event.organizer.name}{' '}
                                {event.organizer.surname}
                            </span>
                        </div>
                        {event.category && (
                            <span className='bg-primary-100 text-primary-700 rounded-full px-2 py-1 text-xs'>
                                {event.category.name}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
