import { db } from '../db';
import { users } from '../db/schema';
import { User } from '../user/user.model';
import createError from '@fastify/error';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ENV } from '../utils/env';
import { Payload } from './auth.schema';

const InvalidToken = createError(
    'INVALID_TOKEN',
    'Invalid or expired token',
    401
);
const InvalidCredentials = createError(
    'INVALID_CREDENTIALS',
    'Invalid credentials',
    401
);
const TokenRevoked = createError(
    'TOKEN_REVOKED',
    'Token has been revoked',
    401
);

interface IAuthService {
    verifyAccessToken: (token: string) => Payload;
    login: (
        email: string,
        password: string
    ) => Promise<{ accessToken: string; refreshToken: string }>;
    refreshAccessToken: (refreshToken: string) => Promise<string>;
    logout: (userId: number) => Promise<void>;
}

export class AuthService implements IAuthService {
    constructor() {}

    verifyAccessToken(token: string): Payload {
        try {
            const payload = jwt.verify(token, ENV.JWT_SECRET);
            return payload as Payload;
        } catch (error) {
            throw new InvalidToken();
        }
    }

    private verifyRefreshToken(token: string): Payload {
        try {
            const payload = jwt.verify(token, ENV.JWT_REFRESH_SECRET);
            return payload as Payload;
        } catch (error) {
            throw new InvalidToken();
        }
    }

    async login(
        email: string,
        password: string
    ): Promise<{ accessToken: string; refreshToken: string }> {
        email = email.trim().toLowerCase();
        const user = await this.findUserByEmail(email);

        if (!user) {
            throw new InvalidCredentials();
        }

        const isPasswordValid = await this.verifyPassword(
            password,
            user.password
        );

        if (!isPasswordValid) {
            throw new InvalidCredentials();
        }

        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);

        await this.storeRefreshToken(user.id, refreshToken);

        return { accessToken, refreshToken };
    }

    async refreshAccessToken(token: string): Promise<string> {
        let payload: Payload;
        try {
            payload = this.verifyRefreshToken(token);
        } catch (error) {
            throw new TokenRevoked();
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, payload.id),
        });

        if (!user || !user.refreshToken) {
            throw new TokenRevoked();
        }

        const isTokenValid = await bcrypt.compare(token, user.refreshToken);
        if (!isTokenValid) {
            throw new TokenRevoked();
        }

        return this.generateAccessToken(user);
    }

    async logout(userId: number) {
        await db
            .update(users)
            .set({
                lastLoginAt: new Date().toISOString(),
                refreshToken: null,
            })
            .where(eq(users.id, userId));
    }

    private async findUserByEmail(email: string) {
        return await db.query.users.findFirst({
            where: eq(users.email, email),
        });
    }

    private async verifyPassword(password: string, hashedPassword: string) {
        return await bcrypt.compare(password, hashedPassword);
    }

    private async storeRefreshToken(userId: number, token: string) {
        const hashedToken = await bcrypt.hash(token, 10);
        await db
            .update(users)
            .set({ refreshToken: hashedToken })
            .where(eq(users.id, userId));
    }

    private generateAccessToken(user: User) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };

        return jwt.sign(payload, ENV.JWT_SECRET, {
            expiresIn: ENV.JWT_ACCESS_EXPIERS as any,
        });
    }

    private generateRefreshToken(user: User) {
        const payload = {
            id: user.id,
        };

        return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
            expiresIn: ENV.JWT_REFRESH_EXPIRES as any,
        });
    }
}
