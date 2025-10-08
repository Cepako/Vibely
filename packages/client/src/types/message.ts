export interface User {
    id: number;
    name: string;
    surname: string;
    profilePictureUrl?: string | null;
    isOnline?: boolean;
    nickname?: string | null;
}

export interface MessageAttachment {
    id: number;
    messageId: number;
    fileUrl: string;
    fileType: 'image' | 'video' | 'pdf';
    fileSize: number;
    createdAt: string;
}

export interface Message {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    contentType: 'text' | 'image' | 'video';
    isRead: boolean;
    createdAt: string;
    sender: User;
    attachments?: MessageAttachment[];
}

export interface ConversationParticipant {
    id: number;
    conversationId: number;
    userId: number;
    nickname: string | null;
    role: 'admin' | 'member';
    createdAt: string;
    user: User;
}
export type ConversationType = 'direct' | 'group';
export interface Conversation {
    id: number;
    type: ConversationType;
    name: string | null;
    createdAt: string;
    updatedAt: string;
    participants: ConversationParticipant[];
    lastMessage?: Message;
    unreadCount: number;
}

export interface CreateMessageData {
    conversationId: number;
    content: string;
    contentType?: 'text' | 'image' | 'video';
    file?: File;
}

export interface CreateConversationData {
    participantIds: number[];
    name?: string;
    type?: ConversationType;
}

export interface UpdateConversationNameData {
    name: string;
}

export interface UpdateParticipantNicknameData {
    userId: number;
    nickname: string;
}

export interface MessageResponse {
    success: boolean;
    data?: Message | Message[] | Conversation | Conversation[];
    message?: string;
}

export interface WebSocketMessage {
    type: 'connected' | 'new_message' | 'user_typing' | 'user_stopped_typing';
    data?: any;
    message?: string;
    from?: number;
}
