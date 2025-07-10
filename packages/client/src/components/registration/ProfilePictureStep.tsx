import { useState } from 'react';
import { useRegistration } from './RegistrationProvider';
import Button from '../ui/Button';
import { IconTrash, IconUserFilled } from '@tabler/icons-react';
import Tooltip from '../ui/Tooltip';

export const ProfilePictureStep: React.FC = () => {
    const { updateFormData, prevStep, submitRegistration } = useRegistration();
    const [preview, setPreview] = useState<string>('');

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            updateFormData({ profilePicture: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        updateFormData({ profilePicture: undefined });
        setPreview('');
        const fileInput = document.querySelector(
            'input[type="file"]'
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = () => {
        submitRegistration();
    };

    const handleSkip = () => {
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
                        {preview ? (
                            <img
                                src={preview}
                                alt='Profile'
                                className='h-full w-full object-cover'
                            />
                        ) : (
                            <div className='text-primary-500 text-4xl'>
                                <IconUserFilled size={50} />
                            </div>
                        )}
                    </div>

                    {preview && (
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
