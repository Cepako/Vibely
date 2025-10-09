import type { JSX } from 'react';
import type { NotificationType } from '../../types/notification';
import {
    IconBell,
    IconCalendar,
    IconHeart,
    IconMessageCircle,
    IconMessageCircleHeart,
    IconPhoto,
    IconUsers,
} from '@tabler/icons-react';
import DropdownMenu from '../ui/DropdownMenu';

const notificationData: Record<
    NotificationType | 'all',
    { label: string; icon: JSX.Element }
> = {
    all: {
        label: 'All notifications',
        icon: <IconBell size={18} />,
    },
    posts: {
        label: 'Posts',
        icon: <IconPhoto size={18} />,
    },
    comments: {
        label: 'Comments',
        icon: <IconMessageCircle size={18} />,
    },
    comment_reactions: {
        label: 'Comment Reactions',
        icon: <IconMessageCircleHeart size={18} />,
    },
    friendships: {
        label: 'Friendships',
        icon: <IconUsers size={18} />,
    },
    events: {
        label: 'Events',
        icon: <IconCalendar size={18} />,
    },
    post_reactions: {
        label: 'Post Reactions',
        icon: <IconHeart size={18} />,
    },
};

interface NotificationTypeSelectProps {
    filterType: 'all' | NotificationType;
    setFilterType: (type: 'all' | NotificationType) => void;
}

export default function NotificationTypeSelect({
    filterType,
    setFilterType,
}: NotificationTypeSelectProps) {
    const notificationMenuItems = [
        {
            id: 'all',
            label: 'All notifications',
            icon: <IconBell />,
            onClick: () => setFilterType('all'),
            className: 'p-2',
        },
        {
            id: 'posts',
            label: 'Posts',
            icon: <IconPhoto />,
            onClick: () => setFilterType('posts'),
            className: 'p-2',
        },
        {
            id: 'comments',
            label: 'Comments',
            icon: <IconMessageCircle />,
            onClick: () => setFilterType('comments'),
            className: 'p-2',
        },
        {
            id: 'comment_reactions',
            label: 'Comment Reactions',
            icon: <IconMessageCircleHeart />,
            onClick: () => setFilterType('comment_reactions'),
            className: 'p-2',
        },
        {
            id: 'friendships',
            label: 'Friendships',
            icon: <IconUsers />,
            onClick: () => setFilterType('friendships'),
            className: 'p-2',
        },
        {
            id: 'events',
            label: 'Events',
            icon: <IconCalendar />,
            onClick: () => setFilterType('events'),
            className: 'p-2',
        },
        {
            id: 'post_reactions',
            label: 'Post Reactions',
            icon: <IconHeart />,
            onClick: () => setFilterType('post_reactions'),
            className: 'p-2',
        },
    ];
    return (
        <DropdownMenu
            trigger={
                <div className='flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100'>
                    {notificationData[filterType].label}{' '}
                    {notificationData[filterType].icon}
                </div>
            }
            items={notificationMenuItems}
            placement='bottom-start'
            className='border-slate-300 shadow-lg'
        />
    );
}
