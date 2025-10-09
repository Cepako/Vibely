export type NotificationType =
    | 'posts'
    | 'comments'
    | 'comment_reactions'
    | 'friendships'
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
