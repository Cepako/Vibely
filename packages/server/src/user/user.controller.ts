import { FastifyReply, FastifyRequest } from 'fastify';
import UserService from './user.service';
import { RegisterUser, RegisterUserSchema } from './user.schema';
import path from 'path';
import fs from 'fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

interface IUserController {
    registerUser: (
        fields: RegisterUser,
        profilePicture: {
            buffer: Buffer;
            filename: string;
            mimetype: string;
        } | null,
        reply: FastifyReply
    ) => Promise<void>;
    checkIsEmailAvailable: (
        req: FastifyRequest<{ Body: { email: string } }>,
        reply: FastifyReply
    ) => Promise<boolean>;
}

export default class UserController implements IUserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    async registerUser(
        fields: RegisterUser,
        profilePicture: {
            buffer: Buffer;
            filename: string;
            mimetype: string;
        } | null,
        reply: FastifyReply
    ): Promise<void> {
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
    ): Promise<boolean> {
        const { email } = req.body;

        const available = await this.userService.checkIsEmailAvailable(email);

        return reply.code(200).send({ available });
    }
}
