import { db } from '../db';
import { users } from './user.model';
import { eq } from 'drizzle-orm';
import { RegisterUser } from './user.schema';
import bcrypt from 'bcrypt';
import createError from '@fastify/error';

interface IUserService {
    createUser: (user: RegisterUser) => Promise<void>;
    checkIsEmailAvailable: (email: string) => Promise<boolean>;
}

export default class UserService implements IUserService {
    private saltRounds: number;
    constructor() {
        this.saltRounds = 10;
    }

    async createUser(user: RegisterUser) {
        user.email = user.email.trim().toLowerCase();
        user.name = user.name.trim();
        user.surname = user.surname.trim();

        const { email, password } = user;
        const isEmailAvailable = this.checkIsEmailAvailable(email);
        if (!isEmailAvailable) {
            const EmailInUse = createError(
                'EMAIL_IN_USE',
                'Email is already registered',
                400
            );
            throw new EmailInUse();
        }

        const hashedPassword = await bcrypt.hash(password, this.saltRounds);
        await db.insert(users).values({ ...user, password: hashedPassword });
    }

    async checkIsEmailAvailable(email: string): Promise<boolean> {
        const existingEmail = await db.query.users.findFirst({
            where: eq(users.email, email),
        });
        return !existingEmail;
    }

    async findUserById(id: number) {
        return db.query.users.findFirst({
            where: eq(users.id, id),
        });
    }
}
