import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import UserController from './user.controller';
import UserService from './user.service';
import { Type } from '@sinclair/typebox';
import { RegisterUser, RegisterUserSchema } from './user.schema';

export default async function userRoutes(fastify: FastifyInstance) {
    const userService = new UserService();
    const userController = new UserController(userService);

    fastify.post(
        '/register',
        {
            schema: {
                body: Type.Object({
                    user: RegisterUserSchema,
                }),
            },
        },
        (
            req: FastifyRequest<{ Body: { user: RegisterUser } }>,
            reply: FastifyReply
        ) => userController.registerUser(req, reply)
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
