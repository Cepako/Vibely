import {
    IconMapPin,
    IconCalendar,
    IconCake,
    IconMessage,
} from '@tabler/icons-react';
import { useProfile } from '../hooks/useProfile';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useAuth } from '../auth/AuthProvider';
import FriendshipButton from './FriendshipButton';
import { useMemo, useState } from 'react';
import PostsList from './PostsList';
import FriendsList from './FriendsList';
import EditProfileForm from './EditProfileForm';
import ProfileImage from './ProfileImage';
import { cn } from '../../utils/utils';
import { usePosts } from '../post/hooks/usePosts';
import { useBlockUser, useFriends } from './hooks/useFriendship';
import { Dialog, useDialog } from '../ui/Dialog';
import { useConversations } from '../messages/hooks/useConversations';
import ChangePasswordDialog from './ChangePasswordDialog';

export default function ProfileView() {
    const params = useParams({ from: '/profile/$profileId' });
    const [selectedView, setSelectedView] = useState<'posts' | 'friends'>(
        'posts'
    );
    const posts = usePosts(Number(params.profileId));
    const { user } = useAuth();
    const { data, isLoading } = useProfile(Number(params.profileId));
    const userProfile = data;
    const navigate = useNavigate();
    const { conversations } = useConversations();
    const conversationId = conversations
        ? conversations.find(
              (c) =>
                  c.type === 'direct' &&
                  c.participants.some(
                      (p) => p.userId === Number(params.profileId)
                  )
          )?.id
        : undefined;

    const blockUserMutation = useBlockUser();

    const { data: friends } = useFriends(Number(params.profileId));
    const friendsCount = friends?.length || 0;
    const blockDialog = useDialog();

    const postsData = useMemo(() => {
        if (!posts.data) return [];
        return posts.data;
    }, [posts]);

    const isOwnProfile = user?.id === userProfile?.id;

    const handleBlockUser = async () => {
        try {
            await blockUserMutation.mutateAsync(userProfile!.id);
            navigate({
                to: '/profile/$profileId',
                params: { profileId: user!.id.toString() },
            });
            blockDialog.closeDialog();
        } catch (error) {
            console.error('Failed to block user:', error);
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

    if (!userProfile)
        return (
            <div className='flex h-full w-full items-center justify-center text-3xl font-semibold text-slate-700'>
                Profile not found
            </div>
        );

    if (isLoading) {
        return <div>Loading profile...</div>; //TODO: Loader
    }

    return (
        <div className='w-full overflow-y-auto rounded-xl px-2 py-5 shadow-lg'>
            <div className='mx-auto w-full max-w-5xl overflow-hidden rounded-xl bg-white px-2 py-5 shadow-lg'>
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
                                            Age{' '}
                                            {getAge(userProfile.dateOfBirth)}
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
                                                {formatDate(
                                                    userProfile.createdAt
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex space-x-3 sm:mt-0'>
                                    {!isOwnProfile && conversationId && (
                                        <div
                                            className='bg-primary-600 hover:bg-primary-700 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-white duration-150'
                                            onClick={() => {
                                                navigate({
                                                    to: '/messages/$conversationId',
                                                    params: {
                                                        conversationId:
                                                            conversationId.toString(),
                                                    },
                                                });
                                            }}
                                        >
                                            <IconMessage size={18} /> Message
                                        </div>
                                    )}
                                    {isOwnProfile ? (
                                        <>
                                            <EditProfileForm
                                                user={userProfile}
                                            />
                                            <ChangePasswordDialog />
                                        </>
                                    ) : (
                                        <FriendshipButton
                                            friendshipStatus={
                                                userProfile.friendshipStatus
                                            }
                                            openBlockDialog={
                                                blockDialog.openDialog
                                            }
                                        />
                                    )}
                                </div>
                            </div>

                            <div className='mt-2 flex space-x-8'>
                                <div
                                    className={cn(
                                        'cursor-pointer text-center',
                                        selectedView === 'posts'
                                            ? 'text-slate-800'
                                            : 'text-slate-500'
                                    )}
                                    onClick={() => setSelectedView('posts')}
                                >
                                    <div className='text-lg font-bold'>
                                        {formatNumber(postsData.length)}
                                    </div>
                                    <div className='text-sm'>Posts</div>
                                </div>
                                <div
                                    className={cn(
                                        'cursor-pointer text-center',
                                        selectedView === 'friends'
                                            ? 'text-slate-800'
                                            : 'text-slate-500'
                                    )}
                                    onClick={() => setSelectedView('friends')}
                                >
                                    <div className='text-lg font-bold'>
                                        {formatNumber(friendsCount)}
                                    </div>
                                    <div className='text-sm'>Friends</div>
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

                    {userProfile.interests &&
                        userProfile.interests.length > 0 && (
                            <div className='mb-6'>
                                <h3 className='mb-2 font-semibold text-gray-900'>
                                    Interests
                                </h3>
                                <div className='flex max-h-[100px] flex-wrap gap-2 overflow-y-auto'>
                                    {userProfile.interests.map((it) => (
                                        <span
                                            key={it.id}
                                            className='bg-primary-100 text-primary-700 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm'
                                        >
                                            {it.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                </div>
                {selectedView === 'posts' ? (
                    <PostsList profileId={userProfile.id} posts={postsData} />
                ) : (
                    <FriendsList userId={userProfile.id} />
                )}
            </div>
            <Dialog
                isOpen={blockDialog.isOpen}
                onClose={blockDialog.closeDialog}
            >
                <div className='flex flex-col gap-2 p-4'>
                    <div>
                        Are you sure you want to block{' '}
                        <span className='text-primary-700 font-bold'>
                            {userProfile.name} {userProfile.surname}
                        </span>
                        ?
                    </div>
                    <div className='text-sm text-slate-500'>
                        After blocking, you’ll be redirected to your profile and
                        will no longer be able to view {userProfile.name}’s
                        profile.
                    </div>
                    <div className='flex justify-end gap-2'>
                        <div
                            className='cursor-pointer rounded-xl bg-rose-500 px-4 py-2 text-white duration-150 hover:bg-rose-600'
                            onClick={handleBlockUser}
                        >
                            Confirm
                        </div>
                        <div
                            className='cursor-pointer rounded-xl bg-slate-500 px-4 py-2 text-white duration-150 hover:bg-slate-600'
                            onClick={blockDialog.closeDialog}
                        >
                            Cancel
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
