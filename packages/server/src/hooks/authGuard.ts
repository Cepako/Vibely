import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../auth/auth.service';

export function createAuthGuard(authService: AuthService) {
    return async function authGuard(req: FastifyRequest, reply: FastifyReply) {
        const token = req.cookies.token;
        if (!token) {
            return reply.status(401).send({ error: 'Unauthenticated' });
        }

        try {
            const payload = authService.verifyToken(token);
            req.user = payload;
        } catch (err) {
            return reply
                .status(401)
                .send({ error: 'Invalid or expired token' });
        }
    };
}
