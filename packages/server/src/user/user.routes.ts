import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import UserController from './user.controller';
import UserService from './user.service';
import { Type } from '@sinclair/typebox';
import { RegisterUser } from './user.schema';
import { AuthService } from '../auth/auth.service';

export default async function userRoutes(fastify: FastifyInstance) {
    const userService = new UserService();
    const authService = new AuthService();
    const userController = new UserController(userService, authService);

    fastify.get('/me', async (req: FastifyRequest, reply: FastifyReply) =>
        userController.me(req, reply)
    );

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
}
