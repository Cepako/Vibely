// src/components/messages/ChatWindow.tsx
import React, { useState, useRef, useEffect } from 'react';
import type { Message, Conversation } from '../../types/message';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import {
    IconPaperclip,
    IconSend,
    IconPhone,
    IconVideo,
    IconDotsVertical,
    IconTrash,
} from '@tabler/icons-react';
import { useAuth } from '../auth/AuthProvider';

interface ChatWindowProps {
    conversation: Conversation | null;
    messages: Message[];
    onSendMessage: (content: string, file?: File) => Promise<void>;
    onDeleteMessage: (messageId: number) => Promise<void>;
    loading: boolean;
    sending: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    conversation,
    messages,
    onSendMessage,
    onDeleteMessage,
    loading,
    sending,
}) => {
    const { user } = useAuth();
    const [messageText, setMessageText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Auto-resize textarea
    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        adjustTextareaHeight();
    }, [messageText]);

    // Handle file selection
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);

            // Create preview URL for images
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            }
        }
    };

    // Remove selected file
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

    // Handle send message
    const handleSendMessage = async () => {
        if ((!messageText.trim() && !selectedFile) || sending) return;

        if (!conversation) {
            console.error('No conversation selected');
            return;
        }

        try {
            await onSendMessage(messageText.trim(), selectedFile || undefined);
            setMessageText('');
            removeFile();
        } catch (error) {
            console.error('Failed to send message:', error);
            // You might want to show a toast notification here
        }
    };

    // Handle key press
    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    // Format message timestamp
    const formatMessageTime = (timestamp: string) => {
        const date = new Date(timestamp);
        if (isToday(date)) {
            return format(date, 'HH:mm');
        } else if (isYesterday(date)) {
            return `Yesterday ${format(date, 'HH:mm')}`;
        } else {
            return format(date, 'MMM d, HH:mm');
        }
    };

    // Group messages by date
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

    // Get conversation info
    const getConversationInfo = () => {
        if (!conversation) return { name: '', isOnline: false };

        if (conversation.participants.length === 2) {
            const otherParticipant = conversation.participants.find(
                (p) => p.userId !== user?.id
            );
            return {
                name: otherParticipant
                    ? `${otherParticipant.user.name} ${otherParticipant.user.surname}`
                    : 'Unknown User',
                isOnline: otherParticipant?.user.isOnline || false,
            };
        } else {
            const participantNames = conversation.participants
                .filter((p) => p.userId !== user?.id)
                .map((p) => p.user.name);

            return {
                name:
                    participantNames.length > 0
                        ? `${participantNames.join(', ')}${conversation.participants.length > 3 ? ` +${conversation.participants.length - 3}` : ''}`
                        : 'Group Chat',
                isOnline: false,
            };
        }
    };

    if (!conversation) {
        return (
            <div className='bg-primary-50 flex h-full items-center justify-center'>
                <div className='text-center text-gray-500'>
                    <div className='mb-4 text-4xl'>💬</div>
                    <h3 className='mb-2 text-xl font-semibold text-gray-900'>
                        Select a conversation
                    </h3>
                    <p className='text-sm'>
                        Choose a conversation from the sidebar to start
                        messaging
                    </p>
                </div>
            </div>
        );
    }

    const { name, isOnline } = getConversationInfo();
    const messageGroups = groupMessagesByDate(messages);

    return (
        <div className='flex h-full flex-col bg-white'>
            {/* Chat Header */}
            <div className='flex items-center justify-between border-b border-gray-200 bg-white p-4'>
                <div>
                    <h3 className='text-lg font-semibold text-gray-900'>
                        {name}
                    </h3>
                    {isOnline && conversation.participants.length === 2 && (
                        <span className='text-sm font-medium text-green-500'>
                            Online
                        </span>
                    )}
                </div>
                <div className='flex gap-2'>
                    <button
                        className='hover:text-primary-500 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100'
                        title='Call'
                    >
                        <IconPhone size={20} />
                    </button>
                    <button
                        className='hover:text-primary-500 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100'
                        title='Video call'
                    >
                        <IconVideo size={20} />
                    </button>
                    <button
                        className='hover:text-primary-500 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100'
                        title='More options'
                    >
                        <IconDotsVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div className='bg-primary-50 flex-1 overflow-y-auto p-4'>
                {loading ? (
                    <div className='flex h-48 flex-col items-center justify-center text-gray-500'>
                        <div className='border-t-primary-500 mb-3 h-6 w-6 animate-spin rounded-full border-2 border-gray-200'></div>
                        <p>Loading messages...</p>
                    </div>
                ) : Object.keys(messageGroups).length === 0 ? (
                    <div className='flex h-48 items-center justify-center text-gray-500'>
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    Object.entries(messageGroups).map(
                        ([date, messagesInGroup]) => (
                            <div key={date} className='mb-6'>
                                {/* Date Separator */}
                                <div className='my-4 flex justify-center'>
                                    <span className='rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500'>
                                        {date}
                                    </span>
                                </div>

                                {/* Messages */}
                                {messagesInGroup.map((message, index) => {
                                    const isOwnMessage =
                                        message.senderId === user?.id;
                                    const showAvatar =
                                        !isOwnMessage &&
                                        (index === messagesInGroup.length - 1 ||
                                            messagesInGroup[index + 1]
                                                ?.senderId !==
                                                message.senderId);

                                    return (
                                        <div
                                            key={message.id}
                                            className={`mb-2 flex items-end ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {/* Avatar for other users */}
                                            {showAvatar && !isOwnMessage && (
                                                <div className='mr-2 mb-1 h-8 w-8 flex-shrink-0'>
                                                    {message.sender
                                                        .profilePictureUrl ? (
                                                        <img
                                                            src={
                                                                message.sender
                                                                    .profilePictureUrl
                                                            }
                                                            alt={
                                                                message.sender
                                                                    .name
                                                            }
                                                            className='h-full w-full rounded-full object-cover'
                                                        />
                                                    ) : (
                                                        <div className='from-primary-400 flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br to-purple-500 text-sm font-semibold text-white'>
                                                            {message.sender.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Spacer for grouped messages */}
                                            {!showAvatar && !isOwnMessage && (
                                                <div className='w-10'></div>
                                            )}

                                            <div
                                                className={`group relative max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : ''}`}
                                            >
                                                {/* Sender name for other users */}
                                                {!isOwnMessage &&
                                                    showAvatar && (
                                                        <div className='mb-1 ml-1 text-xs text-gray-500'>
                                                            {
                                                                message.sender
                                                                    .name
                                                            }{' '}
                                                            {
                                                                message.sender
                                                                    .surname
                                                            }
                                                        </div>
                                                    )}

                                                {/* Message bubble */}
                                                <div
                                                    className={`rounded-2xl px-4 py-2 ${
                                                        isOwnMessage
                                                            ? 'bg-primary-500 rounded-br-md text-white'
                                                            : 'rounded-bl-md border border-gray-200 bg-white text-gray-900'
                                                    }`}
                                                >
                                                    {/* Attachments */}
                                                    {message.attachments &&
                                                        message.attachments
                                                            .length > 0 && (
                                                            <div className='mb-2'>
                                                                {message.attachments.map(
                                                                    (
                                                                        attachment
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                attachment.id
                                                                            }
                                                                        >
                                                                            {attachment.fileType ===
                                                                            'image' ? (
                                                                                <img
                                                                                    src={
                                                                                        attachment.fileUrl
                                                                                    }
                                                                                    alt='Attachment'
                                                                                    className='h-auto max-w-full rounded-lg'
                                                                                />
                                                                            ) : attachment.fileType ===
                                                                              'video' ? (
                                                                                <video
                                                                                    src={
                                                                                        attachment.fileUrl
                                                                                    }
                                                                                    controls
                                                                                    className='h-auto max-w-full rounded-lg'
                                                                                />
                                                                            ) : (
                                                                                <a
                                                                                    href={
                                                                                        attachment.fileUrl
                                                                                    }
                                                                                    target='_blank'
                                                                                    rel='noopener noreferrer'
                                                                                    className='bg-opacity-10 hover:bg-opacity-20 inline-flex items-center rounded-lg bg-black p-2 transition-colors'
                                                                                >
                                                                                    📄{' '}
                                                                                    {attachment.fileUrl
                                                                                        .split(
                                                                                            '/'
                                                                                        )
                                                                                        .pop()}
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}

                                                    {/* Message text */}
                                                    {message.content && (
                                                        <div className='break-words whitespace-pre-wrap'>
                                                            {message.content}
                                                        </div>
                                                    )}

                                                    {/* Message time */}
                                                    <div
                                                        className={`mt-1 flex items-center gap-1 text-xs ${
                                                            isOwnMessage
                                                                ? 'text-primary-100'
                                                                : 'text-gray-500'
                                                        }`}
                                                    >
                                                        <span>
                                                            {formatMessageTime(
                                                                message.createdAt
                                                            )}
                                                        </span>
                                                        {isOwnMessage && (
                                                            <span
                                                                className={
                                                                    message.isRead
                                                                        ? 'text-primary-200'
                                                                        : 'text-primary-300'
                                                                }
                                                            >
                                                                {message.isRead
                                                                    ? '✓✓'
                                                                    : '✓'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Delete button for own messages */}
                                                {isOwnMessage && (
                                                    <button
                                                        className='absolute top-1/2 -left-8 flex h-6 w-6 -translate-y-1/2 transform items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500'
                                                        onClick={() =>
                                                            onDeleteMessage(
                                                                message.id
                                                            )
                                                        }
                                                        title='Delete message'
                                                    >
                                                        <IconTrash size={12} />
                                                    </button>
                                                )}
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

            {/* Message Input */}
            <div className='border-t border-gray-200 bg-white p-4'>
                {/* File Preview */}
                {selectedFile && (
                    <div className='mb-3'>
                        <div className='relative inline-block overflow-hidden rounded-lg bg-gray-100'>
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt='Preview'
                                    className='max-h-20 max-w-32 object-cover'
                                />
                            ) : (
                                <div className='p-4 text-gray-600'>
                                    <span>📄 {selectedFile.name}</span>
                                </div>
                            )}
                            <button
                                className='bg-opacity-50 hover:bg-opacity-70 absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white transition-colors'
                                onClick={removeFile}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className='flex items-end gap-2 rounded-full bg-gray-100 p-2'>
                    {/* Attach Button */}
                    <button
                        className='hover:text-primary-500 flex-shrink-0 rounded-full p-2 text-gray-500 transition-colors hover:bg-white'
                        onClick={() => fileInputRef.current?.click()}
                        title='Attach file'
                    >
                        <IconPaperclip size={20} />
                    </button>

                    <input
                        type='file'
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept='image/*,video/*'
                        className='hidden'
                    />

                    {/* Text Input */}
                    <div className='flex-1'>
                        <textarea
                            ref={textareaRef}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder='Type a message...'
                            className='max-h-24 w-full resize-none border-none bg-transparent px-3 py-2 text-sm outline-none'
                            rows={1}
                            disabled={sending}
                        />
                    </div>

                    {/* Send Button */}
                    <button
                        className={`flex-shrink-0 rounded-full p-2 transition-colors ${
                            messageText.trim() || selectedFile
                                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                                : 'bg-gray-200 text-gray-400'
                        }`}
                        onClick={handleSendMessage}
                        disabled={
                            (!messageText.trim() && !selectedFile) || sending
                        }
                        title='Send message'
                    >
                        {sending ? (
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
