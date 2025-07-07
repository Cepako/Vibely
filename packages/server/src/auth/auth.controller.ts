import { FastifyReply, FastifyRequest } from 'fastify';
import { LoginBody } from './auth.schema';
import { AuthService } from './auth.service';

interface IAuthController {
    login: (
        req: FastifyRequest<{ Body: LoginBody }>,
        reply: FastifyReply
    ) => Promise<{ token: string }>;
}

export default class AuthController implements IAuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    async login(
        req: FastifyRequest<{ Body: LoginBody }>,
        reply: FastifyReply
    ): Promise<{ token: string }> {
        const { email, password } = req.body;
        const token = await this.authService.login(email, password);
        return reply.status(200).send({ token });
    }
}
