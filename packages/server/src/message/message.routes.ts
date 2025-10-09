import { FastifyInstance } from 'fastify';
import { MessageController } from './message.controller';
import {
    CreateConversationSchema,
    MarkAsReadSchema,
    GetMessagesQuerySchema,
    GetConversationsQuerySchema,
    UpdateConversationNameSchema,
    UpdateParticipantNicknameSchema,
} from './message.schema';
import { AuthService } from '@/auth/auth.service';
import { createAuthGuard } from '@/hooks/authGuard';

export async function messageRoutes(fastify: FastifyInstance) {
    const authService = new AuthService();
    const messageController = new MessageController();
    const authGuard = createAuthGuard(authService);

    fastify.addHook('preHandler', authGuard);

    // Conversations routes

    fastify.get(
        '/conversations',
        {
            schema: {
                querystring: GetConversationsQuerySchema,
            },
        },
        messageController.getConversations.bind(messageController)
    );

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
            },
        },
        messageController.getConversation.bind(messageController)
    );

    fastify.post(
        '/conversations',
        {
            schema: {
                body: CreateConversationSchema,
            },
        },
        messageController.createConversation.bind(messageController)
    );

    fastify.patch(
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
                body: UpdateConversationNameSchema,
            },
        },
        messageController.updateConversation.bind(messageController)
    );

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
            },
        },
        messageController.leaveConversation.bind(messageController)
    );

    // Participant routes

    fastify.patch(
        '/conversations/:conversationId/participants/nickname',
        {
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        conversationId: { type: 'string' },
                    },
                    required: ['conversationId'],
                },
                body: UpdateParticipantNicknameSchema,
            },
        },
        messageController.updateParticipantNickname.bind(messageController)
    );

    fastify.post(
        '/conversations/:conversationId/participants',
        {
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        conversationId: { type: 'string' },
                    },
                    required: ['conversationId'],
                },
                body: {
                    type: 'object',
                    properties: {
                        userId: { type: 'number' },
                    },
                    required: ['userId'],
                },
            },
        },
        messageController.addParticipant.bind(messageController)
    );

    fastify.delete(
        '/conversations/:conversationId/participants/:userId',
        {
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        conversationId: { type: 'string' },
                        userId: { type: 'string' },
                    },
                    required: ['conversationId', 'userId'],
                },
            },
        },
        messageController.removeParticipant.bind(messageController)
    );

    // Messages routes

    fastify.get(
        '/messages',
        {
            schema: {
                querystring: GetMessagesQuerySchema,
            },
        },
        messageController.getMessages.bind(messageController)
    );

    fastify.post(
        '/messages',
        {
            schema: {},
        },
        messageController.sendMessage.bind(messageController)
    );

    fastify.patch(
        '/messages/read',
        {
            schema: {
                body: MarkAsReadSchema,
            },
        },
        messageController.markMessagesAsRead.bind(messageController)
    );

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
            },
        },
        messageController.deleteMessage.bind(messageController)
    );
}
