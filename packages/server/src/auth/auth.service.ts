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
        if (!user || !this.verifyPassword(password, user.password)) {
            const InvalidCredentials = createError(
                'INVALID_CREDENTIALS',
                'Invalid credentials',
                401
            );
            throw new InvalidCredentials();
        }
        return this.generateToken(user);
    }

    private async findUserByEmail(email: string) {
        return await db.query.users.findFirst({
            where: eq(users.email, email),
        });
    }

    private verifyPassword(password: string, hashedPassword: string) {
        return bcrypt.compare(password, hashedPassword);
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
