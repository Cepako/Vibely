import { FastifyReply, FastifyRequest } from 'fastify';
import UserService from './user.service';
import {
    ChangePassword,
    RegisterUser,
    RegisterUserSchema,
} from './user.schema';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { handleFileUpload } from '../utils/handleFileUpload';

export default class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    async me(req: FastifyRequest, reply: FastifyReply) {
        const { id } = req.user;
        const user = await this.userService.findUserById(id);

        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }

        return reply.status(200).send(user);
    }

    async getProfile(
        req: FastifyRequest<{ Params: { profileId: number } }>,
        reply: FastifyReply
    ) {
        try {
            const { id: viewerId } = req.user;
            const { profileId } = req.params;

            const userProfile = await this.userService.getProfile(
                profileId,
                viewerId
            );

            return reply.status(200).send(userProfile);
        } catch (error: any) {
            if (error.name === 'USER_UNAVAILABLE') {
                return reply.status(403).send({
                    error: 'This user profile is not available',
                });
            }

            if (error.name === 'USER_BLOCKED') {
                return reply.status(403).send({
                    error: 'Unable to view this profile',
                });
            }

            return reply.status(500).send({
                error: error.message || 'Failed to fetch profile',
            });
        }
    }

    async editProfile(
        req: FastifyRequest<{
            Body: {
                city: string;
                region: string;
                bio: string;
                interests?: number[];
            };
            Params: { profileId: number };
        }>,
        reply: FastifyReply
    ) {
        const { id: userId } = req.user;
        const { profileId } = req.params;
        if (userId !== profileId)
            return reply.status(403).send({ error: 'Forbidden' });

        const data = req.body;
        await this.userService.editProfile(data, profileId);

        return reply.code(201).send({ message: 'Profile edited successfully' });
    }

    async updateProfilePicture(
        req: FastifyRequest<{
            Params: { profileId: number };
        }>,
        reply: FastifyReply
    ) {
        const { id: userId } = req.user;
        const { profileId } = req.params;

        if (userId !== profileId) {
            return reply.status(403).send({ error: 'Forbidden' });
        }

        try {
            const parts = req.parts();
            let newProfilePicture: {
                buffer: Buffer;
                filename: string;
                mimetype: string;
            } | null = null;

            for await (const part of parts) {
                if (
                    part.type === 'file' &&
                    part.fieldname === 'profilePicture'
                ) {
                    if (!part.mimetype.startsWith('image/')) {
                        return reply.status(400).send({
                            error: 'Invalid file type. Only images are allowed.',
                        });
                    }

                    const maxSize = 5 * 1024 * 1024; // 5MB
                    const buffer = await part.toBuffer();

                    if (buffer.length > maxSize) {
                        return reply.status(400).send({
                            error: 'File too large. Maximum size is 5MB.',
                        });
                    }

                    newProfilePicture = {
                        buffer,
                        filename: part.filename,
                        mimetype: part.mimetype,
                    };
                }
            }

            await this.userService.updateProfilePicture(
                profileId,
                newProfilePicture
            );

            return reply.status(200).send({
                message: newProfilePicture
                    ? 'Profile picture updated successfully'
                    : 'Profile picture removed successfully',
            });
        } catch (error) {
            console.error('Error updating profile picture:', error);
            return reply.status(500).send({ error: 'Internal server error' });
        }
    }

    async registerUser(
        fields: RegisterUser,
        profilePicture: {
            buffer: Buffer;
            filename: string;
            mimetype: string;
        } | null,
        reply: FastifyReply
    ) {
        const ajv = new Ajv({ allErrors: true });
        addFormats(ajv);

        if (fields.dateOfBirth) {
            fields.dateOfBirth = new Date(fields.dateOfBirth).toISOString();
        }

        if ((fields as any).interests) {
            const raw = (fields as any).interests;
            try {
                if (typeof raw === 'string') {
                    let parsed: any = null;
                    try {
                        parsed = JSON.parse(raw);
                    } catch {
                        parsed = raw.split(',').map((s: string) => s.trim());
                    }
                    if (Array.isArray(parsed)) {
                        (fields as any).interests = parsed
                            .map((v: any) => Number(v))
                            .filter((n: number) => !Number.isNaN(n));
                    } else {
                        (fields as any).interests = [];
                    }
                }
            } catch {
                (fields as any).interests = [];
            }
        }

        const validate = ajv.compile(RegisterUserSchema);
        const isValid = validate(fields);

        if (!isValid) {
            return reply.code(400).send({
                message: 'Validation failed',
                errors: validate.errors,
            });
        }

        if (profilePicture) {
            fields.profilePictureUrl = (await handleFileUpload(profilePicture, {
                allowedTypes: ['image/'],
                maxSizeInMB: 5,
                subFolder: 'profile-pictures',
            })) as string;
        }

        const user: RegisterUser = fields;

        await this.userService.createUser(user);

        return reply
            .code(201)
            .send({ message: 'User registered successfully' });
    }

    async checkIsEmailAvailable(
        req: FastifyRequest<{ Body: { email: string } }>,
        reply: FastifyReply
    ) {
        const { email } = req.body;

        const available = await this.userService.checkIsEmailAvailable(email);

        return reply.code(200).send({ available });
    }
    async getInterests(req: FastifyRequest, reply: FastifyReply) {
        try {
            const list = await this.userService.getInterests();
            return reply.code(200).send(list);
        } catch (error: any) {
            req.log?.error?.(error);
            return reply
                .code(500)
                .send({ message: 'Failed to fetch interests' });
        }
    }

    async changePassword(
        req: FastifyRequest<{
            Body: ChangePassword;
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: userId } = req.user;
            const { currentPassword, newPassword, confirmPassword } = req.body;

            if (newPassword !== confirmPassword) {
                return reply.status(400).send({
                    error: 'New password and confirm password do not match',
                });
            }

            if (currentPassword === newPassword) {
                return reply.status(400).send({
                    error: 'New password must be different from current password',
                });
            }

            await this.userService.changePassword(
                userId,
                currentPassword,
                newPassword
            );

            return reply.status(200).send({
                message: 'Password changed successfully',
            });
        } catch (error: any) {
            if (error.code === 'INVALID_CURRENT_PASSWORD') {
                return reply.status(400).send({
                    error: 'Current password is incorrect',
                });
            }

            if (error.code === 'USER_NOT_FOUND') {
                return reply.status(404).send({
                    error: 'User not found',
                });
            }

            return reply.status(500).send({
                error: error.message || 'Failed to change password',
            });
        }
    }
}
