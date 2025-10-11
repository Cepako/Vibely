export interface Message {
    id: number;
    conversationId: number;
    senderId: number;
    content: string | null;
    contentType: 'text' | 'image' | 'video' | 'file' | null;
    isRead: boolean;
    createdAt: string;
}

export interface MessageWithSender extends Message {
    sender: UserBasicInfo;
    attachments?: MessageAttachment[];
}

export interface MessageAttachment {
    id: number;
    messageId: number;
    fileUrl: string;
    fileType: 'image' | 'video' | 'document';
    fileSize: number;
    originalFileName?: string | null;
    createdAt: string;
}
export type ConversationType = 'direct' | 'group';
export interface ConversationWithDetails {
    id: number;
    type: ConversationType;
    name: string | null;
    createdAt: string;
    updatedAt: string;
    participants: ConversationParticipant[];
    lastMessage?: MessageWithSender;
    unreadCount: number;
}

export interface ConversationParticipant {
    id: number;
    conversationId: number;
    userId: number;
    nickname: string | null;
    role: string;
    createdAt: string;
    user: UserBasicInfo;
}

export interface UserBasicInfo {
    id: number;
    name: string;
    surname: string;
    profilePictureUrl: string | null;
    nickname?: string | null;
}
