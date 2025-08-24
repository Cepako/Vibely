import { useState } from 'react';
import {
    IconChevronLeft,
    IconChevronRight,
    IconCalendarEvent,
    IconClock,
    IconMapPin,
    IconUsers,
    IconExternalLink,
} from '@tabler/icons-react';
import type { Event } from '../../types/events';
import { useNavigate } from '@tanstack/react-router';

interface EventsCalendarProps {
    events: Event[];
    isLoading: boolean;
}

interface CalendarDay {
    date: Date;
    events: Event[];
    isCurrentMonth: boolean;
    isToday: boolean;
}

export default function EventsCalendar({
    events,
    isLoading,
}: EventsCalendarProps) {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const today = new Date();

    // Get calendar days for the current month
    const getCalendarDays = (): CalendarDay[] => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // First day of the month
        const firstDay = new Date(year, month, 1);
        // Last day of the month
        const lastDay = new Date(year, month + 1, 0);

        // Start from Sunday of the week containing the first day
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - startDate.getDay());

        // End on Saturday of the week containing the last day
        const endDate = new Date(lastDay);
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

        const days: CalendarDay[] = [];
        const currentDay = new Date(startDate);

        while (currentDay <= endDate) {
            const dayEvents = events.filter((event) => {
                const eventDate = new Date(event.startTime);
                return eventDate.toDateString() === currentDay.toDateString();
            });

            days.push({
                date: new Date(currentDay),
                events: dayEvents,
                isCurrentMonth: currentDay.getMonth() === month,
                isToday: currentDay.toDateString() === today.toDateString(),
            });

            currentDay.setDate(currentDay.getDate() + 1);
        }

        return days;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        newDate.setMonth(
            currentDate.getMonth() + (direction === 'next' ? 1 : -1)
        );
        setCurrentDate(newDate);
        setSelectedDate(null);
    };

    const formatTime = (dateTime: string) => {
        const date = new Date(dateTime);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const getPrivacyColor = (privacy: string) => {
        switch (privacy) {
            case 'public':
                return 'bg-green-100 border-green-200 text-green-800 hover:bg-green-200';
            case 'friends':
                return 'bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200';
            case 'private':
                return 'bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200';
            default:
                return 'bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200';
        }
    };

    const navigateToEvent = (eventId: number) => {
        navigate({
            to: '/events/$eventId',
            params: { eventId: eventId.toString() },
        });
    };

    const navigateToProfile = (userId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate({ to: '/profile/$id', params: { id: userId.toString() } });
    };

    const calendarDays = getCalendarDays();
    const selectedDayEvents = selectedDate
        ? events.filter(
              (event) =>
                  new Date(event.startTime).toDateString() ===
                  selectedDate.toDateString()
          )
        : [];

    if (isLoading) {
        return (
            <div className='flex-1 overflow-hidden p-6'>
                <div className='h-full animate-pulse rounded-lg border border-gray-200 bg-white shadow-sm'>
                    <div className='border-b border-gray-200 p-4'>
                        <div className='mx-auto h-8 w-48 rounded bg-gray-200'></div>
                    </div>
                    <div className='grid grid-cols-7 gap-2 p-4'>
                        {Array.from({ length: 35 }).map((_, i) => (
                            <div
                                key={i}
                                className='h-24 rounded bg-gray-100'
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='flex-1 overflow-hidden p-6'>
            <div className='flex h-full rounded-lg border border-gray-200 bg-white shadow-sm'>
                {/* Calendar */}
                <div className='flex flex-1 flex-col'>
                    {/* Calendar Header */}
                    <div className='flex items-center justify-between border-b border-gray-200 p-4'>
                        <button
                            onClick={() => navigateMonth('prev')}
                            className='rounded-lg p-2 transition-colors hover:bg-gray-100'
                        >
                            <IconChevronLeft size={20} />
                        </button>

                        <h2 className='text-xl font-semibold text-gray-900'>
                            {currentDate.toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                            })}
                        </h2>

                        <button
                            onClick={() => navigateMonth('next')}
                            className='rounded-lg p-2 transition-colors hover:bg-gray-100'
                        >
                            <IconChevronRight size={20} />
                        </button>
                    </div>

                    {/* Days of Week Header */}
                    <div className='grid grid-cols-7 border-b border-gray-200'>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                            (day) => (
                                <div
                                    key={day}
                                    className='p-3 text-center text-sm font-semibold text-gray-600'
                                >
                                    {day}
                                </div>
                            )
                        )}
                    </div>

                    {/* Calendar Grid */}
                    <div className='grid flex-1 grid-cols-7 gap-0'>
                        {calendarDays.map((day, index) => (
                            <div
                                key={index}
                                onClick={() => setSelectedDate(day.date)}
                                className={`min-h-[100px] cursor-pointer border-r border-b border-gray-200 p-2 transition-colors hover:bg-gray-50 ${
                                    !day.isCurrentMonth
                                        ? 'bg-gray-50 text-gray-400'
                                        : ''
                                } ${day.isToday ? 'bg-primary-50' : ''} ${
                                    selectedDate?.toDateString() ===
                                    day.date.toDateString()
                                        ? 'ring-primary-500 bg-primary-50 ring-2'
                                        : ''
                                }`}
                            >
                                <div
                                    className={`mb-1 text-sm font-semibold ${
                                        day.isToday ? 'text-primary-600' : ''
                                    }`}
                                >
                                    {day.date.getDate()}
                                </div>

                                {/* Event indicators */}
                                <div className='space-y-1'>
                                    {day.events.slice(0, 3).map((event) => (
                                        <div
                                            key={event.id}
                                            className={`cursor-pointer truncate rounded border px-1 py-0.5 text-xs transition-colors ${getPrivacyColor(event.privacyLevel)}`}
                                            title={`${event.title} - ${formatTime(event.startTime)}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigateToEvent(event.id);
                                            }}
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                                    {day.events.length > 3 && (
                                        <div className='text-xs font-medium text-gray-500'>
                                            +{day.events.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Event Details Sidebar */}
                <div className='flex w-80 flex-col border-l border-gray-200'>
                    <div className='border-b border-gray-200 p-4'>
                        <h3 className='font-semibold text-gray-900'>
                            {selectedDate
                                ? selectedDate.toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      month: 'long',
                                      day: 'numeric',
                                  })
                                : 'Select a date'}
                        </h3>
                    </div>

                    <div className='flex-1 overflow-y-auto'>
                        {selectedDate ? (
                            selectedDayEvents.length > 0 ? (
                                <div className='space-y-4 p-4'>
                                    {selectedDayEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className='hover:border-primary-300 cursor-pointer rounded-lg border border-gray-200 p-3 transition-shadow hover:shadow-sm'
                                            onClick={() =>
                                                navigateToEvent(event.id)
                                            }
                                        >
                                            <div className='mb-3 flex items-start justify-between'>
                                                <h4 className='hover:text-primary-600 font-semibold text-gray-900 transition-colors'>
                                                    {event.title}
                                                </h4>
                                                <IconExternalLink
                                                    size={16}
                                                    className='hover:text-primary-500 text-gray-400 transition-colors'
                                                />
                                            </div>

                                            {/* Organizer Info */}
                                            <div className='mb-3 flex items-center gap-2'>
                                                <div
                                                    className='hover:ring-primary-500 h-6 w-6 cursor-pointer overflow-hidden rounded-full bg-gray-200 transition-all hover:ring-2'
                                                    onClick={(e) =>
                                                        navigateToProfile(
                                                            event.organizer.id,
                                                            e
                                                        )
                                                    }
                                                >
                                                    {event.organizer
                                                        .profilePictureUrl ? (
                                                        <img
                                                            src={
                                                                event.organizer
                                                                    .profilePictureUrl
                                                            }
                                                            alt={
                                                                event.organizer
                                                                    .name
                                                            }
                                                            className='h-full w-full object-cover'
                                                        />
                                                    ) : (
                                                        <div className='bg-primary-100 text-primary-500 flex h-full w-full items-center justify-center text-xs font-medium'>
                                                            {
                                                                event.organizer
                                                                    .name[0]
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                                <span
                                                    className='hover:text-primary-600 cursor-pointer text-sm text-gray-600 transition-colors'
                                                    onClick={(e) =>
                                                        navigateToProfile(
                                                            event.organizer.id,
                                                            e
                                                        )
                                                    }
                                                >
                                                    {event.organizer.name}{' '}
                                                    {event.organizer.surname}
                                                </span>
                                            </div>

                                            <div className='space-y-2 text-sm text-gray-600'>
                                                <div className='flex items-center gap-2'>
                                                    <IconClock size={14} />
                                                    <span>
                                                        {formatTime(
                                                            event.startTime
                                                        )}
                                                        {event.endTime &&
                                                            ` - ${formatTime(event.endTime)}`}
                                                    </span>
                                                </div>

                                                {event.location && (
                                                    <div className='flex items-center gap-2'>
                                                        <IconMapPin size={14} />
                                                        <span className='truncate'>
                                                            {event.location}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className='flex items-center gap-2'>
                                                    <IconUsers size={14} />
                                                    <span>
                                                        {
                                                            event
                                                                .participantCounts
                                                                .going
                                                        }{' '}
                                                        going
                                                        {event.maxParticipants &&
                                                            ` / ${event.maxParticipants} max`}
                                                    </span>
                                                </div>
                                            </div>

                                            {event.description && (
                                                <p className='mt-2 line-clamp-2 text-sm text-gray-600'>
                                                    {event.description}
                                                </p>
                                            )}

                                            <div className='mt-3 flex items-center justify-between'>
                                                <span
                                                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium capitalize ${getPrivacyColor(event.privacyLevel).replace('hover:bg-', 'hover:')}`}
                                                >
                                                    {event.privacyLevel}
                                                </span>

                                                {/* User Status Indicator */}
                                                {event.currentUserStatus ===
                                                    'going' && (
                                                    <span className='text-xs font-medium text-green-600'>
                                                        You're going
                                                    </span>
                                                )}
                                                {event.currentUserStatus ===
                                                    'invited' && (
                                                    <span className='text-xs font-medium text-orange-600'>
                                                        Invited
                                                    </span>
                                                )}
                                                {event.currentUserStatus ===
                                                    'declined' && (
                                                    <span className='text-xs font-medium text-red-600'>
                                                        Declined
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='p-4 text-center text-gray-500'>
                                    <IconCalendarEvent
                                        size={48}
                                        className='mx-auto mb-3 text-gray-300'
                                    />
                                    <p>No events on this date</p>
                                </div>
                            )
                        ) : (
                            <div className='p-4 text-center text-gray-500'>
                                <IconCalendarEvent
                                    size={48}
                                    className='mx-auto mb-3 text-gray-300'
                                />
                                <p>Select a date to view events</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
