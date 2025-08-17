import React from 'react';
import { type NotificationData } from '../../types/notification';
import {
    IconHeart,
    IconMessage,
    IconUsers,
    IconCalendar,
    IconMessageCircle,
    IconPhoto,
    IconBell,
    IconMessageCircleHeart,
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';

interface NotificationItemProps {
    notification: NotificationData;
    onMarkAsRead: (id: number) => void;
}

const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
        case 'friendships':
            return <IconUsers className='text-primary-500' size={20} />;
        case 'messages':
            return <IconMessage className='text-green-500' size={20} />;
        case 'post_reactions':
            return <IconHeart className='text-red-500' size={20} />;
        case 'comment_reactions':
            return (
                <IconMessageCircleHeart
                    className='text-fuchsia-500'
                    size={20}
                />
            );
        case 'comments':
            return <IconMessageCircle className='text-purple-500' size={20} />;
        case 'events':
            return <IconCalendar className='text-orange-500' size={20} />;
        case 'posts':
            return <IconPhoto className='text-indigo-500' size={20} />;
        default:
            return <IconBell className='text-slate-500' size={20} />;
    }
};

const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
        return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onMarkAsRead,
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (!notification.isRead) {
            onMarkAsRead(notification.id);
        }

        if (notification.relatedId) {
            switch (notification.type) {
                case 'friendships':
                    navigate({ to: `/profile/${notification.relatedId}` });
                    break;
                case 'messages':
                    navigate({ to: '/messages' });
                    break;
                case 'post_reactions':
                case 'comment_reactions':
                case 'comments':
                case 'posts':
                    // For now, navigate to home since we don't have individual post pages
                    navigate({ to: '/home' });
                    break;
                case 'events':
                    navigate({ to: `/events/${notification.relatedId}` });
                    break;
                default:
                    navigate({ to: '/home' });
            }
        }
    };

    return (
        <div
            className={`cursor-pointer border-b border-slate-100 p-4 transition-colors hover:bg-slate-50 ${
                !notification.isRead
                    ? 'border-l-primary-500 bg-primary-50 border-l-4'
                    : ''
            }`}
            onClick={handleClick}
        >
            <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0'>
                    {getNotificationIcon(notification.type)}
                </div>

                <div className='min-w-0 flex-1'>
                    <p
                        className={`text-sm ${
                            notification.isRead
                                ? 'text-slate-600'
                                : 'font-medium text-slate-900'
                        }`}
                    >
                        {notification.content}
                    </p>
                    <p className='mt-1 text-xs text-slate-500'>
                        {getRelativeTime(notification.createdAt)}
                    </p>
                </div>

                {!notification.isRead && (
                    <div className='bg-primary-500 h-2 w-2 flex-shrink-0 rounded-full'></div>
                )}
            </div>
        </div>
    );
};
