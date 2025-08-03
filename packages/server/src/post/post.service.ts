import { and, asc, desc, eq, or } from 'drizzle-orm';
import { db } from '../db';
import { comments, posts } from '../db/schema';
import { FriendshipStatus } from 'user/user.schema';
import { FileInput, handleFileUpload } from '../utils/handleFileUpload';
import { ContentType, PrivacyLevel } from './post.schema';
import { deleteFile } from '../utils/deleteFile';
import { Comment, Post } from './post.model';

interface IPostService {
    getPosts: (
        profileId: number,
        viewerId: number,
        friendshipStatus: FriendshipStatus | null
    ) => Promise<
        Array<
            Post & {
                user: UserInfo;
                comments: Array<Comment & { user: UserInfo }>;
                postReactions: Array<{ user: UserInfo }>;
            }
        >
    >;
    createPost: (userId: number, data: CreatePostData) => Promise<Post | null>;
    editPost: (
        postId: number,
        userId: number,
        data: UpdatePostData
    ) => Promise<Post>;
    deletePost: (postId: number, userId: number) => Promise<void>;
}

export class PostService implements IPostService {
    constructor() {}

    async getPosts(
        profileId: number,
        viewerId: number,
        friendshipStatus: FriendshipStatus | null
    ): Promise<
        Array<
            Post & {
                user: UserInfo;
                comments: Array<Comment & { user: UserInfo }>;
                postReactions: Array<{ user: UserInfo }>;
            }
        >
    > {
        let whereCondition;

        if (profileId === viewerId) {
            whereCondition = eq(posts.userId, profileId);
        } else if (friendshipStatus !== 'accepted') {
            whereCondition = and(
                eq(posts.userId, profileId),
                eq(posts.privacyLevel, 'public')
            );
        } else {
            whereCondition = and(
                eq(posts.userId, profileId),
                or(
                    eq(posts.privacyLevel, 'public'),
                    eq(posts.privacyLevel, 'friends')
                )
            );
        }

        return await db.query.posts.findMany({
            where: whereCondition,
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                        surname: true,
                        profilePictureUrl: true,
                    },
                },
                comments: {
                    with: {
                        user: {
                            columns: {
                                id: true,
                                name: true,
                                surname: true,
                                profilePictureUrl: true,
                            },
                        },
                    },
                    orderBy: [asc(comments.createdAt)],
                },
                postReactions: {
                    with: {
                        user: {
                            columns: {
                                id: true,
                                name: true,
                                surname: true,
                                profilePictureUrl: true,
                            },
                        },
                    },
                },
            },
            orderBy: [desc(posts.createdAt)],
        });
    }

    async createPost(
        userId: number,
        data: CreatePostData
    ): Promise<Post | null> {
        try {
            let contentUrl: string | null = null;

            if (data.file) {
                const allowedTypes =
                    data.contentType === 'photo'
                        ? ['image/']
                        : data.contentType === 'video'
                          ? ['video/']
                          : ['image/', 'video/'];

                contentUrl = await handleFileUpload(data.file, {
                    allowedTypes,
                    maxSizeInMB: data.contentType === 'video' ? 100 : 50,
                    subFolder: 'posts',
                });
            }

            const [newPost] = await db
                .insert(posts)
                .values({
                    userId,
                    content: data.content,
                    contentType: data.contentType,
                    privacyLevel: data.privacyLevel,
                    contentUrl,
                })
                .returning();

            return newPost ?? null;
        } catch (error) {
            throw new Error(`Failed to create post: ${error}`);
        }
    }

    async editPost(
        postId: number,
        userId: number,
        data: UpdatePostData
    ): Promise<Post> {
        try {
            const existingPost = await db.query.posts.findFirst({
                where: and(eq(posts.id, postId), eq(posts.userId, userId)),
            });

            if (!existingPost) {
                throw new Error('Post not found or unauthorized');
            }

            let contentUrl = existingPost.contentUrl;

            const [updatedPost] = await db
                .update(posts)
                .set({
                    ...(data.content && {
                        content: data.content,
                    }),
                    ...(data.privacyLevel && {
                        privacyLevel: data.privacyLevel,
                    }),
                    contentUrl,
                    updatedAt: new Date().toISOString(),
                })
                .where(and(eq(posts.id, postId), eq(posts.userId, userId)))
                .returning();

            if (!updatedPost) {
                throw new Error('Failed to update post');
            }

            return updatedPost;
        } catch (error) {
            throw new Error(`Failed to edit post: ${error}`);
        }
    }

    async deletePost(postId: number, userId: number) {
        try {
            const existingPost = await db.query.posts.findFirst({
                where: and(eq(posts.id, postId), eq(posts.userId, userId)),
            });

            if (!existingPost) {
                throw new Error('Post not found or unauthorized');
            }

            if (existingPost.contentUrl) {
                await deleteFile(existingPost.contentUrl);
            }

            await db
                .delete(posts)
                .where(and(eq(posts.id, postId), eq(posts.userId, userId)));
        } catch (error) {
            throw new Error(`Failed to delete post: ${error}`);
        }
    }
}

interface CreatePostData {
    content: string;
    contentType: ContentType;
    privacyLevel: PrivacyLevel;
    file: FileInput;
}

export interface UpdatePostData {
    content: string;
    privacyLevel: PrivacyLevel;
}

interface UserInfo {
    id: number;
    name: string;
    surname: string;
    profilePictureUrl?: string | null;
}
