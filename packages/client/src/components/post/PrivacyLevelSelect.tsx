import { IconLock, IconUsers, IconWorld } from '@tabler/icons-react';
import { type UseFormRegister } from 'react-hook-form';
import type { PrivacyLevel } from '../../types/post';

interface PrivacySelectorProps {
    register: UseFormRegister<any>;
    selectedPrivacy: PrivacyLevel;
    className?: string;
}

export default function PrivacyLevelSelect({
    register,
    selectedPrivacy,
    className = '',
}: PrivacySelectorProps) {
    return (
        <div className={`mb-6 ${className}`}>
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
                            selectedPrivacy === 'public'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        <IconWorld className='h-4 w-4 text-slate-600' />
                        <div>
                            <p className='text-sm font-medium'>Public</p>
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
                            selectedPrivacy === 'friends'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        <IconUsers className='h-4 w-4 text-slate-600' />
                        <div>
                            <p className='text-sm font-medium'>Friends</p>
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
                            selectedPrivacy === 'private'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        <IconLock className='h-4 w-4 text-slate-600' />
                        <div>
                            <p className='text-sm font-medium'>Private</p>
                            <p className='text-xs text-slate-500'>
                                Only you can see this post
                            </p>
                        </div>
                    </div>
                </label>
            </div>
        </div>
    );
}
