import {
    IconCamera,
    IconTrash,
    IconUpload,
    IconUserFilled,
    IconX,
} from '@tabler/icons-react';
import Tooltip from '../ui/Tooltip';
import { cn, formatTimeAgo } from '../../utils/utils';
import { Dialog, useDialog } from '../ui/Dialog';
import { useRef, useState } from 'react';
import { useChangeProfileImage } from './hooks/useChangeProfileImage';

interface ProfileImageProps {
    user: {
        id: number;
        name: string;
        surname: string;
        isOnline: boolean;
        lastLoginAt?: string;
        profilePictureUrl?: string;
    };
    isOwnProfile: boolean;
}

export default function ProfileImage({
    user,
    isOwnProfile,
}: ProfileImageProps) {
    const { name, surname, profilePictureUrl, isOnline, lastLoginAt, id } =
        user;

    return (
        <div className='relative flex-shrink-0'>
            <div className='flex h-30 w-30 items-center justify-center overflow-hidden rounded-full border-2 border-slate-300'>
                {profilePictureUrl ? (
                    <img
                        src={profilePictureUrl}
                        alt={`${name} ${surname}`}
                        className='h-full w-full object-cover'
                    />
                ) : (
                    <IconUserFilled size={48} className='' />
                )}
            </div>
            {isOwnProfile && (
                <ChangeProfileImage
                    currentProfileImage={profilePictureUrl}
                    profileId={id}
                    userName={name}
                />
            )}
            {!isOwnProfile && (
                <Tooltip
                    content={
                        <span className='capitalize'>
                            {isOnline
                                ? 'Active'
                                : lastLoginAt
                                  ? `${formatTimeAgo(lastLoginAt)}`
                                  : 'Inactive'}
                        </span>
                    }
                >
                    <div
                        className={cn(
                            'absolute right-1 bottom-1 h-6 w-6 rounded-full border-2 border-white',
                            isOnline ? 'bg-green-500' : 'bg-rose-500'
                        )}
                    ></div>
                </Tooltip>
            )}
        </div>
    );
}

interface ChangeProfileImageProps {
    currentProfileImage?: string;
    profileId: number;
    userName: string;
}

function ChangeProfileImage({
    currentProfileImage,
    profileId,
    userName,
}: ChangeProfileImageProps) {
    const dialog = useDialog(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const changeProfileImageMutation = useChangeProfileImage(profileId);

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }

            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        const formData = new FormData();
        if (selectedImage) {
            formData.append('profilePicture', selectedImage);
        }

        changeProfileImageMutation.mutate(formData);
        handleClose();
    };

    const handleRemove = () => {
        const formData = new FormData();
        // Empty FormData means remove the profile picture
        changeProfileImageMutation.mutate(formData);
        handleClose();
    };

    const handleClose = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        dialog.closeDialog();
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            <Dialog
                isOpen={dialog.isOpen}
                onClose={dialog.closeDialog}
                placement='center'
                className='-translate-y-32'
            >
                <div className='p-6'>
                    <div className='mb-4 flex items-center justify-between'>
                        <h2 className='text-lg font-semibold text-gray-900'>
                            Change Profile Picture
                        </h2>
                        <button
                            onClick={handleClose}
                            className='text-gray-400 transition-colors hover:text-gray-600'
                        >
                            <IconX size={20} className='cursor-pointer' />
                        </button>
                    </div>

                    <div className='mb-6 flex flex-col items-center'>
                        <div className='mb-4 h-32 w-32 overflow-hidden rounded-full border-2 border-gray-300'>
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt='Preview'
                                    className='h-full w-full object-cover'
                                />
                            ) : currentProfileImage ? (
                                <img
                                    src={currentProfileImage}
                                    alt={userName}
                                    className='h-full w-full object-cover'
                                />
                            ) : (
                                <div className='flex h-full w-full items-center justify-center bg-gray-100'>
                                    <IconUserFilled
                                        size={48}
                                        className='text-gray-400'
                                    />
                                </div>
                            )}
                        </div>

                        {selectedImage && (
                            <p className='mb-2 text-sm text-gray-600'>
                                Selected: {selectedImage.name}
                            </p>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type='file'
                        accept='image/*'
                        onChange={handleImageSelect}
                        className='hidden'
                    />

                    <div className='space-y-3'>
                        <button
                            onClick={handleBrowseClick}
                            className='bg-primary-600 hover:bg-primary-700 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2 text-white transition-colors'
                        >
                            <IconUpload size={16} />
                            {currentProfileImage
                                ? 'Change Picture'
                                : 'Upload Picture'}
                        </button>

                        {currentProfileImage && (
                            <button
                                onClick={handleRemove}
                                className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-rose-500 px-4 py-2 text-white transition-colors hover:bg-rose-600'
                            >
                                <IconTrash size={16} />
                                Remove Picture
                            </button>
                        )}

                        {selectedImage && (
                            <button
                                onClick={handleSave}
                                disabled={changeProfileImageMutation.isPending}
                                className='w-full cursor-pointer rounded-md bg-emerald-500 px-4 py-2 text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                {changeProfileImageMutation.isPending
                                    ? 'Saving...'
                                    : 'Save Changes'}
                            </button>
                        )}

                        <button
                            onClick={handleClose}
                            className='w-full cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-slate-100'
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Dialog>
            <button
                className='bg-primary-500 hover:bg-primary-600 absolute right-1 bottom-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-white transition-colors duration-200'
                onClick={() => dialog.openDialog()}
            >
                <IconCamera size={16} />
            </button>
        </>
    );
}
