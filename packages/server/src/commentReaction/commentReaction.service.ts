import { db } from '@/db';
import {
    comments,
    posts,
    postReactions,
    commentReactions,
    users,
} from '@/db/schema';
import { NotificationService } from '@/notification/notification.service';
import { and, eq, asc, inArray } from 'drizzle-orm';
import { FastifyInstance } from 'fastify';

export interface CreateCommentData {
    postId: number;
    content: string;
    parentId?: number;
}

export interface CommentWithReplies {
    id: number;
    postId: number;
    userId: number;
    content: string;
    parentId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
    user: {
        id: number;
        name: string;
        surname: string;
        profilePictureUrl?: string | null;
    };
    replies: CommentWithReplies[];
    likeCount: number;
    isLiked: boolean;
}

export class CommentReactionService {
    private notificationService: NotificationService;

    constructor(server: FastifyInstance) {
        this.notificationService = new NotificationService(server);
    }

    async createComment(userId: number, data: CreateCommentData) {
        try {
            const post = await db.query.posts.findFirst({
                where: eq(posts.id, data.postId),
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                            surname: true,
                        },
                    },
                },
            });

            if (!post) {
                throw new Error('Post not found');
            }

            const commenter = await db.query.users.findFirst({
                where: eq(users.id, userId),
                columns: {
                    id: true,
                    name: true,
                    surname: true,
                },
            });

            if (!commenter) {
                throw new Error('User not found');
            }

            let parentComment = null;
            let parentCommentOwner = null;

            if (data.parentId) {
                parentComment = await db.query.comments.findFirst({
                    where: and(
                        eq(comments.id, data.parentId),
                        eq(comments.postId, data.postId)
                    ),
                    with: {
                        user: {
                            columns: {
                                id: true,
                                name: true,
                                surname: true,
                            },
                        },
                    },
                });

                if (!parentComment) {
                    throw new Error('Parent comment not found');
                }
                parentCommentOwner = parentComment.user;
            }

            const [newComment] = await db
                .insert(comments)
                .values({
                    postId: data.postId,
                    userId,
                    content: data.content,
                    parentId: data.parentId || null,
                })
                .returning();

            const commenterFullName = `${commenter.name} ${commenter.surname}`;

            if (
                parentComment &&
                parentCommentOwner &&
                parentCommentOwner.id !== userId
            ) {
                await this.notificationService.createNotification({
                    userId: parentCommentOwner.id,
                    type: 'comments',
                    content: `${commenterFullName} replied to your comment`,
                    relatedId: data.postId,
                });
            }

            if (
                post.user.id !== userId &&
                post.user.id !== parentCommentOwner?.id
            ) {
                await this.notificationService.notifyNewComment(
                    post.user.id,
                    userId,
                    commenterFullName,
                    data.postId
                );
            }

            return newComment;
        } catch (error) {
            console.error('Create comment error:', error);
            throw new Error(`Failed to create comment: ${error}`);
        }
    }

    async getPostComments(
        postId: number,
        currentUserId?: number
    ): Promise<CommentWithReplies[]> {
        try {
            const allComments = await db.query.comments.findMany({
                where: eq(comments.postId, postId),
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
            });

            if (allComments.length === 0) {
                return [];
            }

            const commentIds = allComments.map((c) => c.id);
            const allCommentLikes = await db.query.commentReactions.findMany({
                where: inArray(commentReactions.commentId, commentIds),
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
            });

            const likesMap = new Map<number, any[]>();
            allCommentLikes.forEach((like) => {
                const commentLikes = likesMap.get(like.commentId) || [];
                commentLikes.push(like);
                likesMap.set(like.commentId, commentLikes);
            });

            const parentComments = allComments.filter(
                (comment) => !comment.parentId
            );
            const replies = allComments.filter((comment) => comment.parentId);

            const commentsWithReplies: CommentWithReplies[] =
                parentComments.map((comment) => {
                    const commentLikes = likesMap.get(comment.id) || [];
                    const isLiked = currentUserId
                        ? commentLikes.some(
                              (like: any) => like.userId === currentUserId
                          )
                        : false;

                    return {
                        ...comment,
                        likeCount: commentLikes.length,
                        isLiked,
                        replies: replies
                            .filter((reply) => reply.parentId === comment.id)
                            .map((reply) => {
                                const replyLikes = likesMap.get(reply.id) || [];
                                const isReplyLiked = currentUserId
                                    ? replyLikes.some(
                                          (like: any) =>
                                              like.userId === currentUserId
                                      )
                                    : false;

                                return {
                                    ...reply,
                                    likeCount: replyLikes.length,
                                    isLiked: isReplyLiked,
                                    replies: [],
                                };
                            }),
                    };
                });

            return commentsWithReplies;
        } catch (error) {
            console.error('Failed to fetch comments:', error);
            throw new Error(`Failed to fetch comments: ${error}`);
        }
    }

    async deleteComment(userId: number, commentId: number) {
        try {
            const comment = await db.query.comments.findFirst({
                where: and(
                    eq(comments.id, commentId),
                    eq(comments.userId, userId)
                ),
            });

            if (!comment) {
                throw new Error('Comment not found or unauthorized');
            }

            await db.delete(comments).where(eq(comments.parentId, commentId));

            await db
                .delete(commentReactions)
                .where(eq(commentReactions.commentId, commentId));

            await db.delete(comments).where(eq(comments.id, commentId));
        } catch (error) {
            throw new Error(`Failed to delete comment: ${error}`);
        }
    }

    async toggleCommentLike(userId: number, commentId: number) {
        try {
            const comment = await db.query.comments.findFirst({
                where: eq(comments.id, commentId),
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                            surname: true,
                        },
                    },
                },
            });

            if (!comment) {
                throw new Error('Comment not found');
            }

            const existingLike = await db.query.commentReactions.findFirst({
                where: and(
                    eq(commentReactions.commentId, commentId),
                    eq(commentReactions.userId, userId)
                ),
            });

            if (existingLike) {
                await db
                    .delete(commentReactions)
                    .where(eq(commentReactions.id, existingLike.id));

                return { liked: false };
            } else {
                await db.insert(commentReactions).values({
                    commentId,
                    userId,
                });

                if (this.notificationService && comment.user.id !== userId) {
                    const liker = await db.query.users.findFirst({
                        where: eq(users.id, userId),
                        columns: {
                            name: true,
                            surname: true,
                        },
                    });

                    if (liker) {
                        const likerFullName = `${liker.name} ${liker.surname}`;
                        await this.notificationService.createNotification({
                            userId: comment.user.id,
                            type: 'post_reactions',
                            content: `${likerFullName} liked your comment`,
                            relatedId: comment.postId,
                        });
                    }
                }

                return { liked: true };
            }
        } catch (error) {
            throw new Error(`Failed to toggle comment like: ${error}`);
        }
    }

    async getCommentLikeInfo(commentId: number, userId?: number) {
        try {
            const likes = await db.query.commentReactions.findMany({
                where: eq(commentReactions.commentId, commentId),
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
            });

            const isLiked = userId
                ? likes.some((like) => like.userId === userId)
                : false;

            return {
                count: likes.length,
                isLiked,
                users: likes.map((like) => like.user),
            };
        } catch (error) {
            throw new Error(`Failed to get comment like info: ${error}`);
        }
    }

    async togglePostLike(userId: number, postId: number) {
        try {
            const post = await db.query.posts.findFirst({
                where: eq(posts.id, postId),
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                            surname: true,
                        },
                    },
                },
            });

            if (!post) {
                throw new Error('Post not found');
            }

            const existingLike = await db.query.postReactions.findFirst({
                where: and(
                    eq(postReactions.postId, postId),
                    eq(postReactions.userId, userId)
                ),
            });

            if (existingLike) {
                await db
                    .delete(postReactions)
                    .where(eq(postReactions.id, existingLike.id));

                return { liked: false };
            } else {
                await db.insert(postReactions).values({
                    postId,
                    userId,
                });

                if (this.notificationService && post.user.id !== userId) {
                    const liker = await db.query.users.findFirst({
                        where: eq(users.id, userId),
                        columns: {
                            name: true,
                            surname: true,
                        },
                    });

                    if (liker) {
                        const likerFullName = `${liker.name} ${liker.surname}`;
                        await this.notificationService.notifyPostReaction(
                            post.user.id,
                            userId,
                            likerFullName,
                            postId
                        );
                    }
                }

                return { liked: true };
            }
        } catch (error) {
            throw new Error(`Failed to toggle like: ${error}`);
        }
    }

    async getPostLikeInfo(postId: number, userId?: number) {
        try {
            const likes = await db.query.postReactions.findMany({
                where: eq(postReactions.postId, postId),
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
            });

            const isLiked = userId
                ? likes.some((like) => like.userId === userId)
                : false;

            return {
                count: likes.length,
                isLiked,
                users: likes.map((like) => like.user),
            };
        } catch (error) {
            throw new Error(`Failed to get like info: ${error}`);
        }
    }

    async updateComment(userId: number, commentId: number, content: string) {
        try {
            const comment = await db.query.comments.findFirst({
                where: and(
                    eq(comments.id, commentId),
                    eq(comments.userId, userId)
                ),
            });

            if (!comment) {
                throw new Error('Comment not found or unauthorized');
            }

            const [updatedComment] = await db
                .update(comments)
                .set({
                    content,
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(comments.id, commentId))
                .returning();

            return updatedComment;
        } catch (error) {
            throw new Error(`Failed to update comment: ${error}`);
        }
    }
}
