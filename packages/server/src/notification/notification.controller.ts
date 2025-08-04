import { FastifyRequest, FastifyReply } from 'fastify';
import { NotificationService } from './notification.service';
import {
    GetNotificationsQueryType,
    NotificationParamsType,
} from './notification.schema';
import { Payload } from '../auth/auth.schema';

export class NotificationController {
    constructor(private notificationService: NotificationService) {}

    async getNotifications(
        request: FastifyRequest<{ Querystring: GetNotificationsQueryType }>,
        reply: FastifyReply
    ) {
        try {
            const { limit = 20, offset = 0 } = request.query;
            const user = request.user as Payload;

            const notifications =
                await this.notificationService.getUserNotifications(
                    user.id,
                    limit,
                    offset
                );

            return reply.send({ notifications });
        } catch (error) {
            request.log.error(error);
            return reply
                .status(500)
                .send({ error: 'Failed to fetch notifications' });
        }
    }

    async getUnreadCount(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = request.user as Payload;
            const unreadCount = await this.notificationService.getUnreadCount(
                user.id
            );

            return reply.send({ unreadCount });
        } catch (error) {
            request.log.error(error);
            return reply
                .status(500)
                .send({ error: 'Failed to fetch unread count' });
        }
    }

    async markAsRead(
        request: FastifyRequest<{ Params: NotificationParamsType }>,
        reply: FastifyReply
    ) {
        try {
            const { id } = request.params;

            const user = request.user as Payload;
            const notification =
                await this.notificationService.getNotificationById(id);

            if (!notification) {
                return reply
                    .status(404)
                    .send({ error: 'Notification not found' });
            }

            if (notification.userId !== user.id) {
                return reply.status(403).send({ error: 'Unauthorized' });
            }

            await this.notificationService.markAsRead(id);

            return reply.send({ success: true });
        } catch (error) {
            request.log.error(error);
            return reply
                .status(500)
                .send({ error: 'Failed to mark notification as read' });
        }
    }

    async markAllAsRead(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = request.user as Payload;
            await this.notificationService.markAllAsRead(user.id);

            return reply.send({ success: true });
        } catch (error) {
            request.log.error(error);
            return reply
                .status(500)
                .send({ error: 'Failed to mark all notifications as read' });
        }
    }
}
