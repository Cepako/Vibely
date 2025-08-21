import { IconCamera, IconVideo } from '@tabler/icons-react';
import UserAvatar from '../ui/UserAvatar';
import { Dialog, useDialog } from '../ui/Dialog';
import AddPostForm from '../post/AddPostForm';
import { useCurrentUser } from '../hooks/useCurrentUser';

export default function CreatePostCard() {
    const currentUser = useCurrentUser();
    const addPostDialog = useDialog(false);

    if (!currentUser.data) return null;

    return (
        <div className='mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm'>
            <div className='mb-3 flex items-center space-x-3'>
                <UserAvatar user={currentUser.data} size='md' />
                <button
                    onClick={() => addPostDialog.openDialog()}
                    className='flex-1 cursor-pointer rounded-full bg-slate-100 px-4 py-2 text-left text-slate-500 transition-colors hover:bg-slate-200'
                >
                    What's on your mind, {currentUser.data.name}?
                </button>
            </div>

            <div className='flex space-x-4 border-t border-slate-100 pt-2'>
                <button
                    onClick={() => addPostDialog.openDialog()}
                    className='flex flex-1 cursor-pointer items-center justify-center space-x-2 rounded-lg py-2 text-slate-600 hover:bg-slate-50'
                >
                    <IconCamera size={20} className='text-green-600' />
                    <span className='font-medium'>Photo</span>
                </button>
                <button
                    onClick={() => addPostDialog.openDialog()}
                    className='flex flex-1 cursor-pointer items-center justify-center space-x-2 rounded-lg py-2 text-slate-600 hover:bg-slate-50'
                >
                    <IconVideo size={20} className='text-blue-600' />
                    <span className='font-medium'>Video</span>
                </button>
            </div>

            <Dialog
                isOpen={addPostDialog.isOpen}
                onClose={addPostDialog.closeDialog}
                size='xl'
            >
                <AddPostForm
                    profileId={currentUser.data.id}
                    onClose={addPostDialog.closeDialog}
                />
            </Dialog>
        </div>
    );
}
