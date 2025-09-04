import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import UserController from './user.controller';
import UserService from './user.service';
import { Type } from '@sinclair/typebox';
import { RegisterUser } from './user.schema';
import { AuthService } from '../auth/auth.service';
import { createAuthGuard } from '../hooks/authGuard';
import { FriendshipService } from '../friendship/friendship.service';

export default async function userRoutes(fastify: FastifyInstance) {
    const friendshipService = new FriendshipService();
    const userService = new UserService(friendshipService);
    const authService = new AuthService();
    const userController = new UserController(userService);

    const authGuard = createAuthGuard(authService);

    fastify.post(
        '/register',
        async (req: FastifyRequest, reply: FastifyReply) => {
            const parts = req.parts();
            const fields: Record<string, any> = {};
            let profilePictureData: {
                buffer: Buffer;
                filename: string;
                mimetype: string;
            } | null = null;

            for await (const part of parts) {
                if (
                    part.type === 'file' &&
                    part.fieldname === 'profilePicture'
                ) {
                    const buffer = await part.toBuffer();
                    profilePictureData = {
                        buffer,
                        filename: part.filename,
                        mimetype: part.mimetype,
                    };
                } else if (part.type === 'field') {
                    fields[part.fieldname] = part.value;
                }
            }
            await userController.registerUser(
                fields as RegisterUser,
                profilePictureData,
                reply
            );
        }
    );

    fastify.post(
        '/check-email',
        {
            schema: {
                body: Type.Object({
                    email: Type.String({ format: 'email' }),
                }),
            },
        },
        (
            req: FastifyRequest<{ Body: { email: string } }>,
            reply: FastifyReply
        ) => userController.checkIsEmailAvailable(req, reply)
    );

    fastify.get(
        '/interests',
        async (req: FastifyRequest, reply: FastifyReply) =>
            userController.getInterests(req, reply)
    );

    await fastify.register(async function protectedRoutes(fastify) {
        fastify.addHook('preHandler', authGuard);

        fastify.get('/me', async (req: FastifyRequest, reply: FastifyReply) =>
            userController.me(req, reply)
        );

        fastify.get(
            '/profile/:profileId',
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
            ) => userController.getProfile(req, reply)
        );

        fastify.post(
            '/profile/edit/:profileId',
            {
                schema: {
                    params: Type.Object({
                        profileId: Type.Number(),
                    }),
                    body: Type.Object({
                        city: Type.String(),
                        region: Type.String(),
                        bio: Type.String(),
                        interests: Type.Optional(Type.Array(Type.Number())),
                    }),
                },
            },

            async (
                req: FastifyRequest<{
                    Body: {
                        city: string;
                        region: string;
                        bio: string;
                        interests?: number[];
                    };
                    Params: { profileId: number };
                }>,
                reply: FastifyReply
            ) => userController.editProfile(req, reply)
        );

        fastify.post(
            '/profile/edit/picture/:profileId',
            {
                schema: {
                    params: Type.Object({
                        profileId: Type.Number(),
                    }),
                },
            },

            async (
                req: FastifyRequest<{
                    Params: { profileId: number };
                }>,
                reply: FastifyReply
            ) => userController.updateProfilePicture(req, reply)
        );
    });
}
