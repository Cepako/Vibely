export type NotificationType =
    | 'posts'
    | 'comments'
    | 'friendships'
    | 'messages'
    | 'events'
    | 'post_reactions';

export interface NotificationData {
    id: number;
    userId: number;
    type: NotificationType;
    content: string;
    relatedId?: number;
    isRead: boolean;
    createdAt: string;
}
