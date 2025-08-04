import { Type, Static } from '@sinclair/typebox';

export const NotificationTypeSchema = Type.Union([
    Type.Literal('posts'),
    Type.Literal('comments'),
    Type.Literal('friendships'),
    Type.Literal('messages'),
    Type.Literal('events'),
    Type.Literal('post_reactions'),
]);

export const NotificationSchema = Type.Object({
    id: Type.Number(),
    userId: Type.Number(),
    type: NotificationTypeSchema,
    content: Type.String(),
    relatedId: Type.Optional(Type.Number()),
    isRead: Type.Boolean(),
    createdAt: Type.String(),
});

export const CreateNotificationSchema = Type.Object({
    userId: Type.Number(),
    type: NotificationTypeSchema,
    content: Type.String(),
    relatedId: Type.Optional(Type.Number()),
});

export const GetNotificationsQuerySchema = Type.Object({
    limit: Type.Optional(
        Type.Number({ default: 20, minimum: 1, maximum: 100 })
    ),
    offset: Type.Optional(Type.Number({ default: 0, minimum: 0 })),
});

export const NotificationParamsSchema = Type.Object({
    id: Type.Number(),
});

export const NotificationResponseSchema = Type.Object({
    notifications: Type.Array(NotificationSchema),
});

export const UnreadCountResponseSchema = Type.Object({
    unreadCount: Type.Number(),
});

export const SuccessResponseSchema = Type.Object({
    success: Type.Boolean(),
});

export type NotificationType = Static<typeof NotificationSchema>;
export type CreateNotificationType = Static<typeof CreateNotificationSchema>;
export type GetNotificationsQueryType = Static<
    typeof GetNotificationsQuerySchema
>;
export type NotificationParamsType = Static<typeof NotificationParamsSchema>;
