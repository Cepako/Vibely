import { db } from '../db';
import { friendships, SafeUser, UserProfile, users } from './user.model';
import { and, eq, or } from 'drizzle-orm';
import { FriendshipStatus, RegisterUser } from './user.schema';
import bcrypt from 'bcrypt';
import createError from '@fastify/error';
import { handleFileUpload } from '../utils/handleFileUpload';
import { deleteFile } from '../utils/deleteFile';

interface IUserService {
    createUser: (user: RegisterUser) => Promise<void>;
    checkIsEmailAvailable: (email: string) => Promise<boolean>;
    findUserById: (id: number) => Promise<SafeUser | null>;
    getProfile: (
        profileId: number,
        viewerId: number
    ) => Promise<UserProfile | null>;
    editProfile: (
        data: { city: string; region: string; bio: string },
        profileId: number
    ) => Promise<void>;
    updateProfilePicture: (
        userId: number,
        newProfilePicture: {
            buffer: Buffer;
            filename: string;
            mimetype: string;
        } | null
    ) => Promise<void>;
    getFriendshipStatus: (
        profileId: number,
        viewerId: number
    ) => Promise<FriendshipStatus | null>;
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
        const isEmailAvailable = await this.checkIsEmailAvailable(email);
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

    async editProfile(
        { bio, city, region }: { city: string; region: string; bio: string },
        profileId: number
    ) {
        bio = bio.trim();
        city = city.trim();
        region = region.trim();

        await db
            .update(users)
            .set({ bio, city, region })
            .where(eq(users.id, profileId));
    }

    async updateProfilePicture(
        userId: number,
        newProfilePicture: {
            buffer: Buffer;
            filename: string;
            mimetype: string;
        } | null
    ) {
        const currentUser = await this.findUserById(userId);
        if (!currentUser) {
            const UserNotFound = createError(
                'USER_NOT_FOUND',
                'User not found',
                404
            );
            throw new UserNotFound();
        }

        let profilePictureUrl: string | null = null;

        if (newProfilePicture) {
            profilePictureUrl = await handleFileUpload(newProfilePicture, {
                allowedTypes: ['image/'],
                maxSizeInMB: 5,
                subFolder: 'profile-pictures',
                oldFileUrl: currentUser.profilePictureUrl,
            });
        } else if (currentUser.profilePictureUrl) {
            await deleteFile(currentUser.profilePictureUrl);
        }

        await db
            .update(users)
            .set({ profilePictureUrl })
            .where(eq(users.id, userId));
    }

    async checkIsEmailAvailable(email: string): Promise<boolean> {
        const existingEmail = await db.query.users.findFirst({
            where: eq(users.email, email),
        });
        return !existingEmail;
    }

    async findUserById(id: number): Promise<SafeUser | null> {
        const user = await db.query.users.findFirst({
            where: eq(users.id, id),
        });
        if (!user) return null;
        const { password, ...safeUser } = user;

        return safeUser;
    }

    async getProfile(
        profileId: number,
        viewerId: number
    ): Promise<UserProfile | null> {
        const user = await this.findUserById(profileId);
        if (!user) return null;

        const friendshipStatus = await this.getFriendshipStatus(
            viewerId,
            profileId
        );

        return { ...user, friendshipStatus };
    }

    public async getFriendshipStatus(userId: number, profileId: number) {
        const friendship = await db.query.friendships.findFirst({
            where: or(
                and(
                    eq(friendships.userId, userId),
                    eq(friendships.friendId, profileId)
                ),
                and(
                    eq(friendships.userId, profileId),
                    eq(friendships.friendId, userId)
                )
            ),
        });

        return friendship?.status ?? null;
    }
}
