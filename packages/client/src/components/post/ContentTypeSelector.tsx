import { IconPhoto, IconVideo } from '@tabler/icons-react';
import { type UseFormRegister } from 'react-hook-form';
import type { ContentType } from '../../types/post';

interface ContentTypeSelectorProps {
    register: UseFormRegister<any>;
    selectedContentType: ContentType;
    className?: string;
}

function ContentTypeSelector({
    register,
    selectedContentType,
    className = '',
}: ContentTypeSelectorProps) {
    return (
        <div className={`mb-4 ${className}`}>
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
                            selectedContentType === 'photo'
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
                            selectedContentType === 'video'
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
    );
}

export default ContentTypeSelector;
