import React from 'react';
import { IconBell } from '@tabler/icons-react';
import { useNotifications } from './hooks/useNotifications';

interface NotificationBellProps {
    className?: string;
    onClick?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
    className,
    onClick,
}) => {
    const { unreadCount } = useNotifications();

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={onClick}
                className='relative p-2 text-gray-600 transition-colors hover:text-gray-900'
            >
                <IconBell size={24} />

                {unreadCount > 0 && (
                    <span className='absolute -top-1 -right-1 flex h-5 w-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 text-xs text-white'>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
        </div>
    );
};
