import { EventService } from '../event.service';
import { db } from '../../db';
import { NotificationService } from '../../notification/notification.service';
import { FriendshipService } from '../../friendship/friendship.service';

jest.mock('../../notification/notification.service');
jest.mock('../../friendship/friendship.service');

jest.mock('../../db', () => ({
    db: {
        query: {
            events: { findFirst: jest.fn(), findMany: jest.fn() },
            eventParticipants: { findFirst: jest.fn(), findMany: jest.fn() },
            eventCategories: { findFirst: jest.fn(), findMany: jest.fn() },
            friendships: { findMany: jest.fn() },
        },
        insert: jest.fn(() => ({
            values: jest.fn(() => ({ returning: jest.fn() })),
        })),
        update: jest.fn(() => ({
            set: jest.fn(() => ({
                where: jest.fn(() => ({ returning: jest.fn() })),
            })),
        })),
        delete: jest.fn(() => ({ where: jest.fn() })),
    },
}));

describe('EventService', () => {
    let service: EventService;
    let mockNotificationService: jest.Mocked<NotificationService>;
    let mockFriendshipService: jest.Mocked<FriendshipService>;

    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();

        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        service = new EventService();
        mockNotificationService = (NotificationService as unknown as jest.Mock)
            .mock.instances[0];
        mockFriendshipService = (FriendshipService as unknown as jest.Mock).mock
            .instances[0];
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('createEvent', () => {
        const userId = 1;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const eventData = {
            title: 'Birthday Party',
            startTime: futureDate.toISOString(),
            endTime: new Date(futureDate.getTime() + 3600000).toISOString(),
            privacyLevel: 'public' as const,
        };

        it('powinien utworzyć wydarzenie i zwrócić jego szczegóły', async () => {
            const createdEvent = { id: 10, ...eventData, organizerId: userId };

            (db.insert as jest.Mock).mockReturnValueOnce({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([createdEvent]),
                }),
            });

            (db.insert as jest.Mock).mockReturnValueOnce({ values: jest.fn() });

            (db.query.events.findFirst as jest.Mock).mockResolvedValue({
                ...createdEvent,
                eventParticipants: [{ userId, status: 'going', user: {} }],
                user: { id: userId, name: 'Org', surname: 'Anizer' },
            });

            const result = await service.createEvent(userId, eventData);

            expect(db.insert).toHaveBeenCalledTimes(2);
            expect(result.title).toBe(eventData.title);
            expect(result.participants).toHaveLength(1);
        });

        it('powinien rzucić błąd, gdy data startu jest w przeszłości', async () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);

            await expect(
                service.createEvent(userId, {
                    ...eventData,
                    startTime: pastDate.toISOString(),
                })
            ).rejects.toThrow('Event start time must be in the future');
        });
    });

    describe('joinPublicEvent', () => {
        const userId = 2;
        const eventId = 100;

        it('powinien dodać użytkownika do publicznego wydarzenia', async () => {
            (db.query.events.findFirst as jest.Mock).mockResolvedValue({
                id: eventId,
                privacyLevel: 'public',
                organizerId: 99,
            });
            (
                db.query.eventParticipants.findFirst as jest.Mock
            ).mockResolvedValue(null);

            const insertMock = jest.fn();
            (db.insert as jest.Mock).mockReturnValue({ values: insertMock });

            await service.joinPublicEvent(userId, eventId);

            expect(insertMock).toHaveBeenCalledWith({
                eventId,
                userId,
                status: 'going',
            });
        });

        it('powinien rzucić błąd, gdy wydarzenie jest prywatne', async () => {
            (db.query.events.findFirst as jest.Mock).mockResolvedValue({
                id: eventId,
                privacyLevel: 'private',
                organizerId: 99,
            });

            await expect(
                service.joinPublicEvent(userId, eventId)
            ).rejects.toThrow('This is a private event');
        });

        it('powinien rzucić błąd, gdy przekroczono limit uczestników', async () => {
            (db.query.events.findFirst as jest.Mock).mockResolvedValue({
                id: eventId,
                privacyLevel: 'public',
                maxParticipants: 2,
            });
            (
                db.query.eventParticipants.findFirst as jest.Mock
            ).mockResolvedValue(null);
            (
                db.query.eventParticipants.findMany as jest.Mock
            ).mockResolvedValue([{}, {}]);

            await expect(
                service.joinPublicEvent(userId, eventId)
            ).rejects.toThrow('Event has reached maximum capacity');
        });
    });

    describe('inviteUsersToEvent', () => {
        const organizerId = 1;
        const eventId = 50;
        const userIdsToInvite = [2, 3];

        it('powinien zaprosić użytkowników i wysłać powiadomienia', async () => {
            (db.query.events.findFirst as jest.Mock).mockResolvedValue({
                id: eventId,
                organizerId,
                privacyLevel: 'public',
                user: { name: 'Host', surname: 'User' },
            });

            (
                db.query.eventParticipants.findMany as jest.Mock
            ).mockResolvedValue([]);

            const insertMock = jest.fn();
            (db.insert as jest.Mock).mockReturnValue({ values: insertMock });

            await service.inviteUsersToEvent(
                organizerId,
                eventId,
                userIdsToInvite
            );

            expect(db.insert).toHaveBeenCalled();
            expect(
                mockNotificationService.notifyEventInvitation
            ).toHaveBeenCalledTimes(2);
        });

        it('powinien rzucić błąd, jeśli nie jest organizatorem', async () => {
            (db.query.events.findFirst as jest.Mock).mockResolvedValue({
                id: eventId,
                organizerId: 999,
                privacyLevel: 'public',
            });

            await expect(
                service.inviteUsersToEvent(
                    organizerId,
                    eventId,
                    userIdsToInvite
                )
            ).rejects.toThrow('You are not authorized');
        });

        it('powinien sprawdzić znajomych dla wydarzenia prywatnego', async () => {
            (db.query.events.findFirst as jest.Mock).mockResolvedValue({
                id: eventId,
                organizerId,
                privacyLevel: 'private',
                user: { name: 'Host' },
            });
            (
                db.query.eventParticipants.findMany as jest.Mock
            ).mockResolvedValue([]);

            mockFriendshipService.getFriends.mockResolvedValue([]);

            await expect(
                service.inviteUsersToEvent(organizerId, eventId, [2])
            ).rejects.toThrow('You can only invite friends to private events');
        });
    });

    describe('deleteEvent', () => {
        it('powinien usunąć wydarzenie', async () => {
            (db.query.events.findFirst as jest.Mock).mockResolvedValue({
                id: 1,
                organizerId: 1,
            });

            await service.deleteEvent(1, 1);

            expect(db.delete).toHaveBeenCalled();
        });

        it('powinien rzucić błąd Unauthorized przy próbie usunięcia cudzego wydarzenia', async () => {
            (db.query.events.findFirst as jest.Mock).mockResolvedValue({
                id: 1,
                organizerId: 999,
            });

            await expect(service.deleteEvent(1, 1)).rejects.toThrow(
                'You are not authorized'
            );
        });
    });
});
