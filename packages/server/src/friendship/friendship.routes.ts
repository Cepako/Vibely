import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type } from '@sinclair/typebox';
import FriendshipController from './friendship.controller';
import { FriendshipService } from './friendship.service';
import { FriendshipStatus, FriendshipStatusSchema } from './friendship.schema';
import { createAuthGuard } from '../hooks/authGuard';
import { AuthService } from '../auth/auth.service';

export async function friendshipRoutes(fastify: FastifyInstance) {
    const authService = new AuthService();
    const friendshipService = new FriendshipService();
    const friendshipController = new FriendshipController(friendshipService);

    const authGuard = createAuthGuard(authService);

    fastify.addHook('preHandler', authGuard);

    fastify.get(
        '/:userId/friends',
        {
            schema: {
                params: Type.Object({
                    userId: Type.Number(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { userId: number };
            }>,
            reply: FastifyReply
        ) => friendshipController.getFriends(req, reply)
    );

    fastify.get(
        '/friend-requests',
        async (req: FastifyRequest, reply: FastifyReply) =>
            friendshipController.getFriendRequests(req, reply)
    );

    fastify.get(
        '/friend-requests/sent',
        async (req: FastifyRequest, reply: FastifyReply) =>
            friendshipController.getSentFriendRequests(req, reply)
    );

    fastify.post(
        '/friend-requests',
        {
            schema: {
                body: Type.Object({
                    friendId: Type.Number(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Body: { friendId: number };
            }>,
            reply: FastifyReply
        ) => friendshipController.sendFriendRequest(req, reply)
    );

    fastify.put(
        '/friend-requests/:friendshipId',
        {
            schema: {
                params: Type.Object({
                    friendshipId: Type.Number(),
                }),
                body: Type.Object({
                    status: FriendshipStatusSchema,
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { friendshipId: number };
                Body: { status: FriendshipStatus };
            }>,
            reply: FastifyReply
        ) => friendshipController.respondToFriendRequest(req, reply)
    );

    fastify.delete(
        '/friend-requests/:friendshipId',
        {
            schema: {
                params: Type.Object({
                    friendshipId: Type.Number(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { friendshipId: number };
            }>,
            reply: FastifyReply
        ) => friendshipController.cancelFriendRequest(req, reply)
    );

    fastify.delete(
        '/friends/:friendId',
        {
            schema: {
                params: Type.Object({
                    friendId: Type.Number(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { friendId: number };
            }>,
            reply: FastifyReply
        ) => friendshipController.removeFriend(req, reply)
    );

    fastify.post(
        '/blocks',
        {
            schema: {
                body: Type.Object({
                    userId: Type.Number(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Body: { userId: number };
            }>,
            reply: FastifyReply
        ) => friendshipController.blockUser(req, reply)
    );

    fastify.delete(
        '/blocks/:userId',
        {
            schema: {
                params: Type.Object({
                    userId: Type.Number(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { userId: number };
            }>,
            reply: FastifyReply
        ) => friendshipController.unblockUser(req, reply)
    );

    fastify.get('/blocks', async (req: FastifyRequest, reply: FastifyReply) =>
        friendshipController.getBlockedUsers(req, reply)
    );

    fastify.get(
        '/friendship-status/:userId',
        {
            schema: {
                params: Type.Object({
                    userId: Type.Number(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { userId: number };
            }>,
            reply: FastifyReply
        ) => friendshipController.getFriendshipStatus(req, reply)
    );
}
