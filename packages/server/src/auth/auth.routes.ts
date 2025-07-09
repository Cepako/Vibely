import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import AuthController from './auth.controller';
import { LoginBody, LoginSchema } from './auth.schema';
import { AuthService } from './auth.service';

export default async function authRoutes(fastify: FastifyInstance) {
    const authService = new AuthService();
    const authController = new AuthController(authService);

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

    //TODO:Logout - change users table (is_online,last_login_at), add to Login - change users table (is_online)
}
