import { FastifyInstance } from 'fastify';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import {
    GetNotificationsQuerySchema,
    NotificationParamsSchema,
    NotificationResponseSchema,
    UnreadCountResponseSchema,
    SuccessResponseSchema,
} from './notification.schema';
import { createAuthGuard } from '../hooks/authGuard';
import { AuthService } from '../auth/auth.service';

export default async function notificationRoutes(fastify: FastifyInstance) {
    const authService = new AuthService();
    const notificationService = new NotificationService();
    const notificationController = new NotificationController(
        notificationService
    );
    const authGuard = createAuthGuard(authService);

    fastify.addHook('preHandler', authGuard);

    fastify.get(
        '/',
        {
            schema: {
                description: 'Get user notifications',
                tags: ['notifications'],
                querystring: GetNotificationsQuerySchema,
                response: {
                    200: NotificationResponseSchema,
                },
            },
        },
        notificationController.getNotifications.bind(notificationController)
    );

    fastify.get(
        '/unread-count',
        {
            schema: {
                description: 'Get unread notifications count',
                tags: ['notifications'],
                response: {
                    200: UnreadCountResponseSchema,
                },
            },
        },
        notificationController.getUnreadCount.bind(notificationController)
    );

    fastify.patch(
        '/:id/read',
        {
            schema: {
                description: 'Mark notification as read',
                tags: ['notifications'],
                params: NotificationParamsSchema,
                response: {
                    200: SuccessResponseSchema,
                },
            },
        },
        notificationController.markAsRead.bind(notificationController)
    );

    fastify.patch(
        '/read-all',
        {
            schema: {
                description: 'Mark all notifications as read',
                tags: ['notifications'],
                response: {
                    200: SuccessResponseSchema,
                },
            },
        },
        notificationController.markAllAsRead.bind(notificationController)
    );
}
