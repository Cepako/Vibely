import { FastifyInstance } from 'fastify';
import { db } from '../db/';
import { notifications } from '../db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import {
    CreateNotificationType,
    NotificationType,
} from './notification.schema';
import WebSocket from 'ws';

export class NotificationService {
    constructor(private server: FastifyInstance) {}

    private async createNotificationInDB(
        data: CreateNotificationType
    ): Promise<NotificationType> {
        const [newNotification] = await db
            .insert(notifications)
            .values({
                userId: data.userId,
                type: data.type,
                content: data.content,
                relatedId: data.relatedId,
                isRead: false,
            })
            .returning();

        if (!newNotification) {
            throw new Error('Failed to create notification');
        }

        const result: NotificationType = {
            id: newNotification.id,
            userId: newNotification.userId,
            type: newNotification.type as NotificationType['type'],
            content: newNotification.content,
            isRead: newNotification.isRead || false,
            createdAt: newNotification.createdAt || new Date().toISOString(),
        };

        if (newNotification.relatedId !== null) {
            result.relatedId = newNotification.relatedId;
        }

        return result;
    }

    private async findNotificationsByUserId(
        userId: number,
        limit: number = 20,
        offset: number = 0
    ): Promise<NotificationType[]> {
        const results = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt))
            .limit(limit)
            .offset(offset);

        return results.map((notification) => {
            const result: NotificationType = {
                id: notification.id,
                userId: notification.userId,
                type: notification.type as NotificationType['type'],
                content: notification.content,
                isRead: notification.isRead || false,
                createdAt: notification.createdAt || new Date().toISOString(),
            };

            if (notification.relatedId !== null) {
                result.relatedId = notification.relatedId;
            }

            return result;
        });
    }

    private async markNotificationAsRead(
        notificationId: number
    ): Promise<void> {
        await db
            .update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.id, notificationId));
    }

    private async markAllNotificationsAsReadByUserId(
        userId: number
    ): Promise<void> {
        await db
            .update(notifications)
            .set({ isRead: true })
            .where(
                and(
                    eq(notifications.userId, userId),
                    eq(notifications.isRead, false)
                )
            );
    }

    private async getUnreadCountFromDB(userId: number): Promise<number> {
        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(notifications)
            .where(
                and(
                    eq(notifications.userId, userId),
                    eq(notifications.isRead, false)
                )
            );

        return result[0]?.count || 0;
    }

    private async findNotificationById(
        notificationId: number
    ): Promise<NotificationType | null> {
        const results = await db
            .select()
            .from(notifications)
            .where(eq(notifications.id, notificationId))
            .limit(1);

        if (results.length === 0) return null;

        const notification = results[0];
        if (!notification) return null;

        const result: NotificationType = {
            id: notification.id,
            userId: notification.userId,
            type: notification.type as NotificationType['type'],
            content: notification.content,
            isRead: notification.isRead || false,
            createdAt: notification.createdAt || new Date().toISOString(),
        };

        if (notification.relatedId !== null) {
            result.relatedId = notification.relatedId;
        }

        return result;
    }

    private emitNotificationToUser(
        userId: number,
        notification: NotificationType
    ): void {
        const wsClients =
            (this.server as any).websocketClients ||
            new Map<number, WebSocket[]>();
        const userConnections: WebSocket[] = wsClients.get(userId) || [];

        userConnections.forEach((socket: WebSocket) => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(
                    JSON.stringify({
                        type: 'notification',
                        data: notification,
                    })
                );
            }
        });
    }

    async createNotification(
        data: CreateNotificationType
    ): Promise<NotificationType> {
        const notification = await this.createNotificationInDB(data);

        this.emitNotificationToUser(notification.userId, notification);

        return notification;
    }

    async getUserNotifications(
        userId: number,
        limit: number = 20,
        offset: number = 0
    ): Promise<NotificationType[]> {
        return await this.findNotificationsByUserId(userId, limit, offset);
    }

    async markAsRead(notificationId: number): Promise<void> {
        await this.markNotificationAsRead(notificationId);
    }

    async markAllAsRead(userId: number): Promise<void> {
        await this.markAllNotificationsAsReadByUserId(userId);
    }

    async getUnreadCount(userId: number): Promise<number> {
        return await this.getUnreadCountFromDB(userId);
    }

    async getNotificationById(
        notificationId: number
    ): Promise<NotificationType | null> {
        return await this.findNotificationById(notificationId);
    }

    async notifyFriendRequest(
        fromUserId: number,
        toUserId: number,
        fromUserName: string
    ): Promise<void> {
        await this.createNotification({
            userId: toUserId,
            type: 'friendships',
            content: `${fromUserName} sent you a friend request`,
            relatedId: fromUserId,
        });
    }

    async notifyFriendRequestAccepted(
        fromUserId: number,
        toUserId: number,
        fromUserName: string
    ): Promise<void> {
        await this.createNotification({
            userId: toUserId,
            type: 'friendships',
            content: `${fromUserName} accepted your friend request`,
            relatedId: fromUserId,
        });
    }

    async notifyNewMessage(
        fromUserId: number,
        toUserId: number,
        fromUserName: string,
        conversationId: number
    ): Promise<void> {
        await this.createNotification({
            userId: toUserId,
            type: 'messages',
            content: `${fromUserName} sent you a message`,
            relatedId: conversationId,
        });
    }

    async notifyEventInvitation(
        organizerId: number,
        invitedUserId: number,
        organizerName: string,
        eventTitle: string,
        eventId: number
    ): Promise<void> {
        await this.createNotification({
            userId: invitedUserId,
            type: 'events',
            content: `${organizerName} invited you to "${eventTitle}"`,
            relatedId: eventId,
        });
    }

    async notifyPostReaction(
        postOwnerId: number,
        reactorId: number,
        reactorName: string,
        postId: number
    ): Promise<void> {
        await this.createNotification({
            userId: postOwnerId,
            type: 'post_reactions',
            content: `${reactorName} liked your post`,
            relatedId: postId,
        });
    }

    async notifyNewComment(
        postOwnerId: number,
        commenterId: number,
        commenterName: string,
        postId: number
    ): Promise<void> {
        await this.createNotification({
            userId: postOwnerId,
            type: 'comments',
            content: `${commenterName} commented on your post`,
            relatedId: postId,
        });
    }
}
