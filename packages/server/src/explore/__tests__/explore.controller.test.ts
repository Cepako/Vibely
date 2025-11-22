jest.mock('../../utils/env', () => ({
    ENV: { NODE_ENV: 'development' },
}));
jest.mock('../../db', () => ({ db: {} }));

import { ExploreController } from '../explore.controller';
import { ExploreService } from '../explore.service';
import { FastifyRequest, FastifyReply } from 'fastify';

jest.mock('../explore.service');

describe('ExploreController', () => {
    let controller: ExploreController;
    let mockService: jest.Mocked<ExploreService>;
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        mockService = new ExploreService() as jest.Mocked<ExploreService>;
        controller = new ExploreController();
        (controller as any).exploreService = mockService;

        mockRequest = {
            user: { id: 1 } as any,
            query: {},
        };

        mockReply = {
            code: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('getPotentialFriends', () => {
        it('powinien zwrócić 200 i dane', async () => {
            mockRequest.query = { limit: '10' };
            const fakeData = [{ id: 2, name: 'Alice' }];
            mockService.getPotentialFriends.mockResolvedValue(fakeData as any);

            await controller.getPotentialFriends(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockService.getPotentialFriends).toHaveBeenCalledWith(
                1,
                10,
                expect.anything()
            );
            expect(mockReply.code).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, data: fakeData })
            );
        });

        it('powinien zwrócić 400 przy błędnym limicie', async () => {
            mockRequest.query = { limit: '999' }; // Limit > 100

            await controller.getPotentialFriends(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith(
                expect.objectContaining({ code: 'INVALID_LIMIT' })
            );
        });

        it('powinien zwrócić 400 przy błędnym wieku (min > max)', async () => {
            mockRequest.query = { minAge: '30', maxAge: '20' };

            await controller.getPotentialFriends(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith(
                expect.objectContaining({ code: 'INVALID_AGE_RANGE' })
            );
        });
    });

    describe('getRecommendedEvents', () => {
        it('powinien zwrócić 200 i eventy', async () => {
            mockRequest.query = { categoryId: '5' };
            mockService.getRecommendedEvents.mockResolvedValue([]);

            await controller.getRecommendedEvents(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockService.getRecommendedEvents).toHaveBeenCalled();
            expect(mockReply.code).toHaveBeenCalledWith(200);
        });

        it('powinien zwrócić 400 przy złym formacie daty', async () => {
            mockRequest.query = { startDate: 'not-a-date' };

            await controller.getRecommendedEvents(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith(
                expect.objectContaining({ code: 'INVALID_START_DATE' })
            );
        });
    });

    describe('searchPeople', () => {
        it('powinien zwrócić 200 i wyniki wyszukiwania', async () => {
            mockRequest.query = { q: 'John' };
            mockService.searchPeople.mockResolvedValue([]);

            await controller.searchPeople(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockService.searchPeople).toHaveBeenCalledWith(
                1,
                'John',
                expect.anything()
            );
            expect(mockReply.code).toHaveBeenCalledWith(200);
        });

        it('powinien zwrócić 400 gdy query jest puste', async () => {
            mockRequest.query = { q: '' };

            await controller.searchPeople(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith(
                expect.objectContaining({ code: 'MISSING_QUERY' })
            );
        });

        it('powinien zwrócić 400 gdy query jest za krótkie', async () => {
            mockRequest.query = { q: 'a' };

            await controller.searchPeople(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith(
                expect.objectContaining({ code: 'INVALID_QUERY' })
            );
        });
    });

    describe('getInterestBasedRecommendations', () => {
        it('powinien zwrócić 200', async () => {
            mockService.getInterestBasedRecommendations.mockResolvedValue({
                friends: [],
                events: [],
            });

            await controller.getInterestBasedRecommendations(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.code).toHaveBeenCalledWith(200);
        });
    });

    describe('getExploreStats', () => {
        it('powinien zwrócić statystyki (mock 0)', async () => {
            await controller.getExploreStats(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.code).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ potentialFriendsCount: 0 }),
                })
            );
        });
    });
});
