import { Link } from '@tanstack/react-router';
import { IconLock, IconLogin, IconUserPlus } from '@tabler/icons-react';
import VibelyIcon from '../ui/VibelyIcon';

export function UnauthenticatedPage() {
    return (
        <div className='from-primary-50 to-primary-100 flex min-h-screen flex-col items-center justify-center gap-5 bg-gradient-to-br p-4'>
            <div className='flex items-center justify-center gap-2'>
                <VibelyIcon className='h-20 w-20' />
                <span className='font-display text-primary-500 text-7xl font-bold'>
                    Vibely
                </span>
            </div>
            <div className='w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl'>
                <div className='mb-6'>
                    <div className='bg-warning-100 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                        <IconLock className='text-warning-600 h-8 w-8' />
                    </div>

                    <h1 className='mb-2 text-2xl font-bold text-gray-900'>
                        Access Denied 403
                    </h1>
                    <p className='text-gray-600'>
                        You need to be logged in to access this page. Join the
                        conversation on Vibely!
                    </p>
                </div>

                <div className='space-y-3'>
                    <Link
                        to='/'
                        className='bg-primary-600 hover:bg-primary-700 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-white transition-colors duration-200'
                    >
                        <IconLogin className='h-4 w-4' />
                        Sign In
                    </Link>

                    <Link
                        to='/register'
                        className='bg-success-200 hover:bg-success-300 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-slate-700 transition-colors duration-200'
                    >
                        <IconUserPlus className='h-4 w-4' />
                        Create Account
                    </Link>
                </div>

                <div className='mt-6 border-t border-gray-200 pt-6'>
                    <p className='text-sm text-gray-500'>
                        New to Vibely? Create an account to connect with
                        friends, share moments and discover amazing content.
                    </p>
                </div>
            </div>
        </div>
    );
}
