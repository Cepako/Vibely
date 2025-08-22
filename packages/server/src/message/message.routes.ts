// src/message/message.routes.ts
import { FastifyInstance } from 'fastify';
import { MessageController } from './message.controller';
import {
    CreateMessageSchema,
    CreateConversationSchema,
    MarkAsReadSchema,
    GetMessagesQuerySchema,
    GetConversationsQuerySchema,
} from './message.schema';
import { AuthService } from '@/auth/auth.service';
import { createAuthGuard } from '@/hooks/authGuard';

export async function messageRoutes(fastify: FastifyInstance) {
    const authService = new AuthService();
    const messageController = new MessageController();
    const authGuard = createAuthGuard(authService);

    fastify.addHook('preHandler', authGuard);

    // Get user conversations
    fastify.get(
        '/conversations',
        {
            schema: {
                querystring: GetConversationsQuerySchema,
                security: [{ bearerAuth: [] }],
            },
        },
        messageController.getConversations.bind(messageController)
    );

    // Get specific conversation
    fastify.get(
        '/conversations/:conversationId',
        {
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        conversationId: { type: 'string' },
                    },
                    required: ['conversationId'],
                },
                security: [{ bearerAuth: [] }],
            },
        },
        messageController.getConversation.bind(messageController)
    );

    // Create new conversation
    fastify.post(
        '/conversations',
        {
            schema: {
                body: CreateConversationSchema,
                security: [{ bearerAuth: [] }],
            },
        },
        messageController.createConversation.bind(messageController)
    );

    // Get messages in a conversation
    fastify.get(
        '/messages',
        {
            schema: {
                querystring: GetMessagesQuerySchema,
                security: [{ bearerAuth: [] }],
            },
        },
        messageController.getMessages.bind(messageController)
    );

    // Send a message
    fastify.post(
        '/messages',
        {
            schema: {
                // Note: When using multipart, we can't use body schema validation
                // The validation will be done manually in the controller
                security: [{ bearerAuth: [] }],
            },
        },
        messageController.sendMessage.bind(messageController)
    );

    // Mark messages as read
    fastify.patch(
        '/messages/read',
        {
            schema: {
                body: MarkAsReadSchema,
                security: [{ bearerAuth: [] }],
            },
        },
        messageController.markMessagesAsRead.bind(messageController)
    );

    // Delete a message
    fastify.delete(
        '/messages/:messageId',
        {
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        messageId: { type: 'string' },
                    },
                    required: ['messageId'],
                },
                security: [{ bearerAuth: [] }],
            },
        },
        messageController.deleteMessage.bind(messageController)
    );

    // Leave conversation
    fastify.delete(
        '/conversations/:conversationId/leave',
        {
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        conversationId: { type: 'string' },
                    },
                    required: ['conversationId'],
                },
                security: [{ bearerAuth: [] }],
            },
        },
        messageController.leaveConversation.bind(messageController)
    );
}
