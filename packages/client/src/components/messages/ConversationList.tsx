import React, { useState } from 'react';
import type { Conversation } from '../../types/message';
import { formatDistanceToNow } from 'date-fns';
import {
    IconSearch,
    IconUsersGroup,
    IconMessages,
    IconMessagePlus,
} from '@tabler/icons-react';
import { useAuth } from '../auth/AuthProvider';
import UserAvatar from '../ui/UserAvatar';
import type { User } from '../../types/user';
import { useNotificationWebSocketContext } from '../providers/NotificationWebSocketProvider';
import Tooltip from '../ui/Tooltip';

interface ConversationListProps {
    conversations: Conversation[];
    conversationId: number | null;
    onSelectConversation: (conversation: Conversation) => void;
    onNewConversation: () => void;
    isLoading: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    conversationId,
    onSelectConversation,
    onNewConversation,
    isLoading: loading,
}) => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const { isUserOnline, onlineUsers } = useNotificationWebSocketContext();

    const getConversationInfo = (conversation: Conversation) => {
        if (conversation.type === 'direct') {
            // 1-on-1 conversation
            const otherParticipant = conversation.participants.find(
                (p) => p.userId !== user?.id
            )!;
            return {
                name:
                    otherParticipant.nickname ??
                    `${otherParticipant.user.name} ${otherParticipant.user.surname}`,
                avatar: (
                    <UserAvatar
                        user={otherParticipant.user as User}
                        size='lg'
                    />
                ),
                isOnline: isUserOnline(otherParticipant.user.id) || false,
            };
        } else {
            const participantNames = conversation.participants
                .filter((p) => p.userId !== user?.id)
                .map((p) => p.user.name)
                .slice(0, 2);

            return {
                name:
                    conversation.name ??
                    (participantNames.length > 0
                        ? `${participantNames.join(', ')}${conversation.participants.length > 3 ? ` +${conversation.participants.length - 3}` : ''}`
                        : 'Group Chat'),
                avatar: (
                    <div className='bg-primary-200 text-primary-700 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-semibold'>
                        <IconUsersGroup />
                    </div>
                ),
                isOnline:
                    (onlineUsers.length > 0 &&
                        conversation.participants.some(
                            (p) =>
                                onlineUsers.includes(p.userId) &&
                                p.userId !== user?.id
                        )) ||
                    false,
            };
        }
    };

    const filteredConversations = conversations.filter((conversation) => {
        const { name } = getConversationInfo(conversation);
        return (
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (conversation.lastMessage?.content &&
                conversation.lastMessage.content
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()))
        );
    });

    const formatMessagePreview = (content?: string, maxLength = 50) => {
        return content && content.length > maxLength
            ? `${content.substring(0, maxLength)}...`
            : content;
    };

    const formatLastMessageTime = (timestamp: string) => {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    };

    return (
        <div className='flex h-full flex-col border-r border-slate-200 bg-white'>
            <div className='flex items-center justify-between border-b border-slate-200 p-5'>
                <div className='text-primary-500 flex items-center gap-2'>
                    <IconMessages size={32} />
                    <h1 className='py-2 text-3xl font-bold'>Messages</h1>
                </div>
                <button
                    className='bg-primary-500 hover:bg-primary-600 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white transition-colors'
                    onClick={onNewConversation}
                    aria-label='Start new conversation'
                >
                    <IconMessagePlus size={20} />
                </button>
            </div>

            <div className='border-b border-slate-200 p-4'>
                <div className='relative'>
                    <IconSearch className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400' />
                    <input
                        type='text'
                        placeholder='Search conversations...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='focus:ring-primary-500 w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm focus:border-transparent focus:bg-white focus:ring-1 focus:outline-none'
                    />
                </div>
            </div>

            <div className='flex-1 overflow-y-auto'>
                {loading ? (
                    <div className='flex flex-col items-center justify-center p-10 text-slate-500'>
                        <div className='border-t-primary-500 mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200'></div>
                        <p>Loading conversations...</p>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className='flex flex-col items-center justify-center p-10 text-center text-slate-500'>
                        {searchTerm ? (
                            <p>
                                No conversations found matching "{searchTerm}"
                            </p>
                        ) : (
                            <div>
                                <p className='mb-3'>No conversations yet</p>
                                <button
                                    className='bg-primary-500 hover:bg-primary-600 cursor-pointer rounded-full px-5 py-2 text-sm text-white transition-colors'
                                    onClick={onNewConversation}
                                >
                                    Start chatting
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='py-2'>
                        {filteredConversations.map((conversation) => {
                            const { name, avatar, isOnline } =
                                getConversationInfo(conversation);
                            const isSelected =
                                conversationId === conversation.id;

                            return (
                                <div
                                    key={conversation.id}
                                    className={`mx-2 my-1 flex cursor-pointer items-center rounded-lg border-l-2 p-3 transition-colors ${
                                        isSelected
                                            ? 'bg-primary-50 border-l-primary-500'
                                            : 'border-l-transparent hover:bg-slate-50'
                                    }`}
                                    onClick={() =>
                                        onSelectConversation(conversation)
                                    }
                                >
                                    <div className='relative mr-3 flex-shrink-0'>
                                        {avatar}
                                        {isOnline && (
                                            <Tooltip
                                                content='Online'
                                                delay={100}
                                            >
                                                <div className='absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500'></div>
                                            </Tooltip>
                                        )}
                                    </div>

                                    <div className='min-w-0 flex-1'>
                                        <div className='mb-1 flex items-center justify-between'>
                                            <h3 className='truncate font-semibold text-slate-900'>
                                                {name}
                                            </h3>
                                            {conversation.lastMessage && (
                                                <span className='ml-2 flex-shrink-0 text-xs text-slate-500'>
                                                    {formatLastMessageTime(
                                                        conversation.lastMessage
                                                            .createdAt
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        <div className='flex items-center justify-between'>
                                            {conversation.lastMessage ? (
                                                <p className='flex-1 truncate text-sm text-slate-600'>
                                                    {conversation.lastMessage
                                                        .senderId ===
                                                        user?.id && 'You: '}
                                                    {conversation.lastMessage
                                                        .contentType ===
                                                    'image' ? (
                                                        <span className='italic'>
                                                            Photo
                                                        </span>
                                                    ) : conversation.lastMessage
                                                          .contentType ===
                                                      'video' ? (
                                                        <span className='italic'>
                                                            Video
                                                        </span>
                                                    ) : conversation.lastMessage
                                                          .contentType ===
                                                      'file' ? (
                                                        <span className='italic'>
                                                            File
                                                        </span>
                                                    ) : (
                                                        formatMessagePreview(
                                                            conversation
                                                                .lastMessage
                                                                .content ?? ''
                                                        )
                                                    )}
                                                </p>
                                            ) : (
                                                <p className='text-sm text-slate-400 italic'>
                                                    Start a conversation
                                                </p>
                                            )}

                                            {conversation.unreadCount > 0 && (
                                                <span className='bg-primary-500 ml-2 flex h-6 w-6 items-center justify-center rounded-full px-2 py-1 text-center text-xs font-semibold text-white'>
                                                    {conversation.unreadCount >
                                                    99
                                                        ? '99+'
                                                        : conversation.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
