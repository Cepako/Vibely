import { useNavigate } from '@tanstack/react-router';
import {
    IconUsers,
    IconMapPin,
    IconStar,
    IconUserPlus,
} from '@tabler/icons-react';
import type { PotentialFriend } from './hooks/useExplore';
import UserAvatar from '../ui/UserAvatar';

interface UserCardProps {
    user: PotentialFriend;
}

export default function UserCard({ user }: UserCardProps) {
    const navigate = useNavigate();

    const handleUserClick = () => {
        navigate({
            to: '/profile/$profileId',
            params: { profileId: user.id.toString() },
        });
    };

    return (
        <div
            className='cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md'
            onClick={handleUserClick}
        >
            <div className='flex items-start gap-3'>
                <div className='h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-slate-200'>
                    <UserAvatar user={user as any} size='lg' />
                </div>
                <div className='flex-1'>
                    <h3 className='font-semibold text-slate-900'>
                        {user.name} {user.surname}
                    </h3>
                    {user.city && (
                        <p className='flex items-center gap-1 text-sm text-slate-500'>
                            <IconMapPin size={14} />
                            {user.city}
                            {user.region && `, ${user.region}`}
                        </p>
                    )}
                    {user.bio && (
                        <p className='mt-1 line-clamp-2 text-sm text-slate-600'>
                            {user.bio}
                        </p>
                    )}
                    <div className='mt-2 flex items-center gap-4 text-sm text-slate-500'>
                        {user.mutualFriendsCount > 0 && (
                            <span className='flex items-center gap-1'>
                                <IconUsers size={14} />
                                {user.mutualFriendsCount} mutual friends
                            </span>
                        )}
                        {user.mutualInterestsCount > 0 && (
                            <span className='flex items-center gap-1'>
                                <IconStar size={14} />
                                {user.mutualInterestsCount} common interests
                            </span>
                        )}
                    </div>
                    {user.commonInterests.length > 0 && (
                        <div className='mt-2 flex flex-wrap gap-1'>
                            {user.commonInterests
                                .slice(0, 3)
                                .map((interest) => (
                                    <span
                                        key={interest.id}
                                        className='bg-primary-100 text-primary-700 rounded-full px-2 py-1 text-xs'
                                    >
                                        {interest.name}
                                    </span>
                                ))}
                        </div>
                    )}
                </div>
                <button className='hover:bg-primary-50 rounded-full p-2 transition-colors'>
                    <IconUserPlus
                        size={20}
                        className='text-primary-600 cursor-pointer'
                    />
                </button>
            </div>
        </div>
    );
}
