import React from 'react';
import {
    IconBell,
    IconHeart,
    IconMessage,
    IconUsers,
    IconCalendar,
    IconMessageCircle,
    IconPhoto,
    IconMessageCircleHeart,
} from '@tabler/icons-react';
import type { NotificationType } from '../../types/notification';

interface NotificationIconProps {
    type: NotificationType;
    className?: string;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({
    type,
    className = '',
}) => {
    const iconProps = { size: 18 };

    switch (type) {
        case 'friendships':
            return (
                <IconUsers
                    {...iconProps}
                    className={`${className} text-primary-500`}
                />
            );
        case 'messages':
            return (
                <IconMessage
                    {...iconProps}
                    className={`${className} text-green-500`}
                />
            );
        case 'post_reactions':
            return (
                <IconHeart
                    {...iconProps}
                    className={`${className} text-red-500`}
                />
            );
        case 'comment_reactions':
            return (
                <IconMessageCircleHeart
                    {...iconProps}
                    className={`${className} text-pink-500`}
                />
            );
        case 'comments':
            return (
                <IconMessageCircle
                    {...iconProps}
                    className={`${className} text-purple-500`}
                />
            );
        case 'events':
            return (
                <IconCalendar
                    {...iconProps}
                    className={`${className} text-orange-500`}
                />
            );
        case 'posts':
            return (
                <IconPhoto
                    {...iconProps}
                    className={`${className} text-indigo-500`}
                />
            );
        default:
            return (
                <IconBell
                    {...iconProps}
                    className={`${className} text-slate-500`}
                />
            );
    }
};
