import { AuthService } from '../auth.service';
import { db } from '../../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../../utils/env', () => ({
    ENV: {
        NODE_ENV: 'development',
        COOKIE_SECRET: 'test-cookie-secret',
    },
}));

jest.mock('../../db', () => ({
    db: {
        query: {
            users: {
                findFirst: jest.fn(),
            },
        },
        update: jest.fn(),
    },
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
    let authService: AuthService;

    const mockUpdateReturn = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(true),
    };

    beforeEach(() => {
        authService = new AuthService();

        jest.clearAllMocks();
        (db.update as jest.Mock).mockReturnValue(mockUpdateReturn);
    });

    describe('login', () => {
        const mockUser = {
            id: 1,
            email: 'test@example.com',
            password: 'hashedPassword123',
        };

        it('powinien zwrócić tokeny, gdy dane logowania są poprawne', async () => {
            (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock)
                .mockReturnValueOnce('access_token')
                .mockReturnValueOnce('refresh_token');
            (bcrypt.hash as jest.Mock).mockResolvedValue(
                'hashed_refresh_token'
            );

            const result = await authService.login(
                'test@example.com',
                'password123'
            );

            expect(db.query.users.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({ where: expect.anything() })
            );
            expect(bcrypt.compare).toHaveBeenCalledWith(
                'password123',
                mockUser.password
            );
            expect(result).toEqual({
                accessToken: 'access_token',
                refreshToken: 'refresh_token',
            });

            expect(db.update).toHaveBeenCalled();
        });

        it('powinien rzucić błąd INVALID_CREDENTIALS, gdy użytkownik nie istnieje', async () => {
            (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(
                authService.login('wrong@example.com', 'password123')
            ).rejects.toThrow('Invalid credentials');
        });

        it('powinien rzucić błąd INVALID_CREDENTIALS, gdy hasło jest nieprawidłowe', async () => {
            (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                authService.login('test@example.com', 'wrongpassword')
            ).rejects.toThrow('Invalid credentials');
        });
    });

    describe('verifyAccessToken', () => {
        it('powinien zwrócić payload, gdy token jest poprawny', () => {
            const payload = { id: 1, email: 'test@example.com' };
            (jwt.verify as jest.Mock).mockReturnValue(payload);

            const result = authService.verifyAccessToken('valid_token');
            expect(result).toEqual(payload);
        });

        it('powinien rzucić błąd INVALID_TOKEN, gdy weryfikacja JWT się nie powiedzie', () => {
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('JWT Error');
            });

            expect(() =>
                authService.verifyAccessToken('invalid_token')
            ).toThrow('Invalid or expired token');
        });
    });

    describe('logout', () => {
        it('powinien wyczyścić refresh token w bazie danych', async () => {
            await authService.logout(1);

            expect(db.update).toHaveBeenCalled();
            expect(mockUpdateReturn.set).toHaveBeenCalledWith(
                expect.objectContaining({ refreshToken: null })
            );
        });
    });
});
