import {
    IconCamera,
    IconDotsVertical,
    IconHeart,
    IconImageInPicture,
    IconMessageCircle,
    IconMessageReportFilled,
    IconVideo,
} from '@tabler/icons-react';
import { useState } from 'react';
import { defaultDateFormat, formatTimeAgo } from '../../utils/utils';
import Tooltip from '../ui/Tooltip';
import { format } from 'date-fns';
import DropdownMenu from '../ui/DropdownMenu';
import { Dialog, useDialog } from '../ui/Dialog';
import Likes from './Likes';
import Comments from './Comments';

interface PostCardProps {
    post: any; //TODO: TYPE
}

export default function PostCard({ post }: PostCardProps) {
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [likesCount, setLikesCount] = useState<number>(post.likes);
    const likesDialog = useDialog(false);
    const commentsDialog = useDialog(false);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    };

    return (
        <div className='mb-4 rounded-lg border border-gray-200 bg-white shadow-sm'>
            {/* Post Header */}
            <div className='flex items-center justify-between p-4 pb-3'>
                <div className='flex items-center space-x-3'>
                    <img
                        src={post.avatar}
                        alt={post.username}
                        className='h-10 w-10 cursor-pointer rounded-full object-cover'
                    />
                    <div>
                        <div className='flex items-center space-x-2'>
                            <h3 className='cursor-pointer font-semibold text-slate-800'>
                                {post.username}
                            </h3>
                        </div>
                        <Tooltip
                            className='opacity-100'
                            content={
                                <div>
                                    {format(post.created_at, defaultDateFormat)}
                                </div>
                            }
                        >
                            <p className='text-sm text-gray-500'>
                                {formatTimeAgo(post.created_at)}
                            </p>
                        </Tooltip>
                    </div>
                </div>
                <DropdownMenu
                    className='border-slate-300 shadow-lg'
                    trigger={
                        <button className='cursor-pointer text-gray-400 duration-200 hover:text-gray-600'>
                            <IconDotsVertical className='h-5 w-5' />
                        </button>
                    }
                    items={[
                        {
                            id: 'report',
                            label: 'Report',
                            icon: <IconMessageReportFilled />,
                            onClick: () => console.log('report'),
                            className: 'p-2 ',
                        },
                    ]}
                />
            </div>

            {/* Post Content */}
            <div className='px-4 pb-3'>
                <p className='leading-relaxed text-gray-800'>{post.content}</p>
            </div>

            {/* Content Media Placeholder */}
            {post.content_type === 'photo' && (
                <div className='mx-4 mb-3 flex h-64 items-center justify-center rounded-lg bg-gray-100'>
                    <IconCamera className='h-8 w-8 text-gray-400' />
                    <span className='ml-2 text-gray-500'>Photo Content</span>
                </div>
            )}

            {post.content_type === 'video' && (
                <div className='mx-4 mb-3 flex h-64 items-center justify-center rounded-lg bg-gray-900'>
                    <IconVideo className='h-8 w-8 text-white' />
                    <span className='ml-2 text-white'>Video Content</span>
                </div>
            )}

            {post.content_type === 'album' && (
                <div className='mx-4 mb-3 flex h-64 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-pink-100'>
                    <IconImageInPicture className='h-8 w-8 text-purple-600' />
                    <span className='ml-2 text-purple-700'>Album Content</span>
                </div>
            )}

            {/* Post Actions */}
            <div className='border-t border-gray-100 px-4 py-3'>
                <div className='mb-2 flex items-center justify-between'>
                    <div className='flex items-center space-x-1 text-sm text-slate-400'>
                        <Dialog
                            isOpen={likesDialog.isOpen}
                            onClose={likesDialog.closeDialog}
                            placement='center'
                        >
                            <Likes
                                postId={1}
                                onClose={likesDialog.closeDialog}
                            />
                        </Dialog>
                        <span
                            className='cursor-pointer duration-200 hover:text-slate-600'
                            onClick={() => likesDialog.openDialog()}
                        >
                            {likesCount} likes
                        </span>
                        <span>•</span>
                        <Dialog
                            isOpen={commentsDialog.isOpen}
                            onClose={commentsDialog.closeDialog}
                            placement='center'
                        >
                            <Comments
                                postId={1}
                                onClose={commentsDialog.closeDialog}
                            />
                        </Dialog>
                        <span
                            className='cursor-pointer duration-200 hover:text-slate-600'
                            onClick={() => commentsDialog.openDialog()}
                        >
                            {post.comments} comments
                        </span>
                    </div>
                </div>

                <div className='flex items-center justify-between pt-2'>
                    <button
                        onClick={handleLike}
                        className={`flex cursor-pointer items-center space-x-2 rounded-lg px-4 py-2 transition-colors ${
                            isLiked
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <IconHeart
                            className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`}
                        />
                        <span className='font-medium'>Like</span>
                    </button>

                    <button className='flex cursor-pointer items-center space-x-2 rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50'>
                        <IconMessageCircle className='h-5 w-5' />
                        <span className='font-medium'>Comment</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
