import type { User } from '../../types/user';
import { cn } from '../../utils/utils';

export default function UserAvatar({
    user,
    size = 'md',
    onClick,
}: {
    user: User;
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
}) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
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
                user.name[0]
            )}
        </div>
    );
}
