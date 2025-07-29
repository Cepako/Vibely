import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import { PostService } from './post.service';
import PostController from './post.controller';
import { AuthService } from '../auth/auth.service';
import UserService from '../user/user.service';
import { createAuthGuard } from '../hooks/authGuard';

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
        '/add',
        {
            schema: {
                body: Type.Object({}),
            },
        },

        async (
            req: FastifyRequest<{
                Body: { city: string; region: string; bio: string };
                Params: { profileId: number };
            }>,
            reply: FastifyReply
        ) => postController.addPost(req, reply)
    );
}
