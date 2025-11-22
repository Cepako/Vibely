import { NotificationService } from '../notification.service';
import { db } from '../../db';
import { websocketManager } from '../../ws/websocketManager';

jest.mock('../../ws/websocketManager', () => ({
    websocketManager: {
        emitNotificationToUser: jest.fn(),
    },
}));

jest.mock('../../db', () => ({
    db: {
        query: {
            notifications: {
                findMany: jest.fn(),
            },
        },
        insert: jest.fn(() => ({
            values: jest.fn(() => ({ returning: jest.fn() })),
        })),
        update: jest.fn(() => ({ set: jest.fn(() => ({ where: jest.fn() })) })),
        delete: jest.fn(() => ({ where: jest.fn() })),
        select: jest.fn(() => ({
            from: jest.fn(() => ({ where: jest.fn() })),
        })),
    },
}));

describe('NotificationService', () => {
    let service: NotificationService;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        service = new NotificationService();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('createNotification', () => {
        it('powinien zapisać powiadomienie w bazie i wysłać przez WebSocket', async () => {
            const inputData = {
                userId: 1,
                type: 'friendships' as const,
                content: 'Hello',
                relatedId: 2,
            };

            const createdNotification = {
                id: 10,
                ...inputData,
                isRead: false,
                createdAt: 'now',
            };

            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest
                        .fn()
                        .mockResolvedValue([createdNotification]),
                }),
            });

            const result = await service.createNotification(inputData);

            expect(db.insert).toHaveBeenCalled();
            expect(result).toEqual(createdNotification);
            expect(
                websocketManager.emitNotificationToUser
            ).toHaveBeenCalledWith(1, createdNotification);
        });

        it('powinien rzucić błąd, gdy zapis się nie powiedzie', async () => {
            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([]), // Pusta tablica = fail
                }),
            });

            await expect(
                service.createNotification({
                    userId: 1,
                    type: 'posts',
                    content: 'test',
                })
            ).rejects.toThrow('Failed to create notification');
        });
    });

    describe('getUserNotifications', () => {
        it('powinien pobrać listę powiadomień użytkownika', async () => {
            const mockNotifications = [
                { id: 1, userId: 1, content: 'Test 1' },
                { id: 2, userId: 1, content: 'Test 2' },
            ];

            (db.query.notifications.findMany as jest.Mock).mockResolvedValue(
                mockNotifications
            );

            const result = await service.getUserNotifications(1);

            expect(result).toHaveLength(2);
            expect(result[0]!.content).toBe('Test 1');
        });

        it('powinien filtrować po typie i statusie przeczytania', async () => {
            (db.query.notifications.findMany as jest.Mock).mockResolvedValue(
                []
            );

            await service.getUserNotifications(1, 20, 0, {
                types: ['friendships'],
                unreadOnly: true,
            });

            expect(db.query.notifications.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: expect.anything() })
            );
        });
    });

    describe('markAsRead', () => {
        it('powinien zaktualizować status powiadomienia', async () => {
            await service.markAsRead(100);
            expect(db.update).toHaveBeenCalled();
        });
    });

    describe('markAllAsRead', () => {
        it('powinien zaktualizować wszystkie nieprzeczytane powiadomienia użytkownika', async () => {
            await service.markAllAsRead(1);
            expect(db.update).toHaveBeenCalled();
        });
    });

    describe('getUnreadCount', () => {
        it('powinien zwrócić liczbę nieprzeczytanych powiadomień', async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([{ count: 5 }]),
                }),
            });

            const count = await service.getUnreadCount(1);
            expect(count).toBe(5);
        });
    });

    describe('notifyFriendRequest', () => {
        it('powinien utworzyć odpowiednie powiadomienie', async () => {
            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest
                        .fn()
                        .mockResolvedValue([
                            { id: 1, userId: 2, type: 'friendships' },
                        ]),
                }),
            });

            await service.notifyFriendRequest(1, 2, 'Sender');

            expect(db.insert).toHaveBeenCalled();
        });
    });

    describe('deleteFriendRequestNotification', () => {
        it('powinien usunąć powiadomienie', async () => {
            await service.deleteFriendRequestNotification(1, 2);
            expect(db.delete).toHaveBeenCalled();
        });
    });
});
