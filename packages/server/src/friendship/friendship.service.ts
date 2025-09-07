import { db } from '../db';
import { friendships, users } from '../db/schema';
import { and, eq, or, inArray } from 'drizzle-orm';
import { FriendshipStatus } from './friendship.schema';
import { NotificationService } from '../notification/notification.service';

interface IFriendshipService {
    getFriends(userId: number): Promise<any[]>;
    getFriendRequests(userId: number): Promise<any[]>;
    getSentFriendRequests(userId: number): Promise<any[]>;
    sendFriendRequest(userId: number, friendId: number): Promise<void>;
    respondToFriendRequest(
        userId: number,
        friendshipId: number,
        status: FriendshipStatus
    ): Promise<void>;
    cancelFriendRequest(userId: number, friendshipId: number): Promise<void>;
    cancelFriendship(userId: number, friendshipId: number): Promise<void>;
    removeFriend(userId: number, friendId: number): Promise<void>;
    blockUser(userId: number, userToBlock: number): Promise<void>;
    unblockUser(userId: number, userToUnblock: number): Promise<void>;
    getBlockedUsers(userId: number): Promise<any[]>;
    getFriendshipStatus(
        currentUserId: number,
        targetUserId: number
    ): Promise<string>;
}

export class FriendshipService implements IFriendshipService {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    async getFriends(userId: number, viewerId?: number | null) {
        const friendshipData = await db.query.friendships.findMany({
            where: and(
                or(
                    eq(friendships.userId, userId),
                    eq(friendships.friendId, userId)
                ),
                eq(friendships.status, 'accepted')
            ),
            with: {
                user_userId: {
                    columns: {
                        id: true,
                        name: true,
                        surname: true,
                        profilePictureUrl: true,
                        isOnline: true,
                    },
                },
                user_friendId: {
                    columns: {
                        id: true,
                        name: true,
                        surname: true,
                        profilePictureUrl: true,
                        isOnline: true,
                    },
                },
            },
        });

        const mapped = friendshipData.map((friendship) => {
            const friend =
                friendship.userId === userId
                    ? friendship.user_friendId
                    : friendship.user_userId;
            return {
                ...friend,
                friendshipId: friendship.id,
                since: friendship.createdAt,
            };
        });

        if (!viewerId) return mapped;

        const friendIds = mapped.map((f) => f.id);
        if (friendIds.length === 0) return mapped;

        const blockedRows = await db.query.friendships.findMany({
            where: and(
                eq(friendships.status, 'blocked'),
                or(
                    and(
                        eq(friendships.userId, viewerId),
                        inArray(friendships.friendId, friendIds)
                    ),
                    and(
                        eq(friendships.friendId, viewerId),
                        inArray(friendships.userId, friendIds)
                    )
                )
            ),
        });

        const blockedSet = new Set<number>();
        for (const b of blockedRows) {
            if (b.userId === viewerId) blockedSet.add(b.friendId);
            if (b.friendId === viewerId) blockedSet.add(b.userId);
        }

        return mapped.filter((f) => !blockedSet.has(f.id));
    }

    async getFriendRequests(userId: number) {
        return await db.query.friendships.findMany({
            where: and(
                eq(friendships.friendId, userId),
                eq(friendships.status, 'pending')
            ),
            with: {
                user_userId: {
                    columns: {
                        id: true,
                        name: true,
                        surname: true,
                        profilePictureUrl: true,
                    },
                },
            },
        });
    }

    async sendFriendRequest(userId: number, friendId: number) {
        try {
            const existingFriendship = await db.query.friendships.findFirst({
                where: or(
                    and(
                        eq(friendships.userId, userId),
                        eq(friendships.friendId, friendId)
                    ),
                    and(
                        eq(friendships.userId, friendId),
                        eq(friendships.friendId, userId)
                    )
                ),
            });

            if (existingFriendship) {
                throw new Error('Friendship relationship already exists');
            }

            const friendUser = await db.query.users.findFirst({
                where: eq(users.id, friendId),
            });

            if (!friendUser) {
                throw new Error('User not found');
            }

            const isBlocked = await this.isUserBlocked(userId, friendId);
            if (isBlocked) {
                throw new Error('Cannot send friend request to blocked user');
            }

            const senderUser = await db.query.users.findFirst({
                where: eq(users.id, userId),
                columns: {
                    name: true,
                    surname: true,
                },
            });

            if (!senderUser) {
                throw new Error('Sender user not found');
            }

            await db.insert(friendships).values({
                userId,
                friendId,
                status: 'pending',
            });

            const senderFullName = `${senderUser.name} ${senderUser.surname}`;
            await this.notificationService.notifyFriendRequest(
                userId,
                friendId,
                senderFullName
            );
        } catch (error) {
            throw error;
        }
    }

    async respondToFriendRequest(
        userId: number,
        friendshipId: number,
        status: FriendshipStatus
    ) {
        try {
            const friendship = await db.query.friendships.findFirst({
                where: and(
                    eq(friendships.id, friendshipId),
                    eq(friendships.friendId, userId),
                    eq(friendships.status, 'pending')
                ),
            });

            if (!friendship) {
                throw new Error('Friend request not found or unauthorized');
            }

            if (status === 'accepted') {
                await db
                    .update(friendships)
                    .set({
                        status: 'accepted',
                        updatedAt: new Date().toISOString(),
                    })
                    .where(eq(friendships.id, friendshipId));

                const responderUser = await db.query.users.findFirst({
                    where: eq(users.id, userId),
                    columns: {
                        name: true,
                        surname: true,
                    },
                });

                if (responderUser) {
                    const responderFullName = `${responderUser.name} ${responderUser.surname}`;
                    await this.notificationService.notifyFriendRequestAccepted(
                        userId,
                        friendship.userId,
                        responderFullName
                    );
                }
            } else if (status === 'rejected') {
                await db
                    .delete(friendships)
                    .where(eq(friendships.id, friendshipId));
            }
        } catch (error) {
            throw error;
        }
    }

