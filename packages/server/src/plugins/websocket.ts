import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import { Type } from '@sinclair/typebox';
import WebSocket from 'ws';
import { websocketManager } from '../ws/websocketManager';
import { MessageService } from '@/message/message.service';

const websocketPlugin: FastifyPluginAsync = async (fastify) => {
    await fastify.register(fastifyWebsocket);
    const messageService = new MessageService();

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

                websocketManager.addNotificationConnection(userId, socket);

                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(
                        JSON.stringify({
                            type: 'connected',
                            message: 'Successfully connected to notifications',
                        })
                    );
                }

                socket.on('ping', () => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.pong();
                    }
                });

                socket.on('message', (message: any) => {
                    try {
                        const data = JSON.parse(message.toString());
                        fastify.log.info(`Message from user ${userId}:`, data);

                        if (data.type === 'ping') {
                            socket.send(JSON.stringify({ type: 'pong' }));
                        }
                    } catch (error) {
                        fastify.log.error('Invalid message format:', error);
                    }
                });

                socket.on('close', (code: number, reason: string) => {
                    websocketManager.removeNotificationConnection(
                        userId,
                        socket
                    );

                    fastify.log.info(
                        `User ${userId} disconnected from notifications. Code: ${code}, Reason: ${reason}`
                    );
                });

                socket.on('error', (error: Error) => {
                    fastify.log.error(
                        `WebSocket error for user ${userId}:`,
                        error
                    );
                    websocketManager.removeNotificationConnection(
                        userId,
                        socket
                    );
                });

                const pingInterval = setInterval(() => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.ping();
                    } else {
                        clearInterval(pingInterval);
                    }
                }, 30000);

                socket.on('close', () => {
                    clearInterval(pingInterval);
                });
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

                const connectionData = {
                    socket: socket,
                    userId: userId,
                };

                websocketManager.addChatConnection(
                    conversationId,
                    connectionData
                );

                fastify.log.info(
                    `User ${userId} connected to chat ${conversationId}`
                );

                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(
                        JSON.stringify({
                            type: 'connected',
                            message: `Connected to chat ${conversationId}`,
                        })
                    );
                }

                socket.on('message', async (message: Buffer) => {
                    try {
                        const data = JSON.parse(message.toString());
                        fastify.log.info('Chat message received:', data);

                        if (data.type === 'chat_message') {
                            await messageService.createMessage(userId, {
                                content: data.content,
                                conversationId,
                                contentType: 'text',
                            });
                        }
                    } catch (error) {
                        fastify.log.error(
                            'Invalid chat message format:',
                            error
                        );
                    }
                });

                socket.on('close', () => {
                    websocketManager.removeChatConnection(
                        conversationId,
                        socket
                    );
                    fastify.log.info(
                        `User ${userId} disconnected from chat ${conversationId}`
                    );
                });

                socket.on('error', (error: Error) => {
                    fastify.log.error(
                        `Chat WebSocket error for user ${userId}:`,
                        error
                    );
                    websocketManager.removeChatConnection(
                        conversationId,
                        socket
                    );
                });
            }
        );
    });

    fastify.get('/ws/status', async (_, reply) => {
        const stats = websocketManager.getNotificationStats();
        return reply.send(stats);
    });
};

export default websocketPlugin;
