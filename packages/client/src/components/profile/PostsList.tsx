import { Dialog, useDialog } from '../ui/Dialog';
import AddPostForm from '../post/AddPostForm';
import { IconCalendarPlus } from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import type { Post } from '../../types/post';
import { useAuth } from '../auth/AuthProvider';
import { ProfilePostCard } from '../post/ProfilePostCard';
import PostDetails from '../post/PostDetails';

interface PostsListProps {
    profileId: number;
    posts: Array<Post>;
}

export default function PostsList({ profileId, posts }: PostsListProps) {
    const addPostDialog = useDialog(false);
    const postDialog = useDialog(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [selectedPostIndex, setSelectedPostIndex] = useState<number>(0);
    const { user } = useAuth();

    const isOwnProfile = user?.id === profileId;

    const handlePostClick = useCallback(
        (post: Post) => {
            const index = posts.findIndex((p) => p.id === post.id);
            setSelectedPostIndex(index);
            setSelectedPost(post);
            postDialog.openDialog();
        },
        [posts]
    );
    const handlePreviousPost = useCallback(() => {
        if (selectedPostIndex > 0) {
            const newIndex = selectedPostIndex - 1;
            setSelectedPostIndex(newIndex);
            setSelectedPost(posts[newIndex]);
        }
    }, [selectedPostIndex]);

    const handleNextPost = useCallback(() => {
        if (selectedPostIndex < posts.length - 1) {
            const newIndex = selectedPostIndex + 1;
            setSelectedPostIndex(newIndex);
            setSelectedPost(posts[newIndex]);
        }
    }, [posts, selectedPostIndex]);

    const hasPrevious = selectedPostIndex > 0;
    const hasNext = selectedPostIndex < posts.length - 1;

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
                isOpen={postDialog.isOpen}
                onClose={postDialog.closeDialog}
                placement='center'
                size='full'
            >
                {selectedPost && (
                    <PostDetails
                        post={selectedPost}
                        onClose={postDialog.closeDialog}
                        onPrevious={
                            hasPrevious ? handlePreviousPost : undefined
                        }
                        onNext={hasNext ? handleNextPost : undefined}
                        hasPrevious={hasPrevious}
                        hasNext={hasNext}
                    />
                )}
            </Dialog>

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