    async blockUser(userId: number, userToBlock: number) {
        try {
            const userExists = await db.query.users.findFirst({
                where: eq(users.id, userToBlock),
            });

            if (!userExists) {
                throw new Error('User not found');
            }

            const existingFriendship = await db.query.friendships.findFirst({
                where: or(
                    and(
                        eq(friendships.userId, userId),
                        eq(friendships.friendId, userToBlock)
                    ),
                    and(
                        eq(friendships.userId, userToBlock),
                        eq(friendships.friendId, userId)
                    )
                ),
            });

            if (existingFriendship) {
                await db
                    .delete(friendships)
                    .where(eq(friendships.id, existingFriendship.id));
            }

            await db.insert(friendships).values({
                userId,
                friendId: userToBlock,
                status: 'blocked',
            });
        } catch (error) {
            throw error;
        }
    }

    async unblockUser(userId: number, userToUnblock: number) {
        try {
            const friendship = await db.query.friendships.findFirst({
                where: and(
                    eq(friendships.userId, userId),
                    eq(friendships.friendId, userToUnblock),
                    eq(friendships.status, 'blocked')
                ),
            });

            if (!friendship) {
                throw new Error('Block relationship not found');
            }

            await db
                .delete(friendships)
                .where(eq(friendships.id, friendship.id));
        } catch (error) {
            throw error;
        }
    }

    async removeFriend(userId: number, friendId: number) {
        try {
            const friendship = await db.query.friendships.findFirst({
                where: and(
                    or(
                        and(
                            eq(friendships.userId, userId),
                            eq(friendships.friendId, friendId)
                        ),
                        and(
                            eq(friendships.userId, friendId),
                            eq(friendships.friendId, userId)
                        )
                    ),
                    eq(friendships.status, 'accepted')
                ),
            });

            if (!friendship) {
                throw new Error('Friendship not found');
            }

            await db
                .delete(friendships)
                .where(eq(friendships.id, friendship.id));
        } catch (error) {
            throw error;
        }
    }

    async getBlockedUsers(userId: number) {
        return await db.query.friendships.findMany({
            where: and(
                eq(friendships.userId, userId),
                eq(friendships.status, 'blocked')
            ),
            with: {
                user_friendId: {
                    columns: {
                        id: true,
                        name: true,
                        surname: true,
                        profilePictureUrl: true,
                    },
                },
            },
        });
    }

    async getFriendshipStatus(currentUserId: number, targetUserId: number) {
        if (currentUserId === targetUserId) {
            return 'self';
        }

        const friendship = await db.query.friendships.findFirst({
            where: or(
                and(
                    eq(friendships.userId, currentUserId),
                    eq(friendships.friendId, targetUserId)
                ),
                and(
                    eq(friendships.userId, targetUserId),
                    eq(friendships.friendId, currentUserId)
                )
            ),
        });

        if (!friendship) {
            return 'none';
        }

        if (friendship.status === 'blocked') {
            if (friendship.userId === currentUserId) {
                return 'blocked_by_you';
            } else {
                return 'blocked_by_them';
            }
        }

        if (friendship.status === 'pending') {
            if (friendship.userId === currentUserId) {
                return 'pending_sent';
            } else {
                return 'pending_received';
            }
        }

        return friendship.status;
    }

    private async isUserBlocked(
        userId: number,
        targetUserId: number
    ): Promise<boolean> {
        const friendshipBlock = await db.query.friendships.findFirst({
            where: and(
                or(
                    and(
                        eq(friendships.userId, userId),
                        eq(friendships.friendId, targetUserId)
                    ),
                    and(
                        eq(friendships.userId, targetUserId),
                        eq(friendships.friendId, userId)
                    )
                ),
                eq(friendships.status, 'blocked')
            ),
        });

        return !!friendshipBlock;
    }

    async getSentFriendRequests(userId: number) {
        return await db.query.friendships.findMany({
            where: and(
                eq(friendships.userId, userId),
                eq(friendships.status, 'pending')
            ),
            with: {
                user_friendId: {
                    columns: {
                        id: true,
                        name: true,
                        surname: true,
                        profilePictureUrl: true,
                    },
                },
            },
        });
    }

    async cancelFriendRequest(userId: number, friendshipId: number) {
        try {
            const friendship = await db.query.friendships.findFirst({
                where: and(
                    eq(friendships.id, friendshipId),
                    eq(friendships.status, 'pending')
                ),
            });

            if (!friendship) {
                throw new Error('not found');
            }

            if (friendship.userId !== userId) {
                throw new Error('unauthorized');
            }

            await db
                .delete(friendships)
                .where(eq(friendships.id, friendshipId));

            try {
                await this.notificationService.deleteFriendRequestNotification(
                    friendship.userId,
                    friendship.friendId
                );
            } catch (err) {
                console.error(
                    'Failed to delete friend-request notification',
                    err
                );
            }
        } catch (error) {
            throw error;
        }
    }

    async cancelFriendship(userId: number, friendshipId: number) {
        try {
            const friendship = await db.query.friendships.findFirst({
                where: and(
                    eq(friendships.id, friendshipId),
                    eq(friendships.userId, userId)
                ),
            });

            if (!friendship) {
                throw new Error('Friendship not found');
            }

            await db
                .delete(friendships)
                .where(eq(friendships.id, friendshipId));
        } catch (error) {
            throw error;
        }
    }
}
