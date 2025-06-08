import { Link } from '@tanstack/react-router';

export default function NotFoundPage() {
    return (
        <div className='bg-primary-50 flex h-screen items-center justify-center'>
            <div className='text-center'>
                <h1 className='text-primary-600 text-6xl font-bold'>404</h1>
                <h2 className='text-primary-800 mt-4 text-2xl font-semibold'>
                    Page Not Found
                </h2>
                <p className='text-primary-600 mt-2'>
                    The page you're looking for doesn't exist.
                </p>
                <Link
                    to='/'
                    className='bg-primary-600 hover:bg-primary-500 mt-6 inline-block rounded-lg px-6 py-3 text-white duration-200'
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
