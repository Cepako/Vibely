import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export function errorHandler(
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
) {
    if (error.validation) {
        const formatted = (error as any).validation.map((err: any) => ({
            field: err.instancePath.replace('/', ''),
            message: err.message,
        }));

        return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Validation failed',
            errors: formatted,
        });
    }

    request.log.error(error);

    return reply.status(error.statusCode || 500).send({
        error: error.message || 'Internal Server Error',
    });
}
