import {
    IconLock,
    IconPhoto,
    IconUpload,
    IconUsers,
    IconVideo,
    IconWorld,
    IconX,
} from '@tabler/icons-react';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreatePost, type CreatePostData } from './hooks/usePosts';

interface AddPostFormProps {
    profileId: number;
    onClose: () => void;
}

function AddPostForm({ profileId, onClose }: AddPostFormProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileTypeError, setFileTypeError] = useState<string>('');

    const createPostMutation = useCreatePost(profileId);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isValid },
    } = useForm<CreatePostData>({
        defaultValues: {
            content: '',
            contentType: 'photo',
            privacyLevel: 'public',
        },
        mode: 'onChange',
    });

    const contentType = watch('contentType');
    const privacyLevel = watch('privacyLevel');

    useEffect(() => {
        if (selectedFile && contentType) {
            const isVideo = selectedFile.type.startsWith('video/');
            const isImage = selectedFile.type.startsWith('image/');

            if (contentType === 'video' && !isVideo) {
                setFileTypeError('Please upload a video file.');
            } else if (contentType === 'photo' && !isImage) {
                setFileTypeError('Please upload an image file.');
            } else {
                setFileTypeError('');
            }
        } else {
            setFileTypeError('');
        }
    }, [selectedFile, contentType]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);

            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFileTypeError('');
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }

        const fileInput = document.getElementById(
            'file-input'
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const onSubmit = (data: CreatePostData) => {
        if (fileTypeError) {
            return;
        }

        createPostMutation.mutate({
            content: data.content,
            contentType: data.contentType,
            privacyLevel: data.privacyLevel,
            file: selectedFile,
        });

        reset();
        removeFile();
        onClose();
    };

    const handleClose = () => {
        reset();
        removeFile();
        onClose();
    };

    const isFormValid = isValid && !fileTypeError;

    return (
        <div className='h-full w-full rounded-lg bg-white px-3 py-2 shadow-xl'>
            <div className='flex items-center justify-between pb-1'>
                <h2 className='text-lg font-bold text-slate-800'>
                    Create Post
                </h2>
                <button
                    onClick={handleClose}
                    className='cursor-pointer rounded-full p-1 transition-colors hover:bg-slate-100'
                >
                    <IconX className='h-5 w-5 text-slate-500 duration-200 hover:text-slate-700' />
                </button>
            </div>

            <div>
                <div className='mb-4'>
                    <label className='mb-2 block text-sm font-medium text-slate-700'>
                        Post Type
                    </label>
                    <div className='flex space-x-3'>
                        <label className='flex items-center'>
                            <input
                                {...register('contentType')}
                                type='radio'
                                value='photo'
                                className='sr-only'
                            />
                            <div
                                className={`flex cursor-pointer items-center space-x-2 rounded-lg border px-3 py-2 transition-colors ${
                                    contentType === 'photo'
                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                        : 'border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <IconPhoto className='h-4 w-4' />
                                <span className='text-sm'>Photo</span>
                            </div>
                        </label>

                        <label className='flex items-center'>
                            <input
                                {...register('contentType')}
                                type='radio'
                                value='video'
                                className='sr-only'
                            />
                            <div
                                className={`flex cursor-pointer items-center space-x-2 rounded-lg border px-3 py-2 transition-colors ${
                                    contentType === 'video'
                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                        : 'border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <IconVideo className='h-4 w-4' />
                                <span className='text-sm'>Video</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className='mb-4'>
                    <label
                        htmlFor='content'
                        className='mb-2 block text-sm font-medium text-slate-700'
                    >
                        What's on your mind?
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

                <div className='mb-4'>
                    <label className='mb-2 block text-sm font-medium text-slate-700'>
                        Add Media
                    </label>

                    {!selectedFile ? (
                        <div className='rounded-lg border-2 border-dashed border-slate-300 p-6 text-center transition-colors hover:border-slate-400'>
                            <input
                                id='file-input'
                                type='file'
                                accept={
                                    contentType === 'video'
                                        ? 'video/*'
                                        : 'image/*'
                                }
                                onChange={handleFileChange}
                                className='sr-only'
                            />
                            <label
                                htmlFor='file-input'
                                className='cursor-pointer'
                            >
                                <IconUpload className='mx-auto mb-2 h-8 w-8 text-slate-400' />
                                <p className='text-sm text-slate-600'>
                                    Click to upload{' '}
                                    {contentType === 'video'
                                        ? 'video'
                                        : 'image'}
                                </p>
                                <p className='mt-1 text-xs text-slate-500'>
                                    {contentType === 'video'
                                        ? 'MP4, MOV up to 100MB'
                                        : 'PNG, JPG up to 50MB'}
                                </p>
                            </label>
                        </div>
                    ) : (
                        <div className='relative'>
                            {previewUrl && (
                                <div className='relative h-44 overflow-hidden rounded-lg bg-slate-100'>
                                    {contentType === 'video' ? (
                                        <video
                                            src={previewUrl}
                                            className='h-44 w-full object-cover'
                                            controls
                                        />
                                    ) : (
                                        <img
                                            src={previewUrl}
                                            alt='Preview'
                                            className='h-44 w-full object-cover'
                                        />
                                    )}
                                    <button
                                        type='button'
                                        onClick={removeFile}
                                        className='absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600'
                                    >
                                        <IconX className='h-4 w-4 cursor-pointer' />
                                    </button>
                                </div>
                            )}
                            <p className='mt-2 text-sm text-slate-600'>
                                {selectedFile.name}
                            </p>
                        </div>
                    )}

                    {fileTypeError && (
                        <div className='mt-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1'>
                            <p className='flex gap-1 text-sm text-red-600'>
                                <span className='font-bold'>
                                    Type mismatch!
                                </span>
                                {fileTypeError}
                            </p>
                        </div>
                    )}
                </div>

                <div className='mb-6'>
                    <label className='mb-2 block text-sm font-medium text-slate-700'>
                        Privacy
                    </label>
                    <div className='space-y-2'>
                        <label className='flex items-center'>
                            <input
                                {...register('privacyLevel')}
                                type='radio'
                                value='public'
                                className='sr-only'
                            />
                            <div
                                className={`flex w-full cursor-pointer items-center space-x-3 rounded-lg border px-3 py-2 transition-colors ${
                                    privacyLevel === 'public'
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <IconWorld className='h-4 w-4 text-slate-600' />
                                <div>
                                    <p className='text-sm font-medium'>
                                        Public
                                    </p>
                                    <p className='text-xs text-slate-500'>
                                        Anyone can see this post
                                    </p>
                                </div>
                            </div>
                        </label>

                        <label className='flex items-center'>
                            <input
                                {...register('privacyLevel')}
                                type='radio'
                                value='friends'
                                className='sr-only'
                            />
                            <div
                                className={`flex w-full cursor-pointer items-center space-x-3 rounded-lg border px-3 py-2 transition-colors ${
                                    privacyLevel === 'friends'
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <IconUsers className='h-4 w-4 text-slate-600' />
                                <div>
                                    <p className='text-sm font-medium'>
                                        Friends
                                    </p>
                                    <p className='text-xs text-slate-500'>
                                        Only friends can see this post
                                    </p>
                                </div>
                            </div>
                        </label>

                        <label className='flex items-center'>
                            <input
                                {...register('privacyLevel')}
                                type='radio'
                                value='private'
                                className='sr-only'
                            />
                            <div
                                className={`flex w-full cursor-pointer items-center space-x-3 rounded-lg border px-3 py-2 transition-colors ${
                                    privacyLevel === 'private'
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <IconLock className='h-4 w-4 text-slate-600' />
                                <div>
                                    <p className='text-sm font-medium'>
                                        Private
                                    </p>
                                    <p className='text-xs text-slate-500'>
                                        Only you can see this post
                                    </p>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

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
                        disabled={!isFormValid || createPostMutation.isPending}
                        className='bg-primary-600 hover:bg-primary-700 flex-1 cursor-pointer rounded-lg px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                    >
                        {createPostMutation.isPending ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddPostForm;
