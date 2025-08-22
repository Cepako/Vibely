export interface Message {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    contentType: 'text' | 'image' | 'video';
    isRead: boolean;
    createdAt: string;
}

export interface MessageWithSender extends Message {
    sender: {
        id: number;
        name: string;
        surname: string;
        profilePictureUrl?: string | null;
    };
    attachments?: MessageAttachment[];
}

export interface MessageAttachment {
    id: number;
    messageId: number;
    fileUrl: string;
    fileType: 'image' | 'video' | 'pdf';
    fileSize: number;
    createdAt: string;
}

export interface Conversation {
    id: number;
    createdAt: string;
    updatedAt: string;
}

export interface ConversationWithDetails extends Conversation {
    participants: ConversationParticipant[];
    lastMessage?: MessageWithSender;
    unreadCount: number;
}

export interface ConversationParticipant {
    id: number;
    conversationId: number;
    userId: number;
    createdAt: string;
    user: {
        id: number;
        name: string;
        surname: string;
        profilePictureUrl?: string | null;
        isOnline: boolean;
    };
}
