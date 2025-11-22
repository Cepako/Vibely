import AuthController from '../auth.controller';
import { AuthService } from '../auth.service';
import { FastifyRequest, FastifyReply } from 'fastify';

jest.mock('../../utils/env', () => ({
    ENV: {
        NODE_ENV: 'development',
        COOKIE_SECRET: 'test-cookie-secret',
    },
}));

jest.mock('../../db', () => ({
    db: {},
}));

jest.mock('../auth.service');

describe('AuthController', () => {
    let authController: AuthController;
    let mockAuthService: jest.Mocked<AuthService>;
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;

    beforeEach(() => {
        mockAuthService = new AuthService() as jest.Mocked<AuthService>;
        authController = new AuthController(mockAuthService);

        mockRequest = {
            body: {},
            cookies: {},
        };

        mockReply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            setCookie: jest.fn().mockReturnThis(),
            clearCookie: jest.fn().mockReturnThis(),
        };
    });

    describe('login', () => {
        it('powinien ustawić ciasteczka i zwrócić sukces przy poprawnym logowaniu', async () => {
            mockRequest.body = { email: 'test@example.com', password: 'pass' };
            mockAuthService.login.mockResolvedValue({
                accessToken: 'access_123',
                refreshToken: 'refresh_123',
            });

            await authController.login(
                mockRequest as FastifyRequest<{ Body: any }>,
                mockReply as FastifyReply
            );

            expect(mockAuthService.login).toHaveBeenCalledWith(
                'test@example.com',
                'pass'
            );

            expect(mockReply.status).toHaveBeenCalledWith(200);

            expect(mockReply.setCookie).toHaveBeenCalledWith(
                'accessToken',
                'access_123',
                expect.objectContaining({ httpOnly: true, path: '/' })
            );
            expect(mockReply.setCookie).toHaveBeenCalledWith(
                'refreshToken',
                'refresh_123',
                expect.objectContaining({ path: '/api/auth/refresh' })
            );

            expect(mockReply.send).toHaveBeenCalledWith({ success: true });
        });

        it('powinien przekazać błąd dalej, jeśli serwis rzuci wyjątek', async () => {
            mockRequest.body = { email: 'test@example.com', password: 'wrong' };
            const error = new Error('Invalid credentials');
            mockAuthService.login.mockRejectedValue(error);

            await expect(
                authController.login(
                    mockRequest as FastifyRequest<{ Body: any }>,
                    mockReply as FastifyReply
                )
            ).rejects.toThrow('Invalid credentials');
        });
    });

    describe('verifyToken', () => {
        it('powinien zwrócić user: null, jeśli brak tokena w cookies', async () => {
            mockRequest.cookies = {};

            await authController.verifyToken(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.send).toHaveBeenCalledWith({ user: null });
        });

        it('powinien zwrócić usera, jeśli token jest poprawny', async () => {
            mockRequest.cookies = { accessToken: 'valid_token' };
            const mockPayload = { id: 1, email: 'test@mail.com' };
            mockAuthService.verifyAccessToken.mockReturnValue(mockPayload);

            await authController.verifyToken(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockAuthService.verifyAccessToken).toHaveBeenCalledWith(
                'valid_token'
            );
            expect(mockReply.send).toHaveBeenCalledWith({ user: mockPayload });
        });
    });

    describe('logout', () => {
        it('powinien wyczyścić ciasteczka i wywołać serwis logout', async () => {
            mockRequest.cookies = { token: 'some_token' };
            mockAuthService.verifyAccessToken.mockReturnValue({
                id: 123,
                email: 't',
            });

            await authController.logout(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockAuthService.logout).toHaveBeenCalledWith(123);
            expect(mockReply.clearCookie).toHaveBeenCalledWith(
                'accessToken',
                expect.any(Object)
            );
            expect(mockReply.clearCookie).toHaveBeenCalledWith(
                'refreshToken',
                expect.any(Object)
            );
            expect(mockReply.send).toHaveBeenCalledWith({ success: true });
        });
    });
});
