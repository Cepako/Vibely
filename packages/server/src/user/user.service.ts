import { db } from '../db';
import {
    friendships,
    SafeUser,
    UserProfile,
    users,
    userInterests,
    Interest,
} from './user.model';
import { and, eq, inArray, or } from 'drizzle-orm';
import { RegisterUser } from './user.schema';
import bcrypt from 'bcrypt';
import createError from '@fastify/error';
import { handleFileUpload } from '../utils/handleFileUpload';
import { deleteFile } from '../utils/deleteFile';
import { interests } from '../db/schema';
import { FriendshipService } from '../friendship/friendship.service';

interface IUserService {
    createUser: (user: RegisterUser) => Promise<void>;
    checkIsEmailAvailable: (email: string) => Promise<boolean>;
    findUserById: (id: number) => Promise<SafeUser | null>;
    getProfile: (
        profileId: number,
        viewerId: number
    ) => Promise<UserProfile | null>;
    editProfile: (
        data: {
            city: string;
            region: string;
            bio: string;
            interests?: number[];
        },
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
    getInterests: () => Promise<Interest[]>;
    changePassword: (
        userId: number,
        currentPassword: string,
        newPassword: string
    ) => Promise<void>;
}

export default class UserService implements IUserService {
    private saltRounds: number;
    private friendshipService: FriendshipService;

    constructor(friendshipService: FriendshipService) {
        this.saltRounds = 10;
        this.friendshipService = friendshipService;
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

        const created = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!created) return;

        if (
            user.interests &&
            Array.isArray(user.interests) &&
            user.interests.length > 0
        ) {
            const rows = user.interests.map((interestId) => ({
                userId: created.id,
                interestId,
            }));
            await db.insert(userInterests).values(rows);
        }
    }

    async editProfile(
        {
            bio,
            city,
            region,
            interests,
        }: { city: string; region: string; bio: string; interests?: number[] },
        profileId: number
    ) {
        bio = bio.trim();
        city = city.trim();
        region = region.trim();

        await db
            .update(users)
            .set({ bio, city, region })
            .where(eq(users.id, profileId));

        if (interests !== undefined) {
            await db
                .delete(userInterests)
                .where(eq(userInterests.userId, profileId));

            if (interests.length > 0) {
                const rows = interests.map((interestId) => ({
                    userId: profileId,
                    interestId,
                }));
                await db.insert(userInterests).values(rows);
            }
        }
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

        const isBlocked = await this.checkUserBlocked(viewerId, profileId);
        if (isBlocked) {
            const UserBlocked = createError(
                'USER_BLOCKED',
                'Unable to view this profile',
                403
            );
            throw new UserBlocked();
        }

        const friendshipStatus =
            await this.friendshipService.getFriendshipStatus(
                viewerId,
                profileId
            );

        const userInterestRows = await db.query.userInterests.findMany({
            where: eq(userInterests.userId, profileId),
        });
        const interestIds = userInterestRows.map((r) => r.interestId);

        let interestsList: Array<any> = [];
        if (interestIds.length > 0) {
            interestsList = await db.query.interests.findMany({
                where: inArray(interests.id, interestIds),
            });
        }

        return { ...user, friendshipStatus, interests: interestsList };
    }

    private async checkUserBlocked(
        viewerId: number,
        profileId: number
    ): Promise<boolean> {
        const userBlock = await db.query.friendships.findFirst({
            where: and(
                or(
                    and(
                        eq(friendships.userId, viewerId),
                        eq(friendships.friendId, profileId)
                    ),
                    and(
                        eq(friendships.userId, profileId),
                        eq(friendships.friendId, viewerId)
                    )
                ),
                eq(friendships.status, 'blocked')
            ),
        });

        if (userBlock) return true;

        return false;
    }

    async getInterests(): Promise<Interest[]> {
        return await db.query.interests.findMany();
    }

    async changePassword(
        userId: number,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            const UserNotFound = createError(
                'USER_NOT_FOUND',
                'User not found',
                404
            );
            throw new UserNotFound();
        }

        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isPasswordValid) {
            const InvalidCurrentPassword = createError(
                'INVALID_CURRENT_PASSWORD',
                'Current password is incorrect',
                400
            );
            throw new InvalidCurrentPassword();
        }

        const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

        await db
            .update(users)
            .set({
                password: hashedPassword,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(users.id, userId));
    }
}
