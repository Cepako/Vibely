import 'dotenv/config';
import Fastify from 'fastify';

const fastify = Fastify({
    logger: true,
});

fastify.get('/', async (_, __) => {
    return { hello: 'world' };
});

fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server listening at ${address}`);
});
