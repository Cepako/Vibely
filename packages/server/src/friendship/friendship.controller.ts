import { FastifyReply, FastifyRequest } from 'fastify';
import { FriendshipService } from './friendship.service';
import { FriendshipStatus } from './friendship.schema';

export default class FriendshipController {
    private friendshipService: FriendshipService;

    constructor(friendshipService: FriendshipService) {
        this.friendshipService = friendshipService;
    }

    async getFriends(
        req: FastifyRequest<{ Params: { userId: number } }>,
        reply: FastifyReply
    ) {
        try {
            const { userId } = req.params;

            const friends = await this.friendshipService.getFriends(userId);
            return reply.status(200).send(friends);
        } catch (error: any) {
            return reply.status(500).send({
                error: error.message || 'Failed to fetch friends',
            });
        }
    }

    async getFriendRequests(req: FastifyRequest, reply: FastifyReply) {
        try {
            const { id: userId } = req.user;
            const friendRequests =
                await this.friendshipService.getFriendRequests(userId);
            return reply.status(200).send(friendRequests);
        } catch (error: any) {
            return reply.status(500).send({
                error: error.message || 'Failed to fetch friend requests',
            });
        }
    }

    async sendFriendRequest(
        req: FastifyRequest<{
            Body: { friendId: number };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: userId } = req.user;
            const { friendId } = req.body;

            if (userId === friendId) {
                return reply.status(400).send({
                    error: 'Cannot send friend request to yourself',
                });
            }

            await this.friendshipService.sendFriendRequest(userId, friendId);
            return reply.status(201).send({
                message: 'Friend request sent successfully',
            });
        } catch (error: any) {
            if (error.message.includes('already exists')) {
                return reply.status(409).send({
                    error: 'Friend request already exists',
                });
            }
            if (error.message.includes('User not found')) {
                return reply.status(404).send({
                    error: 'User not found',
                });
            }
            return reply.status(500).send({
                error: error.message || 'Failed to send friend request',
            });
        }
    }

    async respondToFriendRequest(
        req: FastifyRequest<{
            Params: { friendshipId: number };
            Body: { status: FriendshipStatus };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: userId } = req.user;
            const { friendshipId } = req.params;
            const { status } = req.body;

            if (!['accepted', 'rejected'].includes(status)) {
                return reply.status(400).send({
                    error: 'Invalid status. Must be "accepted" or "rejected"',
                });
            }

            await this.friendshipService.respondToFriendRequest(
                userId,
                friendshipId,
                status
            );

            return reply.status(200).send({
                message: `Friend request ${status} successfully`,
            });
        } catch (error: any) {
            if (
                error.message.includes('not found') ||
                error.message.includes('unauthorized')
            ) {
                return reply.status(404).send({
                    error: 'Friend request not found or unauthorized',
                });
            }
            return reply.status(500).send({
                error: error.message || 'Failed to respond to friend request',
            });
        }
    }

    async blockUser(
        req: FastifyRequest<{
            Body: { userId: number };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: currentUserId } = req.user;
            const { userId: userToBlock } = req.body;

            if (currentUserId === userToBlock) {
                return reply.status(400).send({
                    error: 'Cannot block yourself',
                });
            }

            await this.friendshipService.blockUser(currentUserId, userToBlock);

            return reply.status(200).send({
                message: 'User blocked successfully',
            });
        } catch (error: any) {
            if (error.message.includes('User not found')) {
                return reply.status(404).send({
                    error: 'User not found',
                });
            }
            return reply.status(500).send({
                error: error.message || 'Failed to block user',
            });
        }
    }

    async unblockUser(
        req: FastifyRequest<{
            Params: { userId: number };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: currentUserId } = req.user;
            const { userId: userToUnblock } = req.params;

            await this.friendshipService.unblockUser(
                currentUserId,
                userToUnblock
            );

            return reply.status(200).send({
                message: 'User unblocked successfully',
            });
        } catch (error: any) {
            if (error.message.includes('not found')) {
                return reply.status(404).send({
                    error: 'Block relationship not found',
                });
            }
            return reply.status(500).send({
                error: error.message || 'Failed to unblock user',
            });
        }
    }

    async removeFriend(
        req: FastifyRequest<{
            Params: { friendId: number };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: userId } = req.user;
            const { friendId } = req.params;

            await this.friendshipService.removeFriend(userId, friendId);

            return reply.status(200).send({
                message: 'Friend removed successfully',
            });
        } catch (error: any) {
            if (error.message.includes('not found')) {
                return reply.status(404).send({
                    error: 'Friendship not found',
                });
            }
            return reply.status(500).send({
                error: error.message || 'Failed to remove friend',
            });
        }
    }

    async getBlockedUsers(req: FastifyRequest, reply: FastifyReply) {
        try {
            const { id: userId } = req.user;
            const blockedUsers =
                await this.friendshipService.getBlockedUsers(userId);
            return reply.status(200).send(blockedUsers);
        } catch (error: any) {
            return reply.status(500).send({
                error: error.message || 'Failed to fetch blocked users',
            });
        }
    }

    async getFriendshipStatus(
        req: FastifyRequest<{
            Params: { userId: number };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: currentUserId } = req.user;
            const { userId } = req.params;

            const status = await this.friendshipService.getFriendshipStatus(
                currentUserId,
                userId
            );

            return reply.status(200).send({ status });
        } catch (error: any) {
            return reply.status(500).send({
                error: error.message || 'Failed to get friendship status',
            });
        }
    }

    async getSentFriendRequests(req: FastifyRequest, reply: FastifyReply) {
        try {
            const { id: userId } = req.user;
            const sentRequests =
                await this.friendshipService.getSentFriendRequests(userId);
            return reply.status(200).send(sentRequests);
        } catch (error: any) {
            return reply.status(500).send({
                error: error.message || 'Failed to fetch sent friend requests',
            });
        }
    }

    async cancelFriendRequest(
        req: FastifyRequest<{
            Params: { friendshipId: number };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: userId } = req.user;
            const { friendshipId } = req.params;

            await this.friendshipService.cancelFriendRequest(
                userId,
                friendshipId
            );

            return reply.status(200).send({
                message: 'Friend request cancelled successfully',
            });
        } catch (error: any) {
            if (
                error.message.includes('not found') ||
                error.message.includes('unauthorized')
            ) {
                return reply.status(404).send({
                    error: 'Friend request not found or unauthorized',
                });
            }
            return reply.status(500).send({
                error: error.message || 'Failed to cancel friend request',
            });
        }
    }
}
