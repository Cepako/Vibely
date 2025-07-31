import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { PostService } from './post.service';
import PostController from './post.controller';
import { AuthService } from '../auth/auth.service';
import UserService from '../user/user.service';
import { createAuthGuard } from '../hooks/authGuard';
import {
    ContentType,
    ContentTypeSchema,
    PrivacyLevel,
    PrivacyLevelSchema,
} from './post.schema';

export default async function postRoutes(fastify: FastifyInstance) {
    const authService = new AuthService();
    const userService = new UserService();
    const postService = new PostService();
    const postController = new PostController(postService, userService);

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
                consumes: ['multipart/form-data'],
                params: Type.Object({
                    postId: Type.Number(),
                }),
                body: Type.Object({
                    content: Type.Optional(
                        Type.String({ minLength: 1, maxLength: 2000 })
                    ),
                    contentType: Type.Optional(ContentTypeSchema),
                    privacyLevel: Type.Optional(PrivacyLevelSchema),
                    removeFile: Type.Optional(Type.Boolean()),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { postId: number };
                Body: {
                    content?: string;
                    contentType?: ContentType;
                    privacyLevel?: PrivacyLevel;
                    removeFile?: boolean;
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
}
