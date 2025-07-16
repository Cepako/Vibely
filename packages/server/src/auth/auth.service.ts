import { db } from '../db';
import { users } from '../db/schema';
import { User } from '../user/user.model';
import createError from '@fastify/error';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ENV } from '../utils/env';
import { Payload } from './auth.schema';

interface IAuthService {
    verifyToken: (token: string) => Payload;
    login: (email: string, password: string) => Promise<string>;
    updateLastLoginAt: (userId: number) => Promise<void>;
    updateOnlineStatus: (userId: number, status: boolean) => Promise<void>;
}

export class AuthService implements IAuthService {
    constructor() {}

    verifyToken(token: string): Payload {
        try {
            const payload = jwt.verify(token, ENV.JWT_SECRET);
            return payload as Payload;
        } catch (error) {
            const InvalidToken = createError(
                'INVALID_TOKEN',
                'Invalid or expired token',
                401
            );
            throw new InvalidToken();
        }
    }

    async login(email: string, password: string): Promise<string> {
        email = email.trim().toLowerCase();
        const user = await this.findUserByEmail(email);

        const InvalidCredentials = createError(
            'INVALID_CREDENTIALS',
            'Invalid credentials',
            401
        );

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

        this.updateOnlineStatus(user.id, true);
        return this.generateToken(user);
    }

    async updateLastLoginAt(userId: number) {
        await db
            .update(users)
            .set({ lastLoginAt: new Date().toISOString() })
            .where(eq(users.id, userId));
    }

    async updateOnlineStatus(userId: number, status: boolean) {
        await db
            .update(users)
            .set({ isOnline: status })
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

    private generateToken(user: User) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };

        return jwt.sign(payload, ENV.JWT_SECRET, {
            expiresIn: '2h',
        });
    }
}
