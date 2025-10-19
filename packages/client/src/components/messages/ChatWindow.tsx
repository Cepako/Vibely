import React, { useState, useRef, useEffect } from 'react';
import type { Message, Conversation } from '../../types/message';
import { format, isToday, isYesterday } from 'date-fns';
import {
    IconPaperclip,
    IconSend,
    IconDotsVertical,
    IconX,
} from '@tabler/icons-react';
import { useAuth } from '../auth/AuthProvider';
import UserAvatar from '../ui/UserAvatar';
import type { User } from '../../types/user';
import MessageBubble from './MessageBubble';
import { ChatWindowHeader } from './ChatWindowHeader';
import { usePrevious } from '../hooks/usePrevious';
import { AdvisorPopover } from '../advisor/AdvisorPopover';

interface ChatWindowProps {
    conversation: Conversation;
    messages: Message[];
    sendMessage: (content: string, file?: File) => Promise<void>;
    isSending: boolean;
    markAsRead: (
        messagesIds: Array<number>,
        countToDecrement: number
    ) => Promise<void>;
    fetchNextPage: () => void;
    hasNextPage?: boolean;
    isFetchingNextPage: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    conversation,
    messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    sendMessage,
    isSending,
    markAsRead,
}) => {
    const { user } = useAuth();
    const [messageText, setMessageText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const topLoaderRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef<number | null>(null);

    const isInitialLoadRef = useRef(true);

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
        }
    };

    const prevMessages = usePrevious(messages);

    useEffect(() => {
        isInitialLoadRef.current = true;
    }, [conversation.id]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];

                if (
                    firstEntry.isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    if (scrollContainerRef.current) {
                        scrollPositionRef.current =
                            scrollContainerRef.current.scrollHeight;
                    }
                    fetchNextPage();
                }
            },
            { root: scrollContainerRef.current, threshold: 1.0 }
        );

        const currentLoader = topLoaderRef.current;
        if (currentLoader) {
            observer.observe(currentLoader);
        }

        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader);
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        if (scrollContainerRef.current && scrollPositionRef.current !== null) {
            const newScrollTop =
                scrollContainerRef.current.scrollHeight -
                scrollPositionRef.current;
            scrollContainerRef.current.scrollTop = newScrollTop;
            scrollPositionRef.current = null;
        }
    }, [messages]);

    useEffect(() => {
        const unreadMessages = messages.filter(
            (m) => !m.isRead && m.senderId !== user?.id
        );
        if (unreadMessages.length > 0) {
            const unreadMessageIds = unreadMessages.map((m) => m.id);
            markAsRead(unreadMessageIds, unreadMessages.length);
        }
    }, [messages, user?.id]);

    useEffect(() => {
        if (isFetchingNextPage) {
            return;
        }

        const lastMessage = messages[messages.length - 1];
        const prevLastMessage = prevMessages?.[prevMessages.length - 1];

        if (isInitialLoadRef.current && messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
            isInitialLoadRef.current = false;
        } else if (lastMessage?.id !== prevLastMessage?.id) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, prevMessages, isFetchingNextPage]);

    useEffect(() => {
        adjustTextareaHeight();
    }, [messageText]);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                try {
                    URL.revokeObjectURL(previewUrl);
                } catch (e) {}
            }
        };
    }, [previewUrl]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const maxSize = 50 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('File size must be less than 50MB');
                return;
            }

            setSelectedFile(file);

            if (
                file.type.startsWith('image/') ||
                file.type.startsWith('video/')
            ) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async () => {
        if ((!messageText.trim() && !selectedFile) || isSending) return;

        if (!conversation) {
            console.error('No conversation selected');
            return;
        }

        try {
            await sendMessage(messageText.trim(), selectedFile || undefined);
            setMessageText('');
            removeFile();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const groupMessagesByDate = (messages: Message[]) => {
        const groups: { [key: string]: Message[] } = {};

        messages.forEach((message) => {
            const date = new Date(message.createdAt);
            let dateKey: string;

            if (isToday(date)) {
                dateKey = 'Today';
            } else if (isYesterday(date)) {
                dateKey = 'Yesterday';
            } else {
                dateKey = format(date, 'MMMM d, yyyy');
            }

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(message);
        });

        return groups;
    };

    const messageGroups = groupMessagesByDate(messages);

    return (
        <div className='flex h-full w-full flex-col bg-white'>
            <div className='flex items-center justify-between border-b border-slate-200 bg-white p-4'>
                <ChatWindowHeader conversation={conversation} />

                <div className='flex gap-2'>
                    <button
                        className='hover:text-primary-500 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100'
                        title='More options'
                    >
                        <IconDotsVertical size={20} />
                    </button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className='bg-primary-50 flex-1 overflow-y-auto p-4'
            >
                {hasNextPage && (
                    <div
                        ref={topLoaderRef}
                        className='flex justify-center py-4'
                    >
                        {isFetchingNextPage && (
                            <div className='border-t-primary-500 h-6 w-6 animate-spin rounded-full border-2 border-slate-200'></div>
                        )}
                    </div>
                )}
                {Object.keys(messageGroups).length === 0 ? (
                    <div className='flex h-48 items-center justify-center text-slate-500'>
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    Object.entries(messageGroups).map(
                        ([date, messagesInGroup]) => (
                            <div key={date} className='mb-6'>
                                <div className='my-4 flex justify-center'>
                                    <span className='bg-primary-500 rounded-full px-3 py-1 text-xs text-white shadow'>
                                        {date}
                                    </span>
                                </div>

                                {messagesInGroup.map((message, index) => {
                                    const isOwnMessage =
                                        message.senderId === user?.id;
                                    const showAvatar =
                                        !isOwnMessage &&
                                        (index === messagesInGroup.length - 1 ||
                                            messagesInGroup[index + 1]
                                                ?.senderId !==
                                                message.senderId);
                                    const nickName =
                                        conversation.participants.find(
                                            (p) => p.userId === message.senderId
                                        )?.nickname;
                                    return (
                                        <div
                                            key={message.id}
                                            className={`mb-0.5 flex items-end ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {showAvatar && !isOwnMessage && (
                                                <div className='flex-shrink-0'>
                                                    <UserAvatar
                                                        user={
                                                            message.sender as User
                                                        }
                                                    />
                                                </div>
                                            )}

                                            {/* Spacer for grouped messages */}
                                            {!showAvatar && !isOwnMessage && (
                                                <div className='w-10'></div>
                                            )}

                                            <div
                                                className={`relative max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : ''}`}
                                            >
                                                <MessageBubble
                                                    isOwnMessage={isOwnMessage}
                                                    isGroupChat={
                                                        conversation
                                                            .participants
                                                            .length > 2
                                                    }
                                                    message={message}
                                                    nextMessage={
                                                        messagesInGroup[
                                                            index + 1
                                                        ]
                                                    }
                                                    prevMessage={
                                                        messagesInGroup[
                                                            index - 1
                                                        ]
                                                    }
                                                    nickName={nickName}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className='border-t border-slate-200 bg-white p-4'>
                {selectedFile && (
                    <div className='mb-3'>
                        <div className='relative inline-block overflow-hidden rounded-lg bg-slate-100'>
                            {previewUrl ? (
                                selectedFile?.type.startsWith('image/') ? (
                                    <img
                                        src={previewUrl}
                                        alt='Preview'
                                        className='max-h-40 max-w-56 object-cover'
                                    />
                                ) : selectedFile?.type.startsWith('video/') ? (
                                    <video
                                        src={previewUrl}
                                        controls
                                        className='max-h-40 max-w-56 object-cover'
                                    />
                                ) : (
                                    <div className='p-4 text-slate-600'>
                                        <span>📄 {selectedFile.name}</span>
                                    </div>
                                )
                            ) : (
                                <div className='p-4 text-slate-600'>
                                    <span>📄 {selectedFile.name}</span>
                                </div>
                            )}
                            <button
                                className='bg-opacity-50 hover:bg-opacity-70 absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-slate-700'
                                onClick={removeFile}
                            >
                                <IconX size={14} />
                            </button>
                        </div>
                    </div>
                )}

                <div className='flex items-center gap-2 rounded-full bg-slate-100 p-2'>
                    <button
                        className='hover:text-primary-500 flex-shrink-0 cursor-pointer rounded-full p-2 text-slate-500 transition-colors hover:bg-white'
                        onClick={() => fileInputRef.current?.click()}
                        title='Attach file'
                    >
                        <IconPaperclip size={20} />
                    </button>
                    <input
                        type='file'
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className='hidden'
                    />
                    <div className='flex-1'>
                        <textarea
                            ref={textareaRef}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder='Type a message...'
                            className='max-h-24 w-full resize-none border-none bg-transparent px-3 py-2 text-sm outline-none'
                            rows={1}
                            disabled={isSending}
                        />
                    </div>
                    <AdvisorPopover />
                    <button
                        className={`flex-shrink-0 rounded-full p-2 transition-colors ${
                            messageText.trim() || selectedFile
                                ? 'bg-primary-500 hover:bg-primary-600 cursor-pointer text-white'
                                : 'bg-slate-200 text-slate-400'
                        }`}
                        onClick={handleSendMessage}
                        disabled={
                            (!messageText.trim() && !selectedFile) || isSending
                        }
                        title='Send message'
                    >
                        {isSending ? (
                            <div className='h-5 w-5 animate-spin rounded-full border-2 border-transparent border-t-current'></div>
                        ) : (
                            <IconSend size={20} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
