import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import { Type } from '@sinclair/typebox';
import WebSocket from 'ws';

const websocketPlugin: FastifyPluginAsync = async (fastify) => {
    await fastify.register(fastifyWebsocket);

    const websocketClients = new Map<number, WebSocket[]>();
    (fastify as any).websocketClients = websocketClients;

    const chatClients = new Map<number, any[]>();
    (fastify as any).chatClients = chatClients;

    fastify.register(async function (fastify) {
        fastify.get(
            '/ws/notifications',
            {
                websocket: true,
                schema: {
                    querystring: Type.Object({
                        userId: Type.String(),
                    }),
                },
            },
            async (
                socket: WebSocket,
                request: FastifyRequest<{ Querystring: { userId: string } }>
            ) => {
                const userIdStr = request.query.userId;
                const userId = parseInt(userIdStr);

                if (!userId || isNaN(userId)) {
                    socket.close(1000, 'Valid User ID required');
                    return;
                }

                if (!websocketClients.has(userId)) {
                    websocketClients.set(userId, []);
                }
                websocketClients.get(userId)!.push(socket);

                fastify.log.info(
                    `User ${userId} connected to notifications. Total connections: ${websocketClients.get(userId)?.length}`
                );

                socket.on('close', () => {
                    const userConnections = websocketClients.get(userId) || [];
                    const index = userConnections.indexOf(socket);
                    if (index > -1) {
                        userConnections.splice(index, 1);
                    }

                    if (userConnections.length === 0) {
                        websocketClients.delete(userId);
                    }

                    fastify.log.info(
                        `User ${userId} disconnected from notifications. Remaining connections: ${websocketClients.get(userId)?.length || 0}`
                    );
                });

                socket.on('error', (error: Error) => {
                    fastify.log.error(
                        `WebSocket error for user ${userId}:`,
                        error
                    );

                    const userConnections = websocketClients.get(userId) || [];
                    const index = userConnections.indexOf(socket);
                    if (index > -1) {
                        userConnections.splice(index, 1);
                    }
                });

                socket.on('ping', () => {
                    socket.pong();
                });

                socket.on('message', (message: any) => {
                    fastify.log.info(
                        `Message from user ${userId}:`,
                        message.toString()
                    );
                });

                setTimeout(() => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(
                            JSON.stringify({
                                type: 'connected',
                                message:
                                    'Successfully connected to notifications',
                            })
                        );
                    }
                }, 100);
            }
        );

        fastify.get(
            '/ws/chat',
            {
                websocket: true,
                schema: {
                    querystring: Type.Object({
                        userId: Type.String(),
                        conversationId: Type.String(),
                    }),
                },
            },
            async (
                socket: WebSocket,
                request: FastifyRequest<{
                    Querystring: { userId: string; conversationId: string };
                }>
            ) => {
                const userId = parseInt(request.query.userId);
                const conversationId = parseInt(request.query.conversationId);

                if (
                    !userId ||
                    !conversationId ||
                    isNaN(userId) ||
                    isNaN(conversationId)
                ) {
                    socket.close(
                        1000,
                        'Valid User ID and Conversation ID required'
                    );
                    return;
                }

                if (!chatClients.has(conversationId)) {
                    chatClients.set(conversationId, []);
                }

                const connectionData = {
                    socket: socket,
                    userId: userId,
                };
                chatClients.get(conversationId)!.push(connectionData);

                fastify.log.info(
                    `User ${userId} connected to chat ${conversationId}`
                );

                socket.on('message', (message: Buffer) => {
                    try {
                        const data = JSON.parse(message.toString());
                        fastify.log.info('Chat message received:', data);

                        const conversationConnections =
                            chatClients.get(conversationId) || [];
                        conversationConnections.forEach((conn: any) => {
                            if (
                                conn.userId !== userId &&
                                conn.socket.readyState === WebSocket.OPEN
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

                socket.on('close', () => {
                    const conversationConnections =
                        chatClients.get(conversationId) || [];
                    const index = conversationConnections.findIndex(
                        (conn) => conn.socket === socket
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

                socket.on('error', (error: Error) => {
                    fastify.log.error(
                        `Chat WebSocket error for user ${userId}:`,
                        error
                    );
                });

                setTimeout(() => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(
                            JSON.stringify({
                                type: 'connected',
                                message: `Connected to chat ${conversationId}`,
                            })
                        );
                    }
                }, 100);
            }
        );
    });
};

export default websocketPlugin;
