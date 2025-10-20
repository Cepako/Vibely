import { FastifyReply, FastifyRequest } from 'fastify';
import { LoginBody } from './auth.schema';
import { AuthService } from './auth.service';
import { ENV } from '../utils/env';

const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15m
const REFRESH_TOKEN_MAX_AGE = 4 * 60 * 60; // 4h
export default class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    async verifyToken(req: FastifyRequest, reply: FastifyReply) {
        const token = req.cookies.accessToken;

        if (!token) {
            return reply.send({ user: null });
        }

        try {
            const payload = this.authService.verifyAccessToken(token);
            return reply.send({ user: payload });
        } catch (error) {
            return reply.send({ user: null });
        }
    }

    async login(req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
        const { email, password } = req.body;

        const { accessToken, refreshToken } = await this.authService.login(
            email,
            password
        );

        return reply
            .status(200)
            .setCookie('accessToken', accessToken, {
                httpOnly: true,
                secure: ENV.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: ACCESS_TOKEN_MAX_AGE,
            })
            .setCookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: ENV.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/api/auth/refresh',
                maxAge: REFRESH_TOKEN_MAX_AGE,
            })
            .send({ success: true });
    }

    async refreshToken(req: FastifyRequest, reply: FastifyReply) {
        const token = req.cookies.refreshToken;

        if (!token) {
            return reply
                .status(401)
                .send({ success: false, message: 'No refresh token' });
        }

        try {
            const newAccessToken =
                await this.authService.refreshAccessToken(token);

            return reply
                .status(200)
                .setCookie('accessToken', newAccessToken, {
                    httpOnly: true,
                    secure: ENV.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/',
                    maxAge: ACCESS_TOKEN_MAX_AGE,
                })
                .send({ success: true });
        } catch (error: any) {
            reply
                .clearCookie('accessToken', { path: '/' })
                .clearCookie('refreshToken', { path: '/api/auth/refresh' });

            return reply.status(401).send({
                success: false,
                message: error.message || 'Invalid token',
            });
        }
    }

    async logout(req: FastifyRequest, reply: FastifyReply) {
        const token = req.cookies.token;
        let userId: number | null = null;

        if (token) {
            try {
                const payload = this.authService.verifyAccessToken(token);
                userId = payload.id;
            } catch (error) {}
        }

        if (userId) {
            await this.authService.logout(userId);
        }

        reply
            .clearCookie('accessToken', { path: '/' })
            .clearCookie('refreshToken', { path: '/api/auth/refresh' })
            .send({ success: true });
    }
}
