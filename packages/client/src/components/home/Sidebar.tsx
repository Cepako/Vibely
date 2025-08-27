import { IconCalendar, IconMapPin } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { getEventStatus } from '../../utils/eventStatus';
import { useEvents } from '../events/hooks/useEvents';

// Keep mock data for active users for now
const activeUsers = [
    {
        id: 1,
        name: 'Jamie Lewis',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        status: 'online',
    },
    {
        id: 2,
        name: 'Casey Wong',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=32&h=32&fit=crop&crop=face',
        status: 'online',
    },
    {
        id: 3,
        name: 'Taylor Reed',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
        status: 'online',
    },
    {
        id: 4,
        name: 'Sam Johnson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
        status: 'online',
    },
];

export default function Sidebar() {
    const navigate = useNavigate();

    const upcomingEvents = useEvents('upcoming');

    const formatEventDate = (startTime: string) => {
        const eventDate = new Date(startTime);
        const now = new Date();
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const eventDateOnly = new Date(
            eventDate.getFullYear(),
            eventDate.getMonth(),
            eventDate.getDate()
        );

        const timeString = eventDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

        if (eventDateOnly.getTime() === today.getTime()) {
            return `Today, ${timeString}`;
        } else if (eventDateOnly.getTime() === tomorrow.getTime()) {
            return `Tomorrow, ${timeString}`;
        } else {
            const dateString = eventDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
            return `${dateString}, ${timeString}`;
        }
    };

    const getEventColor = (event: any) => {
        const status = getEventStatus(event.startTime, event.endTime);

        switch (status.status) {
            case 'ongoing':
                return 'bg-amber-100 text-amber-800 border border-amber-200';
            case 'upcoming':
                switch (event.privacyLevel) {
                    case 'public':
                        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                    case 'friends':
                        return 'bg-blue-100 text-blue-800 border border-blue-200';
                    case 'private':
                        return 'bg-purple-100 text-purple-800 border border-purple-200';
                    default:
                        return 'bg-slate-100 text-slate-800 border border-slate-200';
                }
            default:
                return 'bg-slate-100 text-slate-800 border border-slate-200';
        }
    };

    return (
        <div className='sticky top-24 right-7 h-fit w-80'>
            <div className='mb-4 rounded-lg border border-gray-200 bg-white p-4'>
                <div className='mb-3 flex items-center justify-between'>
                    <h3 className='flex items-center gap-1 font-semibold text-gray-900'>
                        <IconCalendar className='h-4 w-4' />
                        Upcoming Events
                    </h3>
                </div>

                <div className='space-y-2'>
                    {upcomingEvents.isLoading ? (
                        <div className='space-y-2'>
                            {[1, 2].map((i) => (
                                <div
                                    key={i}
                                    className='animate-pulse rounded-lg bg-gray-100 p-3'
                                >
                                    <div className='h-4 w-3/4 rounded bg-gray-200'></div>
                                    <div className='mt-1 h-3 w-1/2 rounded bg-gray-200'></div>
                                </div>
                            ))}
                        </div>
                    ) : upcomingEvents.events.length > 0 ? (
                        upcomingEvents.events
                            .slice(0, 3)
                            .map((event: any) => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    formatEventDate={formatEventDate}
                                    getEventColor={getEventColor}
                                    navigate={navigate}
                                />
                            ))
                    ) : (
                        <div className='rounded-lg bg-gray-50 p-3 text-center text-sm text-gray-500'>
                            No upcoming events
                        </div>
                    )}
                </div>

                <button
                    className='text-primary-600 hover:text-primary-700 mt-3 cursor-pointer text-sm font-medium duration-200 hover:underline'
                    onClick={() => navigate({ to: '/events' })}
                >
                    See all events
                </button>
            </div>

            <div className='rounded-lg border border-gray-200 bg-white p-4'>
                <div className='mb-3 flex items-center justify-between'>
                    <h3 className='flex items-center font-semibold text-gray-900'>
                        <div className='mr-2 h-2 w-2 rounded-full bg-green-500'></div>
                        Active Now
                    </h3>
                    <span className='text-xs text-gray-500'>
                        {activeUsers.length} online
                    </span>
                </div>

                <div className='space-y-1'>
                    {activeUsers.map((user) => (
                        <ActiveUser key={user.id} user={user} />
                    ))}
                </div>

                <button
                    className='text-primary-600 hover:text-primary-700 mt-3 cursor-pointer text-sm font-medium duration-200 hover:underline'
                    onClick={() => navigate({ to: '/messages' })}
                >
                    See all friends
                </button>
            </div>
        </div>
    );
}

interface EventCardProps {
    event: any;
    formatEventDate: (startTime: string) => string;
    getEventColor: (event: any) => string;
    navigate: any;
}

function EventCard({
    event,
    formatEventDate,
    getEventColor,
    navigate,
}: EventCardProps) {
    const handleClick = () => {
        navigate({
            to: '/events/$eventId',
            params: { eventId: event.id.toString() },
        });
    };

    return (
        <div
            className={`cursor-pointer rounded-lg p-3 transition-all hover:shadow-sm ${getEventColor(event)}`}
            onClick={handleClick}
        >
            <h4
                className='line-clamp-1 text-sm font-medium'
                title={event.title}
            >
                {event.title}
            </h4>
            <p className='mt-1 text-xs opacity-75'>
                {formatEventDate(event.startTime)}
            </p>
            {event.location && (
                <p
                    className='mt-0.5 line-clamp-1 flex gap-1 text-xs opacity-60'
                    title={event.location}
                >
                    <IconMapPin size={15} /> {event.location}
                </p>
            )}
        </div>
    );
}

interface ActiveUserProps {
    user: any;
}

function ActiveUser({ user }: ActiveUserProps) {
    return (
        <div className='flex cursor-pointer items-center space-x-3 rounded-lg px-2 py-2 hover:bg-gray-50'>
            <div className='relative'>
                <img
                    src={user.avatar}
                    alt={user.name}
                    className='h-8 w-8 rounded-full object-cover'
                />
                <div className='absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500'></div>
            </div>
            <span className='text-sm font-medium text-gray-900'>
                {user.name}
            </span>
        </div>
    );
}
