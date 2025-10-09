import type { User } from '../../types/user';
import { cn } from '../../utils/utils';
import type { Friend } from '../profile/hooks/useFriendship';

export default function UserAvatar({
    user,
    size = 'md',
    onClick,
}: {
    user: User | Friend;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
    onClick?: () => void;
}) {
    const sizeClasses = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
        xxl: 'h-30 w-30 text-3xl',
    };

    return (
        <div
            className={cn(
                `${sizeClasses[size]} from-primary-400 bg-primary-200 text-primary-700 flex flex-shrink-0 items-center justify-center rounded-full font-semibold`,
                onClick && 'cursor-pointer'
            )}
            onClick={() => (onClick ? onClick() : '')}
        >
            {user.profilePictureUrl ? (
                <img
                    src={user.profilePictureUrl}
                    alt={`${user.name} ${user.surname}`}
                    className='h-full w-full rounded-full object-cover'
                />
            ) : (
                `${user.name[0].toUpperCase()}${user.surname[0].toUpperCase()}`
            )}
        </div>
    );
}
