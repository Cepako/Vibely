import 'fastify';
import { Payload } from '../auth/types';

declare module 'fastify' {
    interface FastifyRequest {
        user: Payload;
    }
}
