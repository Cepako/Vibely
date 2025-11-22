jest.mock('../../utils/env', () => ({
    ENV: { NODE_ENV: 'development' },
}));
jest.mock('../../db', () => ({ db: {} }));

import FriendshipController from '../friendship.controller';
import { FriendshipService } from '../friendship.service';
import { FastifyRequest, FastifyReply } from 'fastify';

jest.mock('../friendship.service');

describe('FriendshipController', () => {
    let controller: FriendshipController;
    let mockService: jest.Mocked<FriendshipService>;
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        mockService = new FriendshipService() as jest.Mocked<FriendshipService>;
        controller = new FriendshipController(mockService);

        mockRequest = {
            user: { id: 1 } as any,
            body: {},
            params: {},
        };

        mockReply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('sendFriendRequest', () => {
        it('powinien zwrócić 201 przy sukcesie', async () => {
            mockRequest.body = { friendId: 2 };
            mockService.sendFriendRequest.mockResolvedValue(undefined);

            await controller.sendFriendRequest(
                mockRequest as FastifyRequest<{ Body: any }>,
                mockReply as FastifyReply
            );

            expect(mockService.sendFriendRequest).toHaveBeenCalledWith(1, 2);
            expect(mockReply.status).toHaveBeenCalledWith(201);
        });

        it('powinien zwrócić 400 przy próbie dodania samego siebie', async () => {
            mockRequest.body = { friendId: 1 };

            await controller.sendFriendRequest(
                mockRequest as FastifyRequest<{ Body: any }>,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({
                error: 'Cannot send friend request to yourself',
            });
        });

        it('powinien zwrócić 409 gdy zaproszenie już istnieje', async () => {
            mockRequest.body = { friendId: 2 };
            mockService.sendFriendRequest.mockRejectedValue(
                new Error('already exists')
            );

            await controller.sendFriendRequest(
                mockRequest as FastifyRequest<{ Body: any }>,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(409);
        });
    });

    describe('respondToFriendRequest', () => {
        it('powinien zwrócić 200 przy poprawnej odpowiedzi', async () => {
            mockRequest.params = { friendshipId: 10 };
            mockRequest.body = { status: 'accepted' };

            await controller.respondToFriendRequest(
                mockRequest as FastifyRequest<{ Params: any; Body: any }>,
                mockReply as FastifyReply
            );

            expect(mockService.respondToFriendRequest).toHaveBeenCalledWith(
                1,
                10,
                'accepted'
            );
            expect(mockReply.status).toHaveBeenCalledWith(200);
        });

        it('powinien zwrócić 400 przy błędnym statusie', async () => {
            mockRequest.body = { status: 'blocked' };

            await controller.respondToFriendRequest(
                mockRequest as FastifyRequest<{ Params: any; Body: any }>,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(400);
        });
    });

    describe('blockUser', () => {
        it('powinien zwrócić 200 po zablokowaniu', async () => {
            mockRequest.body = { userId: 5 };

            await controller.blockUser(
                mockRequest as FastifyRequest<{ Body: any }>,
                mockReply as FastifyReply
            );

            expect(mockService.blockUser).toHaveBeenCalledWith(1, 5);
            expect(mockReply.status).toHaveBeenCalledWith(200);
        });

        it('powinien zwrócić 400 przy próbie zablokowania siebie', async () => {
            mockRequest.body = { userId: 1 };

            await controller.blockUser(
                mockRequest as FastifyRequest<{ Body: any }>,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(400);
        });
    });

    describe('getFriends', () => {
        it('powinien zwrócić listę znajomych', async () => {
            mockRequest.params = { userId: 1 };
            const fakeFriends = [
                {
                    id: 2,
                    name: 'John',
                    surname: 'Doe',
                    profilePictureUrl: null,
                    friendshipId: 100,
                    since: '2024-01-01',
                },
            ];
            mockService.getFriends.mockResolvedValue(fakeFriends);

            await controller.getFriends(
                mockRequest as FastifyRequest<{ Params: any }>,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith(fakeFriends);
        });
    });

    describe('cancelFriendRequest', () => {
        it('powinien anulować zaproszenie', async () => {
            mockRequest.params = { friendshipId: 10 };

            await controller.cancelFriendRequest(
                mockRequest as FastifyRequest<{ Params: any }>,
                mockReply as FastifyReply
            );

            expect(mockService.cancelFriendRequest).toHaveBeenCalledWith(1, 10);
            expect(mockReply.status).toHaveBeenCalledWith(200);
        });

        it('powinien zwrócić 404 gdy nie znaleziono', async () => {
            mockRequest.params = { friendshipId: 10 };
            mockService.cancelFriendRequest.mockRejectedValue(
                new Error('not found')
            );

            await controller.cancelFriendRequest(
                mockRequest as FastifyRequest<{ Params: any }>,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(404);
        });
    });
});
