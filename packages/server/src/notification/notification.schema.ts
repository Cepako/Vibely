import { Type } from '@sinclair/typebox';

export const NotificationTypeEnum = [
    'friendships',
    'messages',
    'post_reactions',
    'comment_reactions',
    'comments',
    'events',
    'posts',
] as const;

export type NotificationTypeType = (typeof NotificationTypeEnum)[number];

export const NotificationType = Type.Object({
    id: Type.Number(),
    userId: Type.Number(),
    type: Type.Union(NotificationTypeEnum.map((type) => Type.Literal(type))),
    content: Type.String(),
    isRead: Type.Boolean(),
    createdAt: Type.String(),
    relatedId: Type.Optional(Type.Number()),
});

export type NotificationType = typeof NotificationType.static;

export const CreateNotificationType = Type.Object({
    userId: Type.Number(),
    type: Type.Union(NotificationTypeEnum.map((type) => Type.Literal(type))),
    content: Type.String(),
    relatedId: Type.Optional(Type.Number()),
});

export type CreateNotificationType = typeof CreateNotificationType.static;

export const GetNotificationsQuerySchema = Type.Object({
    limit: Type.Optional(
        Type.Number({ minimum: 1, maximum: 100, default: 20 })
    ),
    offset: Type.Optional(Type.Number({ minimum: 0, default: 0 })),
});

export type GetNotificationsQueryType =
    typeof GetNotificationsQuerySchema.static;

export const NotificationParamsSchema = Type.Object({
    id: Type.Number(),
});

export type NotificationParamsType = typeof NotificationParamsSchema.static;

export const NotificationResponseSchema = Type.Object({
    notifications: Type.Array(NotificationType),
});

export const UnreadCountResponseSchema = Type.Object({
    unreadCount: Type.Number(),
});

export const SuccessResponseSchema = Type.Object({
    success: Type.Boolean(),
});
