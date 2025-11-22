jest.mock('../../utils/env', () => ({
    ENV: { NODE_ENV: 'development' },
}));
jest.mock('../../db', () => ({ db: {} }));

import { EventController } from '../event.controller';
import { EventService } from '../event.service';
import { FastifyRequest, FastifyReply } from 'fastify';

jest.mock('../event.service');

describe('EventController', () => {
    let controller: EventController;
    let mockService: jest.Mocked<EventService>;
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        mockService = new EventService() as jest.Mocked<EventService>;
        controller = new EventController();
        (controller as any).eventService = mockService;

        mockRequest = {
            user: { id: 1 } as any,
            body: {},
            params: {},
            query: {},
        };

        mockReply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('createEvent', () => {
        it('powinien zwrócić 201 po utworzeniu wydarzenia', async () => {
            const eventData = {
                title: 'Party',
                startTime: '2025-01-01',
                privacyLevel: 'public',
            };
            mockRequest.body = eventData;
            mockService.createEvent.mockResolvedValue({
                id: 1,
                title: 'Party',
            } as any);

            await controller.createEvent(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockService.createEvent).toHaveBeenCalledWith(1, eventData);
            expect(mockReply.status).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith(
                expect.objectContaining({ success: true })
            );
        });

        it('powinien zwrócić 400 przy braku wymaganych pól', async () => {
            mockRequest.body = { title: 'Party' };

            await controller.createEvent(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.stringContaining('Missing required fields'),
                })
            );
        });
    });

    describe('getEvent', () => {
        it('powinien zwrócić 200 i dane wydarzenia', async () => {
            mockRequest.params = { eventId: '10' };
            mockService.getEventById.mockResolvedValue({
                id: 10,
                title: 'Test',
            } as any);

            await controller.getEvent(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockService.getEventById).toHaveBeenCalledWith(10, 1);
            expect(mockReply.status).toHaveBeenCalledWith(200);
        });

        it('powinien zwrócić 404 gdy wydarzenie nie istnieje', async () => {
            mockRequest.params = { eventId: '999' };
            mockService.getEventById.mockResolvedValue(null);

            await controller.getEvent(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(404);
        });
    });

    describe('inviteUsers', () => {
        it('powinien zwrócić 200 po zaproszeniu użytkowników', async () => {
            mockRequest.params = { eventId: '10' };
            mockRequest.body = { userIds: [2, 3] };
            mockService.inviteUsersToEvent.mockResolvedValue(undefined);

            await controller.inviteUsers(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockService.inviteUsersToEvent).toHaveBeenCalledWith(
                1,
                10,
                [2, 3]
            );
            expect(mockReply.status).toHaveBeenCalledWith(200);
        });

        it('powinien zwrócić 400 gdy userIds jest puste', async () => {
            mockRequest.params = { eventId: '10' };
            mockRequest.body = { userIds: [] };

            await controller.inviteUsers(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(400);
        });
    });

    describe('joinEvent', () => {
        it('powinien zwrócić 200 po dołączeniu', async () => {
            mockRequest.params = { eventId: '50' };
            mockService.joinPublicEvent.mockResolvedValue(undefined);

            await controller.joinEvent(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockService.joinPublicEvent).toHaveBeenCalledWith(1, 50);
            expect(mockReply.status).toHaveBeenCalledWith(200);
        });

        it('powinien obsłużyć błędy z serwisu (np. 500)', async () => {
            mockRequest.params = { eventId: '50' };
            mockService.joinPublicEvent.mockRejectedValue(
                new Error('Some error')
            );

            await controller.joinEvent(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(500);
        });
    });
});
