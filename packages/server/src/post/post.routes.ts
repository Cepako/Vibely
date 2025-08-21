import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { PostService } from './post.service';
import PostController from './post.controller';
import { AuthService } from '../auth/auth.service';
import { createAuthGuard } from '../hooks/authGuard';
import { PrivacyLevel, PrivacyLevelSchema } from './post.schema';
import { FriendshipService } from '../friendship/friendship.service';

export default async function postRoutes(fastify: FastifyInstance) {
    const authService = new AuthService();
    const friendshipService = new FriendshipService();
    const postService = new PostService();
    const postController = new PostController(postService, friendshipService);

    const authGuard = createAuthGuard(authService);

    fastify.addHook('preHandler', authGuard);

    fastify.get(
        '/:profileId',
        {
            schema: {
                params: Type.Object({
                    profileId: Type.Number(),
                }),
            },
        },
        async (
            req: FastifyRequest<{ Params: { profileId: number } }>,
            reply: FastifyReply
        ) => postController.getPosts(req, reply)
    );

    fastify.post(
        '/create',
        {
            schema: {
                consumes: ['multipart/form-data'],
            },
        },
        async (req: FastifyRequest, reply: FastifyReply) =>
            postController.createPost(req, reply)
    );

    fastify.put(
        '/:postId/edit',
        {
            schema: {
                params: Type.Object({
                    postId: Type.Number(),
                }),
                body: Type.Object({
                    content: Type.Optional(
                        Type.String({ minLength: 1, maxLength: 2000 })
                    ),
                    privacyLevel: Type.Optional(PrivacyLevelSchema),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { postId: number };
                Body: {
                    content: string;
                    privacyLevel: PrivacyLevel;
                };
            }>,
            reply: FastifyReply
        ) => postController.editPost(req, reply)
    );

    fastify.delete(
        '/:postId',
        {
            schema: {
                params: Type.Object({
                    postId: Type.Number(),
                }),
            },
        },
        async (
            req: FastifyRequest<{ Params: { postId: number } }>,
            reply: FastifyReply
        ) => postController.deletePost(req, reply)
    );

    fastify.get(
        '/home-feed',
        {
            schema: {
                querystring: Type.Object({
                    limit: Type.Optional(
                        Type.Number({ minimum: 1, maximum: 50 })
                    ),
                    offset: Type.Optional(Type.Number({ minimum: 0 })),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Querystring: {
                    limit?: number;
                    offset?: number;
                };
            }>,
            reply: FastifyReply
        ) => postController.getHomeFeed(req, reply)
    );
}
