jest.mock('../../utils/env', () => ({
    ENV: { NODE_ENV: 'development' },
}));
jest.mock('../../db', () => ({ db: {} }));

import { NotificationController } from '../notification.controller';
import { NotificationService } from '../notification.service';
import { FastifyRequest, FastifyReply } from 'fastify';

jest.mock('../notification.service');

describe('NotificationController', () => {
    let controller: NotificationController;
    let mockService: jest.Mocked<NotificationService>;
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        mockService =
            new NotificationService() as jest.Mocked<NotificationService>;
        controller = new NotificationController(mockService);

        mockRequest = {
            user: { id: 1 } as any,
            query: {},
            params: {},
            log: { error: jest.fn() } as any,
        };

        mockReply = {
            send: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('getNotifications', () => {
        it('powinien zwrócić listę powiadomień (200)', async () => {
            mockService.getUserNotifications.mockResolvedValue([]);

            await controller.getNotifications(
                mockRequest as FastifyRequest<any>,
                mockReply as FastifyReply
            );

            expect(mockService.getUserNotifications).toHaveBeenCalledWith(
                1,
                20,
                0,
                expect.anything()
            );
            expect(mockReply.send).toHaveBeenCalledWith({ notifications: [] });
        });

        it('powinien obsłużyć filtrowanie (types string)', async () => {
            mockRequest.query = { type: 'friendships,posts' };
            mockService.getUserNotifications.mockResolvedValue([]);

            await controller.getNotifications(
                mockRequest as FastifyRequest<any>,
                mockReply as FastifyReply
            );

            expect(mockService.getUserNotifications).toHaveBeenCalledWith(
                1,
                20,
                0,
                expect.objectContaining({ types: ['friendships', 'posts'] })
            );
        });

        it('powinien obsłużyć błąd serwisu (500)', async () => {
            mockService.getUserNotifications.mockRejectedValue(
                new Error('DB Error')
            );

            await controller.getNotifications(
                mockRequest as FastifyRequest<any>,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({
                error: 'Failed to fetch notifications',
            });
        });
    });

    describe('getUnreadCount', () => {
        it('powinien zwrócić liczbę nieprzeczytanych (200)', async () => {
            mockService.getUnreadCount.mockResolvedValue(5);

            await controller.getUnreadCount(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.send).toHaveBeenCalledWith({ unreadCount: 5 });
        });
    });

    describe('markAsRead', () => {
        it('powinien oznaczyć jako przeczytane (200)', async () => {
            mockRequest.params = { id: 10 };
            mockService.getNotificationById.mockResolvedValue({
                id: 10,
                userId: 1,
            } as any);
            mockService.markAsRead.mockResolvedValue(undefined);

            await controller.markAsRead(
                mockRequest as FastifyRequest<any>,
                mockReply as FastifyReply
            );

            expect(mockService.markAsRead).toHaveBeenCalledWith(10);
            expect(mockReply.send).toHaveBeenCalledWith({ success: true });
        });

        it('powinien zwrócić 404 gdy powiadomienie nie istnieje', async () => {
            mockRequest.params = { id: 10 };
            mockService.getNotificationById.mockResolvedValue(null);

            await controller.markAsRead(
                mockRequest as FastifyRequest<any>,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(404);
        });

        it('powinien zwrócić 403 gdy powiadomienie należy do innego użytkownika', async () => {
            mockRequest.params = { id: 10 };
            mockService.getNotificationById.mockResolvedValue({
                id: 10,
                userId: 999,
            } as any);

            await controller.markAsRead(
                mockRequest as FastifyRequest<any>,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(403);
        });
    });

    describe('markAllAsRead', () => {
        it('powinien oznaczyć wszystkie jako przeczytane (200)', async () => {
            mockService.markAllAsRead.mockResolvedValue(undefined);

            await controller.markAllAsRead(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockService.markAllAsRead).toHaveBeenCalledWith(1);
            expect(mockReply.send).toHaveBeenCalledWith({ success: true });
        });
    });
});
