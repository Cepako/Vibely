import { useState } from 'react';
import { useRegistration } from './RegistrationProvider';
import Button from '../ui/Button';
import { IconTrash, IconUserFilled } from '@tabler/icons-react';
import Tooltip from '../ui/Tooltip';

export const ProfilePictureStep: React.FC = () => {
    const { formData, updateFormData, prevStep, submitRegistration } =
        useRegistration();
    const [selectedImage, setSelectedImage] = useState<string>(
        formData.profilePicture || ''
    );
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                setSelectedImage(imageUrl);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage('');
        const fileInput = document.querySelector(
            'input[type="file"]'
        ) as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = () => {
        updateFormData({ profilePicture: selectedImage });
        submitRegistration();
    };

    const handleSkip = () => {
        updateFormData({ profilePicture: '' });
        submitRegistration();
    };

    return (
        <>
            <h2 className='mb-4 text-2xl font-semibold text-slate-600'>
                Add Profile Picture
            </h2>

            <div className='flex flex-col items-center gap-6'>
                <div className='relative'>
                    <div className='border-primary-400 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 bg-gray-100'>
                        {selectedImage ? (
                            <img
                                src={selectedImage}
                                alt='Profile'
                                className='h-full w-full object-cover'
                            />
                        ) : (
                            <div className='text-primary-500 text-4xl'>
                                <IconUserFilled size={50} />
                            </div>
                        )}
                    </div>

                    {selectedImage && !isUploading && (
                        <div className='absolute -top-2 -right-2'>
                            <Tooltip content='Remove image' offset={10}>
                                <button
                                    type='button'
                                    onClick={handleRemoveImage}
                                    className='flex cursor-pointer items-center justify-center rounded-full bg-red-500 p-2 text-white shadow-lg transition-all hover:bg-red-600'
                                    aria-label='Remove profile picture'
                                >
                                    <IconTrash size={16} />
                                </button>
                            </Tooltip>
                        </div>
                    )}
                </div>

                {isUploading && (
                    <div className='text-blue-500'>Uploading...</div>
                )}

                <label className='bg-primary-400 hover:bg-primary-500 cursor-pointer rounded-lg px-6 py-2 text-white transition-colors'>
                    Choose Photo
                    <input
                        type='file'
                        accept='image/*'
                        onChange={handleImageUpload}
                        className='hidden'
                    />
                </label>

                <div className='text-center text-sm text-gray-500'>
                    Upload a photo to help others recognize you
                </div>
            </div>

            <div className='mt-6 flex gap-3'>
                <Button type='button' onClick={prevStep} className='flex-1'>
                    Back
                </Button>
                <Button type='button' onClick={handleSkip} className='flex-1'>
                    Skip
                </Button>
                <Button type='button' onClick={handleSubmit} className='flex-1'>
                    Complete
                </Button>
            </div>
        </>
    );
};
