import { FriendshipService } from '../friendship.service';
import { db } from '../../db';
import { NotificationService } from '../../notification/notification.service';

jest.mock('../../notification/notification.service');

jest.mock('../../db', () => ({
    db: {
        query: {
            friendships: {
                findFirst: jest.fn(),
                findMany: jest.fn(),
            },
            users: {
                findFirst: jest.fn(),
            },
        },
        insert: jest.fn(() => ({ values: jest.fn() })),
        update: jest.fn(() => ({
            set: jest.fn(() => ({ where: jest.fn() })),
        })),
        delete: jest.fn(() => ({ where: jest.fn() })),
    },
}));

describe('FriendshipService', () => {
    let service: FriendshipService;
    let mockNotificationService: jest.Mocked<NotificationService>;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        service = new FriendshipService();
        mockNotificationService = (NotificationService as unknown as jest.Mock)
            .mock.instances[0];
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('sendFriendRequest', () => {
        const userId = 1;
        const friendId = 2;

        it('powinien wysłać zaproszenie i powiadomienie', async () => {
            (db.query.friendships.findFirst as jest.Mock).mockResolvedValue(
                null
            );
            (db.query.users.findFirst as jest.Mock)
                .mockResolvedValueOnce({ id: friendId })
                .mockResolvedValueOnce({
                    id: userId,
                    name: 'Jan',
                    surname: 'Kowalski',
                });

            const insertValuesMock = jest.fn();
            (db.insert as jest.Mock).mockReturnValue({
                values: insertValuesMock,
            });

            await service.sendFriendRequest(userId, friendId);

            expect(db.insert).toHaveBeenCalled();
            expect(insertValuesMock).toHaveBeenCalledWith({
                userId,
                friendId,
                status: 'pending',
            });
            expect(
                mockNotificationService.notifyFriendRequest
            ).toHaveBeenCalledWith(userId, friendId, 'Jan Kowalski');
        });

        it('powinien rzucić błąd, gdy relacja już istnieje', async () => {
            (db.query.friendships.findFirst as jest.Mock).mockResolvedValue({
                id: 1,
            });

            await expect(
                service.sendFriendRequest(userId, friendId)
            ).rejects.toThrow('Friendship relationship already exists');
        });

        it('powinien rzucić błąd, gdy użytkownik jest zablokowany', async () => {
            (db.query.friendships.findFirst as jest.Mock)
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ id: 99, status: 'blocked' });

            (db.query.users.findFirst as jest.Mock).mockResolvedValue({
                id: friendId,
            });

            await expect(
                service.sendFriendRequest(userId, friendId)
            ).rejects.toThrow('Cannot send friend request to blocked user');
        });
    });

    describe('respondToFriendRequest', () => {
        const userId = 1;
        const friendshipId = 10;

        it('powinien zaakceptować zaproszenie i wysłać powiadomienie', async () => {
            const mockFriendship = {
                id: friendshipId,
                userId: 5,
                friendId: userId,
                status: 'pending',
            };
            (db.query.friendships.findFirst as jest.Mock).mockResolvedValue(
                mockFriendship
            );
            (db.query.users.findFirst as jest.Mock).mockResolvedValue({
                name: 'Me',
                surname: 'Me',
            });

            await service.respondToFriendRequest(
                userId,
                friendshipId,
                'accepted'
            );

            expect(db.update).toHaveBeenCalled();
            expect(
                mockNotificationService.notifyFriendRequestAccepted
            ).toHaveBeenCalled();
        });

        it('powinien usunąć zaproszenie przy odrzuceniu', async () => {
            const mockFriendship = {
                id: friendshipId,
                userId: 5,
                friendId: userId,
                status: 'pending',
            };
            (db.query.friendships.findFirst as jest.Mock).mockResolvedValue(
                mockFriendship
            );

            await service.respondToFriendRequest(
                userId,
                friendshipId,
                'rejected'
            );

            expect(db.delete).toHaveBeenCalled();
        });

        it('powinien rzucić błąd, gdy zaproszenie nie istnieje', async () => {
            (db.query.friendships.findFirst as jest.Mock).mockResolvedValue(
                null
            );

            await expect(
                service.respondToFriendRequest(userId, friendshipId, 'accepted')
            ).rejects.toThrow('Friend request not found or unauthorized');
        });
    });

    describe('getFriends', () => {
        it('powinien zwrócić listę znajomych', async () => {
            const userId = 1;
            const mockData = [
                {
                    id: 10,
                    userId: 1,
                    friendId: 2,
                    status: 'accepted',
                    createdAt: '2024-01-01',
                    user_friendId: { id: 2, name: 'Friend' },
                    user_userId: { id: 1, name: 'Me' },
                },
            ];

            (db.query.friendships.findMany as jest.Mock).mockResolvedValue(
                mockData
            );

            const result = await service.getFriends(userId, null);

            expect(result).toHaveLength(1);
            expect(result[0]!.id).toBe(2);
            expect(result[0]!.name).toBe('Friend');
        });
    });

    describe('blockUser', () => {
        it('powinien zablokować użytkownika (usuwając starą relację, jeśli była)', async () => {
            const userId = 1;
            const blockedId = 2;

            (db.query.users.findFirst as jest.Mock).mockResolvedValue({
                id: blockedId,
            });
            (db.query.friendships.findFirst as jest.Mock).mockResolvedValue({
                id: 55,
            });

            const insertValuesMock = jest.fn();
            (db.insert as jest.Mock).mockReturnValue({
                values: insertValuesMock,
            });

            await service.blockUser(userId, blockedId);

            expect(db.delete).toHaveBeenCalled();
            expect(insertValuesMock).toHaveBeenCalledWith({
                userId,
                friendId: blockedId,
                status: 'blocked',
            });
        });
    });

    describe('getFriendshipStatus', () => {
        it('powinien zwrócić "self" dla tego samego usera', async () => {
            const status = await service.getFriendshipStatus(1, 1);
            expect(status).toBe('self');
        });

        it('powinien zwrócić "none" gdy brak relacji', async () => {
            (db.query.friendships.findFirst as jest.Mock).mockResolvedValue(
                null
            );
            const status = await service.getFriendshipStatus(1, 2);
            expect(status).toBe('none');
        });

        it('powinien zwrócić "pending_sent" gdy wysłaliśmy zaproszenie', async () => {
            (db.query.friendships.findFirst as jest.Mock).mockResolvedValue({
                userId: 1,
                friendId: 2,
                status: 'pending',
            });
            const status = await service.getFriendshipStatus(1, 2);
            expect(status).toBe('pending_sent');
        });

        it('powinien zwrócić "pending_received" gdy otrzymaliśmy zaproszenie', async () => {
            (db.query.friendships.findFirst as jest.Mock).mockResolvedValue({
                userId: 2,
                friendId: 1,
                status: 'pending',
            });
            const status = await service.getFriendshipStatus(1, 2);
            expect(status).toBe('pending_received');
        });
    });
});
