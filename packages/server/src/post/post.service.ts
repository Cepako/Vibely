import { and, eq, or } from 'drizzle-orm';
import { db } from '../db';
import { posts } from '../db/schema';
import { FriendshipStatus } from 'user/user.schema';

interface IPostService {
    getPosts: (
        profileId: number,
        viewerId: number,
        friendshipStatus: FriendshipStatus | null
    ) => Promise<any>;
}

export class PostService implements IPostService {
    constructor() {}

    async getPosts(
        profileId: number,
        viewerId: number,
        friendshipStatus: FriendshipStatus | null
    ) {
        if (profileId === viewerId)
            return await db.query.posts.findMany({
                where: eq(posts.userId, profileId),
            });

        if (friendshipStatus !== 'accepted')
            return await db.query.posts.findMany({
                where: and(
                    eq(posts.userId, profileId),
                    or(eq(posts.privacyLevel, 'public'))
                ),
            });
        return await db.query.posts.findMany({
            where: and(
                eq(posts.userId, profileId),
                or(
                    eq(posts.privacyLevel, 'public'),
                    eq(posts.privacyLevel, 'friends')
                )
            ),
        });
    }
}
