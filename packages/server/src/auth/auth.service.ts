import { db } from '../db';
import { users } from '../db/schema';
import { User } from '../user/user.model';
import createError from '@fastify/error';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ENV } from '../utils/env';

interface IAuthService {
    login: (email: string, password: string) => Promise<string>;
}

export class AuthService implements IAuthService {
    constructor() {}

    async login(email: string, password: string): Promise<string> {
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
