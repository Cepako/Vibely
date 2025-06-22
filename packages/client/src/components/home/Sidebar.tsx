import { IconCalendar } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';

// Dummy data for upcoming events
const upcomingEvents = [
    {
        id: 1,
        title: 'Design Meetup',
        date: 'Tomorrow, 6:30 PM',
        color: 'bg-blue-100 text-blue-800',
    },
    {
        id: 2,
        title: 'Minimalist Workshop',
        date: 'May 21, 4:30 PM',
        color: 'bg-orange-100 text-orange-800',
    },
];

// Dummy data for active users
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

    return (
        <div className='sticky top-24 right-7 h-fit w-80'>
            {/* Upcoming Events Section */}
            <div className='mb-4 rounded-lg border border-gray-200 bg-white p-4'>
                <div className='mb-3 flex items-center justify-between'>
                    <h3 className='flex items-center gap-1 font-semibold text-gray-900'>
                        <IconCalendar className='h-4 w-4' />
                        Upcoming Events
                    </h3>
                </div>

                <div className='space-y-2'>
                    {upcomingEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>

                <button
                    className='text-primary-600 hover:text-primary-700 mt-3 cursor-pointer text-sm font-medium duration-200 hover:underline'
                    onClick={() => navigate({ to: '/events' })}
                >
                    See all events
                </button>
            </div>

            {/* Active Now Section */}
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
}

function EventCard({ event }: EventCardProps) {
    return (
        <div className={`rounded-lg p-3 ${event.color} mb-2`}>
            <h4 className='text-sm font-medium'>{event.title}</h4>
            <p className='mt-1 text-xs opacity-75'>{event.date}</p>
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
