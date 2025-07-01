import { FastifyInstance } from 'fastify';

export default async function authRoute(fastify: FastifyInstance) {
    fastify.post('/login', () => {
        console.log('login');
        return 'logged';
    });
}
