import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import { Type } from '@sinclair/typebox';

const websocketPlugin: FastifyPluginAsync = async (fastify) => {
    await fastify.register(fastifyWebsocket);

    const websocketClients = new Map<number, any[]>();
    (fastify as any).websocketClients = websocketClients;

    const chatClients = new Map<number, any[]>();
    (fastify as any).chatClients = chatClients;

    fastify.register(async function (fastify) {
        fastify.get(
            '/ws/notifications',
            {
                websocket: true,
                schema: { querystring: Type.Object({ userId: Type.Number() }) },
            },
            (
                connection,
                request: FastifyRequest<{ Querystring: { userId: number } }>
            ) => {
                const userId = request.query.userId;

                if (!userId) {
                    connection.socket.close(1000, 'User ID required');
                    return;
                }

                if (!websocketClients.has(userId)) {
                    websocketClients.set(userId, []);
                }
                websocketClients.get(userId)!.push(connection.socket);

                fastify.log.info(`User ${userId} connected to notifications`);

                connection.socket.on('close', () => {
                    const userConnections = websocketClients.get(userId) || [];
                    const index = userConnections.indexOf(connection.socket);
                    if (index > -1) {
                        userConnections.splice(index, 1);
                    }

                    if (userConnections.length === 0) {
                        websocketClients.delete(userId);
                    }

                    fastify.log.info(
                        `User ${userId} disconnected from notifications`
                    );
                });

                connection.socket.on('error', (error: Error) => {
                    fastify.log.error(
                        `WebSocket error for user ${userId}:`,
                        error
                    );
                });
            }
        );

        fastify.get(
            '/ws/chat',
            {
                websocket: true,
                schema: {
                    querystring: Type.Object({
                        userId: Type.Number(),
                        conversationId: Type.Number(),
                    }),
                },
            },
            (
                connection,
                request: FastifyRequest<{
                    Querystring: { userId: number; conversationId: number };
                }>
            ) => {
                const { userId, conversationId } = request.query;

                if (!userId || !conversationId) {
                    connection.socket.close(
                        1000,
                        'User ID and Conversation ID required'
                    );
                    return;
                }

                if (!chatClients.has(conversationId)) {
                    chatClients.set(conversationId, []);
                }

                const connectionData = {
                    socket: connection.socket,
                    userId: userId,
                };
                chatClients.get(conversationId)!.push(connectionData);

                fastify.log.info(
                    `User ${userId} connected to chat ${conversationId}`
                );

                connection.socket.on('message', (message: Buffer) => {
                    try {
                        const data = JSON.parse(message.toString());
                        fastify.log.info('Chat message received:', data);

                        const conversationConnections =
                            chatClients.get(conversationId) || [];
                        conversationConnections.forEach((conn: any) => {
                            if (
                                conn.userId !== userId &&
                                conn.socket.readyState === 1
                            ) {
                                conn.socket.send(
                                    JSON.stringify({
                                        type: 'chat_message',
                                        data: data,
                                        from: userId,
                                    })
                                );
                            }
                        });
                    } catch (error) {
                        fastify.log.error(
                            'Invalid chat message format:',
                            error
                        );
                    }
                });

                connection.socket.on('close', () => {
                    const conversationConnections =
                        chatClients.get(conversationId) || [];
                    const index = conversationConnections.findIndex(
                        (conn) => conn.socket === connection.socket
                    );
                    if (index > -1) {
                        conversationConnections.splice(index, 1);
                    }

                    if (conversationConnections.length === 0) {
                        chatClients.delete(conversationId);
                    }

                    fastify.log.info(
                        `User ${userId} disconnected from chat ${conversationId}`
                    );
                });
            }
        );
    });
};

export default websocketPlugin;
