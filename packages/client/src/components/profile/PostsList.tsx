import { Dialog, useDialog } from '../ui/Dialog';
import AddPostForm from '../post/AddPostForm';
import { IconCalendarPlus } from '@tabler/icons-react';
import { useCallback } from 'react';
import type { Post } from '../../types/post';
import { useAuth } from '../auth/AuthProvider';
import { ProfilePostCard } from '../post/ProfilePostCard';
import { useNavigate } from '@tanstack/react-router';

interface PostsListProps {
    profileId: number;
    posts: Array<Post>;
}

export default function PostsList({ profileId, posts }: PostsListProps) {
    const addPostDialog = useDialog(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const isOwnProfile = user?.id === profileId;

    const handlePostClick = useCallback(
        (post: Post) => {
            navigate({
                to: '/post/$postId',
                params: {
                    postId: String(post.id),
                },
            });
        },
        [navigate, profileId]
    );

    return (
        <div className='h-hull flex w-full flex-col gap-4 px-6'>
            <div className='flex items-center gap-3'>
                <h2 className='text-xl font-bold'>Posts</h2>
                {isOwnProfile && (
                    <div
                        className='bg-primary-50 text-primary-600 border-primary-400 hover:text-primary-700 hover:bg-primary-100 flex cursor-pointer items-center gap-1 rounded-3xl border px-3 py-1 duration-200'
                        onClick={addPostDialog.openDialog}
                    >
                        Add post <IconCalendarPlus size={18} />
                    </div>
                )}
            </div>
            {posts.length === 0 && (
                <div className='flex w-full items-center justify-center py-5 text-xl font-semibold text-slate-400'>
                    There is no posts yet!
                </div>
            )}

            <div className='flex flex-wrap items-center gap-3'>
                {posts.map((post) => (
                    <ProfilePostCard
                        key={post.id}
                        post={post}
                        onClick={() => handlePostClick(post)}
                    />
                ))}
            </div>

            <Dialog
                isOpen={addPostDialog.isOpen}
                onClose={addPostDialog.closeDialog}
                size='xl'
            >
                <AddPostForm
                    profileId={profileId}
                    onClose={addPostDialog.closeDialog}
                />
            </Dialog>
        </div>
    );
}
