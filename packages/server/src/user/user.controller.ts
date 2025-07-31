import { FastifyReply, FastifyRequest } from 'fastify';
import UserService from './user.service';
import { RegisterUser, RegisterUserSchema } from './user.schema';
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
        const { id: viewerId } = req.user;

        const { profileId } = req.params;

        const userProfile = await this.userService.getProfile(
            profileId,
            viewerId
        );

        return reply.status(200).send(userProfile);
    }

    async editProfile(
        req: FastifyRequest<{
            Body: { city: string; region: string; bio: string };
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
}
