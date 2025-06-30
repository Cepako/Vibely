import React from 'react';
import {
    IconUser,
    IconEdit,
    IconMapPin,
    IconCalendar,
    IconCamera,
    IconMessageCircle,
    IconCake,
} from '@tabler/icons-react';

interface UserProfile {
    id: string;
    name: string;
    surname: string;
    email: string;
    gender: 'male' | 'female';
    bio: string;
    city?: string;
    region?: string;
    created_at: string;
    dateOfBirth: string;
    profilePicture?: string;
    friendsCount: number;
    postsCount: number;
    isOnline?: boolean;
    isFollowing?: boolean;
    isOwnProfile: boolean;
}

interface UserProfileProps {
    user?: UserProfile;
    onFollow?: (userId: string) => void;
    onUnfollow?: (userId: string) => void;
    onEditProfile?: () => void;
    onMessage?: (userId: string) => void;
}

const UserProfileComponent: React.FC<UserProfileProps> = ({
    user,
    onFollow,
    onUnfollow,
    onEditProfile,
    onMessage,
}) => {
    // Default user data for demo
    const defaultUser: UserProfile = {
        id: '1',
        name: 'John',
        surname: 'Doe',
        email: 'john.doe@example.com',
        gender: 'male',
        bio: 'Passionate developer and coffee enthusiast. Love building amazing web experiences and connecting with like-minded people. Always learning something new! 🚀',
        city: 'San Francisco',
        region: 'CA',
        created_at: '2023-01-15',
        dateOfBirth: '1990-05-15',
        profilePicture:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        friendsCount: 1234,
        postsCount: 89,
        isFollowing: false,
        isOwnProfile: true,
    };

    const currentUser = user || defaultUser;

    const handleFollow = () => {
        if (currentUser.isFollowing && onUnfollow) {
            onUnfollow(currentUser.id);
        } else if (!currentUser.isFollowing && onFollow) {
            onFollow(currentUser.id);
        }
    };

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

    return (
        <div className='mx-auto my-5 w-full max-w-4xl overflow-hidden rounded-xl bg-white px-2 py-5 shadow-lg'>
            <div className='relative px-6 pb-6'>
                {/* Profile Picture and Basic Info */}
                <div className='mb-6 flex flex-col sm:flex-row sm:items-start sm:space-x-6'>
                    <div className='relative flex-shrink-0'>
                        <div className='flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white'>
                            {currentUser.profilePicture ? (
                                <img
                                    src={currentUser.profilePicture}
                                    alt={`${currentUser.name} ${currentUser.surname}`}
                                    className='h-full w-full object-cover'
                                />
                            ) : (
                                <IconUser size={48} className='text-white' />
                            )}
                        </div>
                        {currentUser.isOwnProfile && (
                            <button className='bg-primary-500 hover:bg-primary-600 absolute right-2 bottom-2 cursor-pointer rounded-full p-2 text-white transition-colors duration-200'>
                                <IconCamera size={16} />
                            </button>
                        )}
                        {/* Online Status */}
                        {currentUser.isOnline && (
                            <div className='absolute -right-1 -bottom-1 h-6 w-6 rounded-full border-2 border-white bg-green-500'></div>
                        )}
                    </div>

                    {/* Basic Info next to image */}
                    <div className='mt-4 flex-grow sm:mt-0'>
                        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between'>
                            <div className='flex flex-col gap-0.5'>
                                <h1 className='text-2xl font-bold text-slate-700'>
                                    {currentUser.name} {currentUser.surname}
                                </h1>
                                <div className='mt-1 flex items-center space-x-4 text-sm text-gray-600'>
                                    <span className='capitalize'>
                                        {currentUser.gender}
                                    </span>
                                    <span>
                                        Age {getAge(currentUser.dateOfBirth)}
                                    </span>
                                    {currentUser.city && currentUser.region && (
                                        <div className='flex items-center space-x-1'>
                                            <IconMapPin size={14} />
                                            <span>
                                                {currentUser.city},{' '}
                                                {currentUser.region}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className='flex gap-4 text-sm text-gray-600'>
                                    <div className='flex items-center space-x-2'>
                                        <IconCake size={16} />
                                        <span>
                                            {formatBirthDate(
                                                currentUser.dateOfBirth
                                            )}
                                        </span>
                                    </div>

                                    <div className='flex items-center space-x-2'>
                                        <IconCalendar size={16} />
                                        <span>
                                            {formatDate(currentUser.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className='flex space-x-3 sm:mt-0'>
                                {currentUser.isOwnProfile ? (
                                    <button
                                        onClick={onEditProfile}
                                        className='flex cursor-pointer items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200'
                                    >
                                        <IconEdit size={16} />
                                        <span>Edit Profile</span>
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleFollow}
                                            className={`rounded-lg px-6 py-2 font-medium transition-colors ${
                                                currentUser.isFollowing
                                                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                        >
                                            {currentUser.isFollowing
                                                ? 'Following'
                                                : 'Follow'}
                                        </button>
                                        <button
                                            onClick={() =>
                                                onMessage?.(currentUser.id)
                                            }
                                            className='flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200'
                                        >
                                            <IconMessageCircle size={16} />
                                            <span>Message</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className='mt-2 flex space-x-8'>
                            <div className='text-center'>
                                <div className='text-lg font-bold text-slate-600'>
                                    {formatNumber(currentUser.postsCount)}
                                </div>
                                <div className='text-sm text-gray-600'>
                                    Posts
                                </div>
                            </div>
                            <div className='text-center'>
                                <div className='text-lg font-bold text-slate-600'>
                                    {formatNumber(currentUser.friendsCount)}
                                </div>
                                <div className='text-sm text-gray-600'>
                                    Friends
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bio Section */}
                {currentUser.bio && (
                    <div className='mb-6'>
                        <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                            About
                        </h3>
                        <p className='leading-relaxed text-gray-700'>
                            {currentUser.bio}
                        </p>
                    </div>
                )}
            </div>
            {/* TODO: Fetch and display Users posts
                    when clicked friends switch to users friends list 
            */}
        </div>
    );
};

export default UserProfileComponent;
