import { useState } from 'react';
import {
    IconChevronLeft,
    IconChevronRight,
    IconCalendarEvent,
    IconClock,
    IconMapPin,
    IconUsers,
    IconExternalLink,
    IconCalendarX,
    IconCalendarCheck,
    IconTag,
} from '@tabler/icons-react';
import type { Event } from '../../types/events';
import { useNavigate } from '@tanstack/react-router';
import { getEventStatus } from '../../utils/eventStatus';
import UserAvatar from '../ui/UserAvatar';

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

    const getCalendarDays = (): CalendarDay[] => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

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

    const getEventStatusColor = (event: Event) => {
        const status = getEventStatus(
            event.startTime,
            event.endTime || event.startTime
        );

        switch (status.status) {
            case 'ended':
                return 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200';
            case 'ongoing':
                return 'bg-amber-100 border-amber-200 text-amber-700 hover:bg-amber-200';
            case 'upcoming':
                return 'bg-emerald-100 border-emerald-200 text-emerald-700 hover:bg-emerald-200';
            default:
                return 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200';
        }
    };

    const getPrivacyColor = (privacy: string) => {
        switch (privacy) {
            case 'public':
                return 'bg-emerald-100 border-emerald-200 text-emerald-800 hover:bg-emerald-200';
            case 'friends':
                return 'bg-primary-100 border-primary-200 text-primary-800 hover:bg-primary-200';
            case 'private':
                return 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200';
            default:
                return 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200';
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
        navigate({
            to: '/profile/$profileId',
            params: { profileId: userId.toString() },
        });
    };

    const handleDayClick = (day: CalendarDay) => {
        if (day.isCurrentMonth) {
            setSelectedDate(day.date);
        }
    };

    const getDayBackgroundColor = (day: CalendarDay, isSelected: boolean) => {
        if (!day.isCurrentMonth) return 'bg-slate-50';
        if (isSelected) return 'bg-amber-100';
        if (day.isToday) return 'bg-primary-50';

        const dayEnd = new Date(day.date);
        dayEnd.setHours(23, 59, 59, 999);
        const isEndedDay = today > dayEnd;

        if (isEndedDay) {
            return 'bg-slate-100';
        }

        if (day.events.length > 0) {
            const hasOngoing = day.events.some(
                (event) =>
                    getEventStatus(
                        event.startTime,
                        event.endTime || event.startTime
                    ).status === 'ongoing'
            );
            const hasUpcoming = day.events.some(
                (event) =>
                    getEventStatus(
                        event.startTime,
                        event.endTime || event.startTime
                    ).status === 'upcoming'
            );

            if (hasOngoing) return 'bg-amber-50 border-amber-100';
            if (hasUpcoming) return 'bg-emerald-50 border-emerald-100';
        }

        return 'bg-white';
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
            <div className='flex-1 p-6'>
                <div className='h-[600px] animate-pulse rounded-lg border border-slate-200 bg-white shadow-sm'>
                    <div className='border-b border-slate-200 p-4'>
                        <div className='mx-auto h-8 w-48 rounded bg-slate-200'></div>
                    </div>
                    <div className='grid grid-cols-7 gap-2 p-4'>
                        {Array.from({ length: 35 }).map((_, i) => (
                            <div
                                key={i}
                                className='h-24 rounded bg-slate-100'
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='flex-1 px-6 py-3'>
            <div className='flex h-[730px] rounded-lg border border-slate-200 bg-white shadow-sm'>
                <div className='flex flex-1 flex-col'>
                    <div className='flex items-center justify-between border-b border-slate-200 p-4'>
                        <button
                            onClick={() => navigateMonth('prev')}
                            className='cursor-pointer rounded-lg p-2 transition-colors hover:bg-slate-100'
                        >
                            <IconChevronLeft size={20} />
                        </button>

                        <h2 className='text-xl font-semibold text-slate-900'>
                            {currentDate.toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                            })}
                        </h2>

                        <button
                            onClick={() => navigateMonth('next')}
                            className='cursor-pointer rounded-lg p-2 transition-colors hover:bg-slate-100'
                        >
                            <IconChevronRight size={20} />
                        </button>
                    </div>

                    <div className='grid grid-cols-7 border-b border-slate-200'>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                            (day) => (
                                <div
                                    key={day}
                                    className='p-3 text-center text-sm font-semibold text-slate-600'
                                >
                                    {day}
                                </div>
                            )
                        )}
                    </div>

                    <div className='grid flex-1 grid-cols-7'>
                        {calendarDays.map((day, index) => {
                            const isSelected =
                                selectedDate?.toDateString() ===
                                day.date.toDateString();

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleDayClick(day)}
                                    className={`min-h-[80px] border-r border-b border-slate-200 p-2 transition-colors ${
                                        !day.isCurrentMonth
                                            ? 'cursor-not-allowed bg-slate-50 text-slate-400'
                                            : 'cursor-pointer hover:bg-slate-50'
                                    } ${getDayBackgroundColor(day, isSelected)}`}
                                >
                                    <div
                                        className={`mb-1 text-sm font-semibold ${
                                            day.isToday && day.isCurrentMonth
                                                ? 'text-primary-600'
                                                : isSelected &&
                                                    day.isCurrentMonth
                                                  ? 'text-amber-600'
                                                  : day.isCurrentMonth
                                                    ? 'text-slate-900'
                                                    : 'text-slate-400'
                                        }`}
                                    >
                                        {day.date.getDate()}
                                    </div>

                                    {day.isCurrentMonth && (
                                        <div className='space-y-1'>
                                            {day.events
                                                .slice(0, 2)
                                                .map((event) => {
                                                    const eventStatus =
                                                        getEventStatus(
                                                            event.startTime,
                                                            event.endTime ||
                                                                event.startTime
                                                        );

                                                    return (
                                                        <div
                                                            key={event.id}
                                                            className={`flex cursor-pointer items-center gap-1 truncate rounded border px-1 py-0.5 text-xs transition-colors ${getEventStatusColor(event)}`}
                                                            title={`${event.title} - ${formatTime(event.startTime)} (${eventStatus.label})${event.category ? ` • ${event.category.name}` : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigateToEvent(
                                                                    event.id
                                                                );
                                                            }}
                                                        >
                                                            {eventStatus.status ===
                                                                'ended' && (
                                                                <IconCalendarX
                                                                    size={10}
                                                                />
                                                            )}
                                                            {eventStatus.status ===
                                                                'ongoing' && (
                                                                <IconCalendarCheck
                                                                    size={10}
                                                                />
                                                            )}
                                                            {eventStatus.status ===
                                                                'upcoming' && (
                                                                <IconClock
                                                                    size={10}
                                                                />
                                                            )}
                                                            <span className='truncate'>
                                                                {event.title}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            {day.events.length > 2 && (
                                                <div className='text-xs font-medium text-slate-500'>
                                                    +{day.events.length - 2}{' '}
                                                    more
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className='flex w-80 flex-col border-l border-slate-200'>
                    <div className='flex-shrink-0 border-b border-slate-200 px-4 py-[22px]'>
                        <h3 className='font-semibold text-slate-900'>
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
                                    {selectedDayEvents.map((event) => {
                                        const eventStatus = getEventStatus(
                                            event.startTime,
                                            event.endTime || event.startTime
                                        );

                                        return (
                                            <div
                                                key={event.id}
                                                className='hover:border-primary-300 cursor-pointer rounded-lg border border-slate-200 p-3 transition-all hover:bg-slate-50 hover:shadow-sm'
                                                onClick={() =>
                                                    navigateToEvent(event.id)
                                                }
                                            >
                                                <div className='mb-3 flex items-start justify-between'>
                                                    <h4 className='hover:text-primary-600 font-semibold text-slate-900 transition-colors'>
                                                        {event.title}
                                                    </h4>
                                                    <div className='flex items-center gap-2'>
                                                        <div
                                                            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${eventStatus.bgColor} ${eventStatus.color}`}
                                                        >
                                                            {eventStatus.status ===
                                                                'ended' && (
                                                                <IconCalendarX
                                                                    size={12}
                                                                />
                                                            )}
                                                            {eventStatus.status ===
                                                                'ongoing' && (
                                                                <IconCalendarCheck
                                                                    size={12}
                                                                />
                                                            )}
                                                            {eventStatus.status ===
                                                                'upcoming' && (
                                                                <IconClock
                                                                    size={12}
                                                                />
                                                            )}
                                                            <span>
                                                                {
                                                                    eventStatus.label
                                                                }
                                                            </span>
                                                        </div>
                                                        <IconExternalLink
                                                            size={16}
                                                            className='hover:text-primary-500 text-slate-400 transition-colors'
                                                        />
                                                    </div>
                                                </div>

                                                <div className='mb-3 flex items-center gap-2'>
                                                    <div
                                                        className='h-6 w-6 cursor-pointer overflow-hidden rounded-full bg-slate-200 transition-all'
                                                        onClick={(e) =>
                                                            navigateToProfile(
                                                                event.organizer
                                                                    .id,
                                                                e
                                                            )
                                                        }
                                                    >
                                                        <UserAvatar
                                                            user={
                                                                event.organizer as any
                                                            }
                                                            size='xs'
                                                        />
                                                    </div>
                                                    <span
                                                        className='hover:text-primary-600 cursor-pointer text-sm text-slate-600 transition-colors'
                                                        onClick={(e) =>
                                                            navigateToProfile(
                                                                event.organizer
                                                                    .id,
                                                                e
                                                            )
                                                        }
                                                    >
                                                        {event.organizer.name}{' '}
                                                        {
                                                            event.organizer
                                                                .surname
                                                        }
                                                    </span>
                                                </div>

                                                <div className='space-y-2 text-sm text-slate-600'>
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
                                                            <IconMapPin
                                                                size={14}
                                                            />
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

                                                    {event.category && (
                                                        <div className='flex items-center gap-2'>
                                                            <IconTag
                                                                size={14}
                                                            />
                                                            <span className='text-primary-600 font-medium'>
                                                                {
                                                                    event
                                                                        .category
                                                                        .name
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {event.description && (
                                                    <p className='mt-2 line-clamp-2 text-sm text-slate-600'>
                                                        {event.description}
                                                    </p>
                                                )}

                                                <div className='mt-3 flex items-center justify-between'>
                                                    <span
                                                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium capitalize ${getPrivacyColor(event.privacyLevel).replace('hover:bg-', 'hover:')}`}
                                                    >
                                                        {event.privacyLevel}
                                                    </span>

                                                    {event.currentUserStatus ===
                                                        'going' && (
                                                        <span className='text-xs font-medium text-emerald-600'>
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
                                                        <span className='text-xs font-medium text-rose-600'>
                                                            Declined
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className='p-4 text-center text-slate-500'>
                                    <IconCalendarEvent
                                        size={48}
                                        className='mx-auto mb-3 text-slate-300'
                                    />
                                    <p>No events on this date</p>
                                </div>
                            )
                        ) : (
                            <div className='p-4 text-center text-slate-500'>
                                <IconCalendarEvent
                                    size={48}
                                    className='mx-auto mb-3 text-slate-300'
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
