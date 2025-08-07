import type { User } from '../../types/user';

export default function UserAvatar({
    user,
    size = 'md',
}: {
    user: User;
    size?: 'sm' | 'md' | 'lg';
}) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
    };

    return (
        <div
            className={`${sizeClasses[size]} flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 font-semibold text-white`}
        >
            {user.profilePictureUrl ? (
                <img
                    src={user.profilePictureUrl}
                    alt={`${user.name} ${user.surname}`}
                    className='h-full w-full rounded-full object-cover'
                />
            ) : (
                `${user.name[0]}${user.surname[0]}`
            )}
        </div>
    );
}
