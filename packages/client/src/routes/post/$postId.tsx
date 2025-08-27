import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { usePost } from '../../components/post/hooks/usePosts';
import PostDetails from '../../components/post/PostDetails';
import {
    IconArrowLeft,
    IconAlertCircle,
    IconFileX,
    IconLoader,
} from '@tabler/icons-react';

export const Route = createFileRoute('/post/$postId')({
    beforeLoad: ({ context }) => {
        if (!context.auth.isAuthenticated) {
            throw new Error('unauthenticated');
        }
    },
    component: PostDetailPage,
});

function PostDetailPage() {
    const params = Route.useParams();
    const postId = Number(params.postId);
    const navigate = useNavigate();

    const { data: post, isLoading, error } = usePost(postId);

    const handleClose = () => {
        if (post?.user) {
            navigate({
                to: '/profile/$profileId',
                params: { profileId: post.userId.toString() },
            });
        } else {
            navigate({ to: '/' });
        }
    };

    if (isLoading) {
        return (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm'>
                <div className='mx-4 w-full max-w-sm rounded-xl bg-white px-8 py-6 shadow-2xl'>
                    <div className='flex items-center justify-center space-x-4'>
                        <IconLoader
                            size={24}
                            className='animate-spin text-blue-600'
                        />
                        <span className='font-medium text-gray-700'>
                            Loading post...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm'>
                <div className='mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl'>
                    <div className='mb-6 flex items-start space-x-4'>
                        <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100'>
                            <IconAlertCircle
                                size={24}
                                className='text-red-600'
                            />
                        </div>
                        <div className='min-w-0 flex-1'>
                            <h2 className='mb-2 text-lg font-semibold text-gray-900'>
                                Unable to Load Post
                            </h2>
                            <p className='text-sm leading-relaxed text-gray-600'>
                                {error.message ||
                                    'Something went wrong while loading this post. Please try again later.'}
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center space-x-3'>
                        <button
                            onClick={handleClose}
                            className='flex flex-1 items-center justify-center space-x-2 rounded-lg bg-gray-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-gray-700'
                        >
                            <IconArrowLeft size={16} />
                            <span>Go Back</span>
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className='flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50'
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm'>
                <div className='mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl'>
                    <div className='mb-6 flex items-start space-x-4'>
                        <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-100'>
                            <IconFileX size={24} className='text-gray-500' />
                        </div>
                        <div className='min-w-0 flex-1'>
                            <h2 className='mb-2 text-lg font-semibold text-gray-900'>
                                Post Not Found
                            </h2>
                            <p className='text-sm leading-relaxed text-gray-600'>
                                This post may have been deleted, made private,
                                or you don't have permission to view it.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className='flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-gray-700'
                    >
                        <IconArrowLeft size={16} />
                        <span>Go Back</span>
                    </button>
                </div>
            </div>
        );
    }

    return <PostDetails post={post} />;
}
