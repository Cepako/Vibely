import { FastifyReply, FastifyRequest } from 'fastify';
import UserService from './user.service';
import { RegisterUser, RegisterUserSchema } from './user.schema';
import path from 'path';
import fs from 'fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { AuthService } from '../auth/auth.service';

export default class UserController {
    private userService: UserService;
    private authService: AuthService;

    constructor(userService: UserService, authService: AuthService) {
        this.userService = userService;
        this.authService = authService;
    }

    async me(req: FastifyRequest, reply: FastifyReply) {
        const token = req.cookies.token;

        if (!token) return reply.status(401).send({ error: 'Unauthenticated' });

        const { id } = this.authService.verifyToken(token);
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
        const token = req.cookies.token;
        if (!token) return reply.status(401).send({ error: 'Unauthenticated' });
        const { id: viewerId } = this.authService.verifyToken(token);

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
        const token = req.cookies.token;
        if (!token) return reply.status(401).send({ error: 'Unauthenticated' });
        const { id: userId } = this.authService.verifyToken(token);
        const { profileId } = req.params;
        if (userId !== profileId)
            return reply.status(401).send({ error: 'Unauthenticated' });

        const data = req.body;
        await this.userService.editUser(data, profileId);

        return reply.code(201).send({ message: 'Profile edited successfully' });
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
            const uploadDir = path.resolve(__dirname, '../../uploads');
            if (!fs.existsSync(uploadDir))
                fs.mkdirSync(uploadDir, { recursive: true });

            const filename = `${Date.now()}-${profilePicture.filename}`;
            const filepath = path.join(uploadDir, filename);

            await fs.promises.writeFile(filepath, profilePicture.buffer);

            fields.profilePictureUrl = `/uploads/${filename}`;
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
