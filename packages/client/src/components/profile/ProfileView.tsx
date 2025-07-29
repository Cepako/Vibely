import { IconMapPin, IconCalendar, IconCake } from '@tabler/icons-react';
import { useProfile } from '../hooks/useProfile';
import { useParams } from '@tanstack/react-router';
import { useAuth } from '../auth/AuthProvider';
import FriendshipButton from './FriendshipButton';
import { useState } from 'react';
import PostsList from './PostsList';
import FriendsList from './FriendsList';
import EditProfileForm from './EditProfileForm';
import ProfileImage from './ProfileImage';

export default function ProfileView() {
    const params = useParams({ from: '/profile/$id' });
    const [selectedView, setSelectedView] = useState<'posts' | 'friends'>(
        'posts'
    );
    const { user } = useAuth();
    const { data, isLoading } = useProfile(Number(params.id));
    const userProfile = data;

    const isOwnProfile = user?.id === userProfile?.id;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
        });
    };

    const formatBirthDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const getAge = (dateOfBirth: string) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        return age;
    };
    if (isLoading) {
        return <div>Loading...</div>; //TODO: Loader
    }

    if (!userProfile) return <div>Profile not found</div>;

    return (
        <div className='mx-auto my-5 w-full max-w-4xl overflow-hidden rounded-xl bg-white px-2 py-5 shadow-lg'>
            <div className='relative px-6'>
                <div className='mb-6 flex flex-col sm:flex-row sm:items-start sm:space-x-6'>
                    <ProfileImage
                        user={userProfile}
                        isOwnProfile={isOwnProfile}
                    />

                    <div className='mt-4 flex-grow sm:mt-0'>
                        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between'>
                            <div className='flex flex-col gap-0.5'>
                                <h1 className='text-2xl font-bold text-slate-700'>
                                    {userProfile.name} {userProfile.surname}
                                </h1>
                                <div className='mt-1 flex items-center space-x-4 text-sm text-gray-600'>
                                    <span className='capitalize'>
                                        {userProfile.gender}
                                    </span>
                                    <span>
                                        Age {getAge(userProfile.dateOfBirth)}
                                    </span>
                                    {(userProfile.city ||
                                        userProfile.region) && (
                                        <div className='flex items-center space-x-1'>
                                            <IconMapPin size={14} />
                                            <span>
                                                {userProfile.city}
                                                {userProfile.region &&
                                                    `, ${userProfile.region}`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className='flex gap-4 text-sm text-gray-600'>
                                    <div className='flex items-center space-x-2'>
                                        <IconCake size={16} />
                                        <span>
                                            {formatBirthDate(
                                                userProfile.dateOfBirth
                                            )}
                                        </span>
                                    </div>

                                    <div className='flex items-center space-x-2'>
                                        <IconCalendar size={16} />
                                        <span>
                                            {formatDate(userProfile.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className='flex space-x-3 sm:mt-0'>
                                {isOwnProfile ? (
                                    <EditProfileForm user={userProfile} />
                                ) : (
                                    <FriendshipButton
                                        friendshipStatus={
                                            userProfile.friendshipStatus
                                        }
                                    />
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className='mt-2 flex space-x-8'>
                            <div
                                className='cursor-pointer text-center'
                                onClick={() => setSelectedView('posts')}
                            >
                                <div className='text-lg font-bold text-slate-600'>
                                    {formatNumber(89)}
                                </div>
                                <div className='text-sm text-gray-600'>
                                    Posts
                                </div>
                            </div>
                            <div
                                className='cursor-pointer text-center'
                                onClick={() => setSelectedView('friends')}
                            >
                                <div className='text-lg font-bold text-slate-600'>
                                    {formatNumber(1234)}
                                </div>
                                <div className='text-sm text-gray-600'>
                                    Friends
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {userProfile.bio && (
                    <div className='mb-6'>
                        <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                            About
                        </h3>
                        <p className='leading-relaxed text-gray-700'>
                            {userProfile.bio}
                        </p>
                    </div>
                )}
            </div>
            {selectedView === 'posts' ? <PostsList /> : <FriendsList />}
        </div>
    );
}
