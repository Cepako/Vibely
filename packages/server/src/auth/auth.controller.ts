import { FastifyReply, FastifyRequest } from 'fastify';
import { LoginBody } from './auth.schema';
import { AuthService } from './auth.service';
import { ENV } from '../utils/env';

export default class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    async verifyToken(req: FastifyRequest, reply: FastifyReply) {
        const token = req.cookies.token;

        if (!token) {
            return reply.send({ user: null });
        }

        const payload = this.authService.verifyToken(token);
        return reply.send({ user: payload });
    }

    async login(req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
        const { email, password } = req.body;

        const token = await this.authService.login(email, password);

        return reply
            .status(200)
            .setCookie('token', token, {
                httpOnly: true,
                secure: ENV.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 2,
            })
            .send({ success: true });
    }

    async logout(req: FastifyRequest, reply: FastifyReply) {
        const token = req.cookies.token;

        if (token) {
            const payload = this.authService.verifyToken(token);

            const { id } = payload;

            this.authService.updateOnlineStatus(id, false);
            this.authService.updateLastLoginAt(id);
        }

        reply.clearCookie('token', { path: '/' }).send({ success: true });
    }
}
