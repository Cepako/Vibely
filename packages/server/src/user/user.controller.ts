import { FastifyReply, FastifyRequest } from 'fastify';
import UserService from './user.service';
import { RegisterUser } from './user.schema';

interface IUserController {
    registerUser: (
        req: FastifyRequest<{ Body: { user: RegisterUser } }>,
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
        req: FastifyRequest<{
            Body: { user: RegisterUser };
        }>,
        reply: FastifyReply
    ): Promise<void> {
        const { user } = req.body;

        this.userService.createUser(user);

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
