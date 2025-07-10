import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { ENV } from './utils/env';
import { errorHandler } from './plugins/errorHandler';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import authRoutes from './auth/auth.routes';
import userRoutes from './user/user.routes';

const server = Fastify({
    logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

server.register(cors, {
    origin: true,
    credentials: true,
});

server.register(multipart, {
    limits: {
        fileSize: 10 * 1024 * 1024, // max 10MB
    },
});

server.register(fastifyStatic, {
    root: path.join(__dirname, '../uploads'),
    prefix: '/uploads/',
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
        api.register(authRoutes, { prefix: '/auth' });
        api.register(userRoutes, { prefix: '/user' });
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
