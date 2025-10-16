import React from 'react';
import { type NotificationData } from '../../types/notification';
import { IconCheck } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { NotificationIcon } from './NotificationIcon';

interface NotificationItemProps {
    notification: NotificationData;
    onMarkAsRead: (id: number) => void;
}

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
                case 'post_reactions':
                case 'comment_reactions':
                case 'comments':
                case 'posts':
                    navigate({ to: `/post/${notification.relatedId}` });
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
            className={`group flex w-[800px] cursor-pointer items-start justify-between gap-3 border-b border-slate-100 p-3 transition-colors hover:bg-slate-50 ${
                !notification.isRead ? 'bg-slate-100' : 'bg-white'
            }`}
            onClick={handleClick}
        >
            <div className='flex items-start gap-3'>
                <div className='mt-1 flex-shrink-0'>
                    <NotificationIcon type={notification.type} />
                </div>

                <div className='min-w-0'>
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
            </div>

            <div className='ml-4 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100'>
                {!notification.isRead && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                        }}
                        title='Mark as read'
                        className='hover:bg-primary-50 cursor-pointer rounded bg-white px-2 py-1 text-xs shadow-sm duration-200 hover:text-emerald-500'
                    >
                        <IconCheck size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};
