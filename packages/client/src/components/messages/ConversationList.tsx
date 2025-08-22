import React, { useState } from 'react';
import type { Conversation } from '../../types/message';
import { formatDistanceToNow } from 'date-fns';
import { IconSearch, IconPlus } from '@tabler/icons-react';
import { useAuth } from '../auth/AuthProvider';

interface ConversationListProps {
    conversations: Conversation[];
    currentConversation: Conversation | null;
    onSelectConversation: (conversation: Conversation) => void;
    onNewConversation: () => void;
    loading: boolean;
    totalUnreadCount: number;
}

export const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    currentConversation,
    onSelectConversation,
    onNewConversation,
    loading,
    totalUnreadCount,
}) => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    // Get conversation display name and avatar
    const getConversationInfo = (conversation: Conversation) => {
        if (conversation.participants.length === 2) {
            // 1-on-1 conversation
            const otherParticipant = conversation.participants.find(
                (p) => p.userId !== user?.id
            );
            return {
                name: otherParticipant
                    ? `${otherParticipant.user.name} ${otherParticipant.user.surname}`
                    : 'Unknown User',
                avatar: otherParticipant?.user.profilePictureUrl,
                isOnline: otherParticipant?.user.isOnline || false,
            };
        } else {
            // Group conversation
            const participantNames = conversation.participants
                .filter((p) => p.userId !== user?.id)
                .map((p) => p.user.name)
                .slice(0, 2);

            return {
                name:
                    participantNames.length > 0
                        ? `${participantNames.join(', ')}${conversation.participants.length > 3 ? ` +${conversation.participants.length - 3}` : ''}`
                        : 'Group Chat',
                avatar: null,
                isOnline: false,
            };
        }
    };

    // Filter conversations based on search term
    const filteredConversations = conversations.filter((conversation) => {
        const { name } = getConversationInfo(conversation);
        return (
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conversation.lastMessage?.content
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
    });

    const formatMessagePreview = (content: string, maxLength = 50) => {
        return content.length > maxLength
            ? `${content.substring(0, maxLength)}...`
            : content;
    };

    const formatLastMessageTime = (timestamp: string) => {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    };

    return (
        <div className='flex h-full flex-col border-r border-gray-200 bg-white'>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-gray-200 p-5'>
                <div className='flex items-center gap-2'>
                    <h2 className='text-2xl font-semibold text-gray-900'>
                        Messages
                    </h2>
                    {totalUnreadCount > 0 && (
                        <span className='min-w-[18px] rounded-full bg-red-500 px-2 py-1 text-center text-xs font-semibold text-white'>
                            {totalUnreadCount}
                        </span>
                    )}
                </div>
                <button
                    className='bg-primary-500 hover:bg-primary-600 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors'
                    onClick={onNewConversation}
                    aria-label='Start new conversation'
                >
                    <IconPlus size={20} />
                </button>
            </div>

            {/* Search */}
            <div className='border-b border-gray-200 p-4'>
                <div className='relative'>
                    <IconSearch className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                    <input
                        type='text'
                        placeholder='Search conversations...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='focus:ring-primary-500 w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm focus:border-transparent focus:bg-white focus:ring-2 focus:outline-none'
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className='flex-1 overflow-y-auto'>
                {loading ? (
                    <div className='flex flex-col items-center justify-center p-10 text-gray-500'>
                        <div className='border-t-primary-500 mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-200'></div>
                        <p>Loading conversations...</p>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className='flex flex-col items-center justify-center p-10 text-center text-gray-500'>
                        {searchTerm ? (
                            <p>
                                No conversations found matching "{searchTerm}"
                            </p>
                        ) : (
                            <div>
                                <p className='mb-3'>No conversations yet</p>
                                <button
                                    className='bg-primary-500 hover:bg-primary-600 rounded-full px-5 py-2 text-sm text-white transition-colors'
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
                                currentConversation?.id === conversation.id;

                            return (
                                <div
                                    key={conversation.id}
                                    className={`mx-2 my-1 flex cursor-pointer items-center rounded-lg border-l-2 p-3 transition-colors ${
                                        isSelected
                                            ? 'bg-primary-50 border-l-primary-500'
                                            : 'border-l-transparent hover:bg-gray-50'
                                    }`}
                                    onClick={() =>
                                        onSelectConversation(conversation)
                                    }
                                >
                                    {/* Avatar */}
                                    <div className='relative mr-3 flex-shrink-0'>
                                        {avatar ? (
                                            <img
                                                src={avatar}
                                                alt={name}
                                                className='h-12 w-12 rounded-full object-cover'
                                            />
                                        ) : (
                                            <div className='from-primary-400 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br to-purple-500 text-lg font-semibold text-white'>
                                                {name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        {isOnline &&
                                            conversation.participants.length ===
                                                2 && (
                                                <div className='absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500'></div>
                                            )}
                                    </div>

                                    {/* Content */}
                                    <div className='min-w-0 flex-1'>
                                        <div className='mb-1 flex items-center justify-between'>
                                            <h3 className='truncate font-semibold text-gray-900'>
                                                {name}
                                            </h3>
                                            {conversation.lastMessage && (
                                                <span className='ml-2 flex-shrink-0 text-xs text-gray-500'>
                                                    {formatLastMessageTime(
                                                        conversation.lastMessage
                                                            .createdAt
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        <div className='flex items-center justify-between'>
                                            {conversation.lastMessage ? (
                                                <p className='flex-1 truncate text-sm text-gray-600'>
                                                    {conversation.lastMessage
                                                        .senderId ===
                                                        user?.id && 'You: '}
                                                    {conversation.lastMessage
                                                        .contentType ===
                                                    'image' ? (
                                                        <span className='italic'>
                                                            📷 Photo
                                                        </span>
                                                    ) : conversation.lastMessage
                                                          .contentType ===
                                                      'video' ? (
                                                        <span className='italic'>
                                                            🎥 Video
                                                        </span>
                                                    ) : (
                                                        formatMessagePreview(
                                                            conversation
                                                                .lastMessage
                                                                .content
                                                        )
                                                    )}
                                                </p>
                                            ) : (
                                                <p className='text-sm text-gray-400 italic'>
                                                    Start a conversation
                                                </p>
                                            )}

                                            {conversation.unreadCount > 0 && (
                                                <span className='bg-primary-500 ml-2 min-w-[18px] flex-shrink-0 rounded-full px-2 py-1 text-center text-xs font-semibold text-white'>
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
