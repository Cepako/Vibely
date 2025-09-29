import { FastifyReply, FastifyRequest } from 'fastify';
import { MessageService } from './message.service';
import {
    CreateMessageType,
    CreateConversationType,
    MarkAsReadType,
    GetMessagesQueryType,
    GetConversationsQueryType,
} from './message.schema';

export class MessageController {
    private messageService: MessageService;

    constructor() {
        this.messageService = new MessageService();
    }

    // Get user conversations
    async getConversations(
        request: FastifyRequest<{ Querystring: GetConversationsQueryType }>,
        reply: FastifyReply
    ) {
        try {
            const userId = request.user.id;
            const { limit = 20, offset = 0 } = request.query;

            const conversations =
                await this.messageService.getUserConversations(
                    userId,
                    limit,
                    offset
                );

            return reply.code(200).send({
                success: true,
                data: conversations,
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                success: false,
                message: 'Failed to get conversations',
            });
        }
    }

    // Get specific conversation
    async getConversation(
        request: FastifyRequest<{ Params: { conversationId: string } }>,
        reply: FastifyReply
    ) {
        try {
            const userId = request.user.id;
            const conversationId = parseInt(request.params.conversationId);

            if (!conversationId || isNaN(conversationId)) {
                return reply.code(400).send({
                    success: false,
                    message: 'Invalid conversation ID',
                });
            }

            const conversation = await this.messageService.getConversationById(
                userId,
                conversationId
            );

            if (!conversation) {
                return reply.code(404).send({
                    success: false,
                    message: 'Conversation not found',
                });
            }

            return reply.code(200).send({
                success: true,
                data: conversation,
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                success: false,
                message: 'Failed to get conversation',
            });
        }
    }

    // Create new conversation
    async createConversation(
        request: FastifyRequest<{ Body: CreateConversationType }>,
        reply: FastifyReply
    ) {
        try {
            const userId = request.user.id;
            const data = request.body;

            const conversation = await this.messageService.createConversation(
                userId,
                data
            );

            return reply.code(201).send({
                success: true,
                data: conversation,
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                success: false,
                message: `Failed to create conversation: ${error}`,
            });
        }
    }

    // Get messages in a conversation
    async getMessages(
        request: FastifyRequest<{ Querystring: GetMessagesQueryType }>,
        reply: FastifyReply
    ) {
        try {
            const userId = request.user.id;
            const { conversationId, limit = 50, offset = 0 } = request.query;

            const messages = await this.messageService.getMessages(
                userId,
                conversationId,
                limit,
                offset
            );

            return reply.code(200).send({
                success: true,
                data: messages,
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                success: false,
                message: 'Failed to get messages',
            });
        }
    }

    // Send a message
    async sendMessage(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.user.id;
            let data: CreateMessageType;
            let file;

            // Handle multipart form data
            if (request.isMultipart()) {
                const parts = request.parts();
                const formData: any = {};

                for await (const part of parts) {
                    if (part.type === 'field') {
                        formData[part.fieldname] = part.value;
                    } else if (
                        part.type === 'file' &&
                        part.fieldname === 'file'
                    ) {
                        const buffer = await part.toBuffer();
                        file = {
                            buffer,
                            filename: part.filename || 'attachment',
                            mimetype:
                                part.mimetype || 'application/octet-stream',
                        };
                    }
                }

                // Validate required fields
                if (!formData.conversationId || !formData.content) {
                    return reply.code(400).send({
                        success: false,
                        message: 'conversationId and content are required',
                    });
                }

                data = {
                    conversationId: parseInt(formData.conversationId),
                    content: formData.content,
                    contentType: formData.contentType || 'text',
                };

                // Validate conversationId is a valid number
                if (isNaN(data.conversationId)) {
                    return reply.code(400).send({
                        success: false,
                        message: 'Invalid conversationId',
                    });
                }
            } else {
                // Handle JSON body (fallback)
                data = request.body as CreateMessageType;

                if (!data.conversationId || !data.content) {
                    return reply.code(400).send({
                        success: false,
                        message: 'conversationId and content are required',
                    });
                }
            }

            const message = await this.messageService.createMessage(
                userId,
                data,
                file
            );

            return reply.code(201).send({
                success: true,
                data: message,
            });
        } catch (error) {
            request.log.error('Send message error:', error);
            return reply.code(500).send({
                success: false,
                message: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
        }
    }

    // Mark messages as read
    async markMessagesAsRead(
        request: FastifyRequest<{ Body: MarkAsReadType }>,
        reply: FastifyReply
    ) {
        try {
            const userId = request.user.id;
            const { messageIds } = request.body;

            await this.messageService.markMessagesAsRead(userId, messageIds);

            return reply.code(200).send({
                success: true,
                message: 'Messages marked as read',
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                success: false,
                message: 'Failed to mark messages as read',
            });
        }
    }

    // Delete a message
    async deleteMessage(
        request: FastifyRequest<{ Params: { messageId: string } }>,
        reply: FastifyReply
    ) {
        try {
            const userId = request.user.id;
            const messageId = parseInt(request.params.messageId);

            if (!messageId || isNaN(messageId)) {
                return reply.code(400).send({
                    success: false,
                    message: 'Invalid message ID',
                });
            }

            await this.messageService.deleteMessage(userId, messageId);

            return reply.code(200).send({
                success: true,
                message: 'Message deleted successfully',
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                success: false,
                message: 'Failed to delete message',
            });
        }
    }

    // Leave conversation
    async leaveConversation(
        request: FastifyRequest<{ Params: { conversationId: string } }>,
        reply: FastifyReply
    ) {
        try {
            const userId = request.user.id;
            const conversationId = parseInt(request.params.conversationId);

            if (!conversationId || isNaN(conversationId)) {
                return reply.code(400).send({
                    success: false,
                    message: 'Invalid conversation ID',
                });
            }

            await this.messageService.leaveConversation(userId, conversationId);

            return reply.code(200).send({
                success: true,
                message: 'Left conversation successfully',
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                success: false,
                message: 'Failed to leave conversation',
            });
        }
    }
}
