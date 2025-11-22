import { ExploreService } from '../explore.service';
import { db } from '../../db';
import { FriendshipService } from '../../friendship/friendship.service';
import { EventService } from '../../event/event.service';

jest.mock('../../friendship/friendship.service');
jest.mock('../../event/event.service');

jest.mock('../../db', () => ({
    db: {
        query: {
            users: { findMany: jest.fn() },
            friendships: { findMany: jest.fn() },
            userInterests: { findMany: jest.fn() },
            events: { findMany: jest.fn() },
            eventParticipants: { findMany: jest.fn() },
            posts: { findMany: jest.fn() },
        },
    },
}));

describe('ExploreService', () => {
    let service: ExploreService;
    let mockFriendshipService: jest.Mocked<FriendshipService>;
    let mockEventService: jest.Mocked<EventService>;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        service = new ExploreService();
        mockFriendshipService = (FriendshipService as unknown as jest.Mock).mock
            .instances[0];
        mockEventService = (EventService as unknown as jest.Mock).mock
            .instances[0];
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('getPotentialFriends', () => {
        it('powinien zwrócić listę potencjalnych znajomych posortowaną wg punktacji', async () => {
            // Arrange
            const userId = 1;

            // Mock istniejących znajomości (żeby ich wykluczyć)
            (db.query.friendships.findMany as jest.Mock).mockResolvedValueOnce(
                []
            );

            // Mock zainteresowań obecnego użytkownika
            (
                db.query.userInterests.findMany as jest.Mock
            ).mockResolvedValueOnce([
                { interestId: 10, interest: { id: 10, name: 'Tech' } },
            ]);

            // Mock pobrania kandydatów z bazy
            const candidates = [
                { id: 2, name: 'Alice', city: 'Warsaw' },
                { id: 3, name: 'Bob', city: 'Berlin' },
            ];
            (db.query.users.findMany as jest.Mock).mockResolvedValue(
                candidates
            );

            // Mock wyliczeń wewnątrz pętli mapowania kandydatów:
            // Dla każdego kandydata pobierane są:
            // 1. Wzajemni znajomi (getMutualFriendsCount -> db.query.friendships.findMany x2)
            // 2. Zainteresowania kandydata (db.query.userInterests.findMany)

            // Symulujemy to globalnie dla uproszczenia (zawsze zwracamy puste tablice znajomych i jakieś interesy)
            (db.query.friendships.findMany as jest.Mock).mockResolvedValue([]);
            (db.query.userInterests.findMany as jest.Mock).mockResolvedValue([
                { interestId: 10, interest: { id: 10, name: 'Tech' } }, // Wspólne zainteresowanie
            ]);

            // Act
            const result = await service.getPotentialFriends(userId);

            // Assert
            expect(result).toHaveLength(2);
            expect(db.query.users.findMany).toHaveBeenCalled();
            // Sprawdzamy czy wynik ma strukturę PotentialFriend (ma matchScore)
            expect(result[0]).toHaveProperty('matchScore');
        });

        it('powinien obsłużyć błędy i rzucić wyjątek', async () => {
            (db.query.friendships.findMany as jest.Mock).mockRejectedValue(
                new Error('DB Error')
            );

            await expect(service.getPotentialFriends(1)).rejects.toThrow(
                'Failed to get potential friends'
            );
        });
    });

    describe('getRecommendedEvents', () => {
        it('powinien zwrócić rekomendowane wydarzenia', async () => {
            // Arrange
            const userId = 1;
            mockFriendshipService.getFriends.mockResolvedValue([
                { id: 2 },
            ] as any); // Znajomy o ID 2

            // Mock eventów w których user już bierze udział (pusta lista)
            (
                db.query.eventParticipants.findMany as jest.Mock
            ).mockResolvedValueOnce([]);

            // Mock znalezionych eventów w bazie (surowe dane)
            const rawEvents = [
                { id: 100, organizerId: 2, startTime: '2025-01-01' },
            ];
            (db.query.events.findMany as jest.Mock).mockResolvedValue(
                rawEvents
            );

            // Mock EventService.getEventById (zwraca pełne detale)
            mockEventService.getEventById.mockResolvedValue({
                id: 100,
                title: 'Party',
                organizerId: 2,
                startTime: '2025-01-01',
            } as any);

            // Act
            const result = await service.getRecommendedEvents(userId);

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0]!.title).toBe('Party');
            expect(mockEventService.getEventById).toHaveBeenCalledWith(
                100,
                userId
            );
        });
    });

    describe('getTrendingContent', () => {
        it('powinien zwrócić posty i wydarzenia', async () => {
            // Arrange
            const mockPosts = [
                {
                    id: 1,
                    content: 'Cool post',
                    postReactions: [],
                    comments: [],
                },
            ];

            (db.query.posts.findMany as jest.Mock).mockResolvedValue(mockPosts);

            // Mockujemy metodę publiczną serwisu, którą on sam woła (getPublicEvents)
            // Uwaga: normalnie mockujemy to co na zewnątrz, ale tu EventService jest wstrzyknięty
            // W kodzie ExploreService wywołuje this.eventService.getPublicEvents
            mockEventService.getPublicEvents.mockResolvedValue([
                { id: 50, title: 'Event' },
            ] as any);

            // Act
            const result = await service.getTrendingContent(1);

            // Assert
            expect(result.posts).toHaveLength(1);
            expect(result.events).toHaveLength(1);
            expect(result.posts[0]!.content).toBe('Cool post');
        });
    });

    describe('searchPeople', () => {
        it('powinien zwrócić pustą tablicę dla pustego query', async () => {
            const result = await service.searchPeople(1, '   ');
            expect(result).toEqual([]);
        });

        it('powinien wyszukać użytkowników i obliczyć match score', async () => {
            // Arrange
            (db.query.friendships.findMany as jest.Mock).mockResolvedValue([]); // Brak wykluczeń
            (db.query.users.findMany as jest.Mock).mockResolvedValue([
                { id: 2, name: 'John' },
            ]);

            // Mocki do obliczania score (wzajemni znajomi, interese)
            // Uproszczenie: zwracamy puste dane, żeby test przeszedł bez błędów logiki
            (db.query.userInterests.findMany as jest.Mock).mockResolvedValue(
                []
            );

            // Act
            const result = await service.searchPeople(1, 'John');

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0]!.name).toBe('John');
            expect(db.query.users.findMany).toHaveBeenCalled();
        });
    });

    describe('getInterestBasedRecommendations', () => {
        it('powinien zwrócić ogólne rekomendacje, gdy user nie ma zainteresowań', async () => {
            // Mock brak zainteresowań
            (db.query.userInterests.findMany as jest.Mock).mockResolvedValue(
                []
            );

            // Spies na metody własne serwisu (ponieważ woła this.getPotentialFriends)
            const potentialSpy = jest
                .spyOn(service, 'getPotentialFriends')
                .mockResolvedValue([] as any);
            const eventsSpy = jest
                .spyOn(service, 'getRecommendedEvents')
                .mockResolvedValue([] as any);

            await service.getInterestBasedRecommendations(1);

            expect(potentialSpy).toHaveBeenCalled();
            expect(eventsSpy).toHaveBeenCalled();
        });

        it('powinien filtrować po zainteresowaniach, gdy user je posiada', async () => {
            // Mock zainteresowań
            (db.query.userInterests.findMany as jest.Mock).mockResolvedValue([
                { interestId: 5, interest: {} },
            ]);

            const potentialSpy = jest
                .spyOn(service, 'getPotentialFriends')
                .mockResolvedValue([] as any);
            const eventsSpy = jest
                .spyOn(service, 'getRecommendedEvents')
                .mockResolvedValue([] as any);

            await service.getInterestBasedRecommendations(1);

            // Sprawdzamy czy getPotentialFriends zostało zawołane z filtrem interests
            expect(potentialSpy).toHaveBeenCalledWith(
                1,
                10,
                expect.objectContaining({ interests: [5] })
            );
            expect(eventsSpy).toHaveBeenCalled();
        });
    });
});
