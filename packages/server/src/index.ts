import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import authRoute from './auth/auth.routes';
import { ENV } from './utils/env';
import { errorHandler } from './plugins/errorHandler';

const server = Fastify({
    logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

server.register(cors, {
    origin: true,
    credentials: true,
});

server.register(swagger, {
    openapi: {
        info: {
            title: 'Vibely API Docs',
            version: '1.0.0',
        },
    },
});

server.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'full',
        deepLinking: false,
    },
});

server.setErrorHandler(errorHandler);

server.register(
    async (api: FastifyInstance) => {
        api.register(authRoute, { prefix: '/auth' });
    },
    { prefix: '/api' }
);

server.get('/health', async () => ({ status: 'ok' }));

server.listen({ port: ENV.PORT || 3000 }, (err, address) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }
    server.log.info(`Server listening at ${address}`);
});
