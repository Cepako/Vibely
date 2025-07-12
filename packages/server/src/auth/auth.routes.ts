import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import AuthController from './auth.controller';
import { LoginBody, LoginSchema } from './auth.schema';
import { AuthService } from './auth.service';

export default async function authRoutes(fastify: FastifyInstance) {
    const authService = new AuthService();
    const authController = new AuthController(authService);

    fastify.get('/verify', (req: FastifyRequest, reply: FastifyReply) =>
        authController.verifyToken(req, reply)
    );

    fastify.post(
        '/login',
        {
            schema: {
                body: LoginSchema,
            },
        },
        (req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) =>
            authController.login(req, reply)
    );

    fastify.post('/logout', (req: FastifyRequest, reply: FastifyReply) =>
        authController.logout(req, reply)
    );
}
