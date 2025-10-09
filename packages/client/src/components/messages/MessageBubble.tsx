import { format, isToday, isYesterday } from 'date-fns';
import type { Message } from '../../types/message';
import { cn } from '../../utils/utils';

interface MessageBubbleProps {
    message: Message;
    isOwnMessage: boolean;
    isGroupChat: boolean;
    prevMessage?: Message;
    nextMessage?: Message;
    nickName?: string | null;
}

export default function MessageBubble({
    isOwnMessage,
    isGroupChat,
    message,
    nextMessage,
    prevMessage,
    nickName,
}: MessageBubbleProps) {
    const hasPrevMess =
        prevMessage && prevMessage.senderId === message.senderId;
    const hasNextMess =
        nextMessage && nextMessage.senderId === message.senderId;

    return (
        <div
            className={cn(
                'relative px-4 py-1',
                isOwnMessage
                    ? 'bg-primary-500 rounded-l-3xl text-white'
                    : 'ml-1 rounded-r-3xl border border-slate-200 bg-white text-slate-900',
                hasPrevMess && !hasNextMess && 'rounded-b-3xl',
                !hasPrevMess && !hasNextMess && 'rounded-3xl',
                !hasPrevMess && hasNextMess && 'rounded-t-3xl'
            )}
        >
            {isGroupChat && !isOwnMessage && !hasPrevMess && (
                <div className='absolute -top-4 left-4 z-10 w-full text-xs text-nowrap text-slate-500'>
                    {nickName ??
                        `${message.sender.name} ${message.sender.surname}`}
                </div>
            )}
            {message.attachments && message.attachments.length > 0 && (
                <div className='mb-2'>
                    {message.attachments.map((attachment) => (
                        <div key={attachment.id}>
                            {attachment.fileType === 'image' ? (
                                <img
                                    src={attachment.fileUrl}
                                    alt='Attachment'
                                    className='h-auto max-w-full rounded-lg'
                                />
                            ) : attachment.fileType === 'video' ? (
                                <video
                                    src={attachment.fileUrl}
                                    controls
                                    className='h-auto max-w-full rounded-lg'
                                />
                            ) : (
                                <a
                                    href={attachment.fileUrl}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='bg-opacity-10 hover:bg-opacity-20 inline-flex items-center rounded-lg bg-black p-2 transition-colors'
                                >
                                    📄 {attachment.fileUrl.split('/').pop()}
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {message.content && (
                <div className='break-words whitespace-pre-wrap'>
                    {message.content}
                </div>
            )}

            <div
                className={`mt-1 flex items-center gap-1 text-xs ${
                    isOwnMessage ? 'text-primary-100' : 'text-slate-500'
                }`}
            >
                <span>{formatMessageTime(message.createdAt)}</span>
                {isOwnMessage && (
                    <span
                        className={
                            message.isRead
                                ? 'text-primary-200'
                                : 'text-primary-300'
                        }
                    >
                        {message.isRead ? '✓✓' : '✓'}
                    </span>
                )}
            </div>
        </div>
    );
}

function formatMessageTime(timestamp: string) {
    const date = new Date(timestamp);
    if (isToday(date)) {
        return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
        return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
        return format(date, 'MMM d, HH:mm');
    }
}
