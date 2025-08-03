import { IconX } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { useUpdatePost, type UpdatePostData } from './hooks/usePosts';
import type { Post } from '../../types/post';
import PrivacyLevelSelect from './PrivacyLevelSelect';

interface EditPostFormProps {
    post: Post;
    onClose: () => void;
}

function EditPostForm({ post, onClose }: EditPostFormProps) {
    const updatePostMutation = useUpdatePost(post.userId);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isValid, isDirty },
    } = useForm<UpdatePostData>({
        defaultValues: {
            content: post.content,
            privacyLevel: post.privacyLevel,
        },
        mode: 'onChange',
    });

    const privacyLevel = watch('privacyLevel');

    const onSubmit = (data: UpdatePostData) => {
        updatePostMutation.mutate({
            postId: post.id,
            data: {
                content: data.content,
                privacyLevel: data.privacyLevel,
            },
        });

        onClose();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const hasChanges = isDirty && isValid;

    return (
        <div
            className='h-full w-full rounded-lg bg-white px-3 py-2 shadow-xl'
            onClick={(e) => e.stopPropagation()}
        >
            <div className='flex items-center justify-between pb-1'>
                <h2 className='text-lg font-bold text-slate-800'>Edit Post</h2>
                <button
                    onClick={handleClose}
                    className='cursor-pointer rounded-full p-1 transition-colors hover:bg-slate-100'
                >
                    <IconX className='h-5 w-5 text-slate-500 duration-200 hover:text-slate-700' />
                </button>
            </div>

            <div>
                {post.contentUrl && (
                    <div className='mb-4'>
                        <label className='mb-2 block text-sm font-medium text-slate-700'>
                            Current Media
                        </label>
                        <div className='relative h-44 overflow-hidden rounded-lg bg-slate-100'>
                            {post.contentType === 'video' ? (
                                <video
                                    src={post.contentUrl}
                                    className='h-44 w-full object-cover'
                                    controls
                                />
                            ) : (
                                <img
                                    src={post.contentUrl}
                                    alt='Post media'
                                    className='h-44 w-full object-cover'
                                />
                            )}
                        </div>
                        <p className='mt-1 text-xs text-slate-500'>
                            Media cannot be changed when editing
                        </p>
                    </div>
                )}

                <div className='mb-4'>
                    <label
                        htmlFor='content'
                        className='mb-2 block text-sm font-medium text-slate-700'
                    >
                        Edit your post
                    </label>
                    <textarea
                        {...register('content', {
                            required: 'Content is required',
                            maxLength: {
                                value: 2000,
                                message:
                                    'Content must be less than 2000 characters',
                            },
                        })}
                        id='content'
                        rows={4}
                        className='focus:border-primary-500 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 outline-none'
                        placeholder='Share your thoughts...'
                    />
                    {errors.content && (
                        <p className='mt-1 text-sm text-red-600'>
                            {errors.content.message}
                        </p>
                    )}
                </div>

                <PrivacyLevelSelect
                    register={register}
                    selectedPrivacy={privacyLevel}
                />

                <div className='flex space-x-3'>
                    <button
                        type='button'
                        onClick={handleClose}
                        className='flex-1 cursor-pointer rounded-lg bg-slate-100 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-200'
                    >
                        Cancel
                    </button>
                    <button
                        type='submit'
                        onClick={handleSubmit(onSubmit)}
                        disabled={!hasChanges || updatePostMutation.isPending}
                        className='bg-primary-600 hover:bg-primary-700 flex-1 cursor-pointer rounded-lg px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                    >
                        {updatePostMutation.isPending
                            ? 'Saving...'
                            : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditPostForm;
