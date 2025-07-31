import { Dialog, useDialog } from '../ui/Dialog';
import AddPostForm from '../post/AddPostForm';
import { usePosts } from '../post/hooks/usePosts';
import { IconCalendarPlus } from '@tabler/icons-react';

interface PostsListProps {
    profileId: number;
}

export default function PostsList({ profileId }: PostsListProps) {
    const dialog = useDialog(false);
    const posts = usePosts(profileId);
    return (
        <div className='h-hull w-full px-6'>
            <div className='flex items-center gap-3'>
                <h2 className='text-xl font-bold'>Posts</h2>
                <div
                    className='bg-primary-50 text-primary-600 border-primary-400 hover:text-primary-700 hover:bg-primary-100 flex cursor-pointer items-center gap-1 rounded-3xl border px-3 py-1 duration-200'
                    onClick={dialog.openDialog}
                >
                    Add post <IconCalendarPlus size={18} />
                </div>
            </div>

            <Dialog
                isOpen={dialog.isOpen}
                onClose={dialog.closeDialog}
                size='xl'
            >
                <AddPostForm
                    profileId={profileId}
                    onClose={dialog.closeDialog}
                />
            </Dialog>
        </div>
    );
}
