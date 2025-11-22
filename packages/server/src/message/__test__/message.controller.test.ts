// 1. Mock ENV i DB
jest.mock('../../utils/env', () => ({
    ENV: { NODE_ENV: 'development' },
}));
jest.mock('../../db', () => ({ db: {} }));

import { MessageController } from '../message.controller';
import { MessageService } from '../message.service';
import { FastifyRequest, FastifyReply } from 'fastify';

// 2. Mock Service
jest.mock('../message.service');

describe('MessageController', () => {
    let controller: MessageController;
    let mockService: jest.Mocked<MessageService>;
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        mockService = new MessageService() as jest.Mocked<MessageService>;
        controller = new MessageController();
        // Inject mock service
        (controller as any).messageService = mockService;

        mockRequest = {
            user: { id: 1 } as any,
            body: {},
            params: {},
            query: {},
            log: { error: jest.fn() } as any,
            isMultipart: jest.fn().mockReturnValue(false), // Default false
        };

        mockReply = {
            code: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('getConversations', () => {
        it('powinien zwrócić 200 i listę konwersacji', async () => {
            mockService.getUserConversations.mockResolvedValue([]);

            await controller.getConversations(
                mockRequest as FastifyRequest<any>,
                mockReply as FastifyReply
            );

            expect(mockService.getUserConversations).toHaveBeenCalledWith(
                1,
                20,
                0
            );
            expect(mockReply.code).toHaveBeenCalledWith(200);
        });
    });

    describe('createConversation', () => {
        it('powinien utworzyć konwersację (201)', async () => {
            mockRequest.body = { participantIds: [2] };
            mockService.createConversation.mockResolvedValue({ id: 10 } as any);

            await controller.createConversation(
                mockRequest as FastifyRequest<any>,
                mockReply as FastifyReply
            );

            expect(mockService.createConversation).toHaveBeenCalled();
            expect(mockReply.code).toHaveBeenCalledWith(201);
        });
    });

    describe('sendMessage', () => {
        it('powinien wysłać wiadomość JSON (201)', async () => {
            mockRequest.isMultipart = jest.fn().mockReturnValue(false);
            mockRequest.body = { conversationId: 100, content: 'Hi' };
            mockService.createMessage.mockResolvedValue({
                id: 1,
                content: 'Hi',
            } as any);

            await controller.sendMessage(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockService.createMessage).toHaveBeenCalledWith(
                1,
                { conversationId: 100, content: 'Hi' },
                undefined
            );
            expect(mockReply.code).toHaveBeenCalledWith(201);
        });

        it('powinien zwrócić 400, gdy brakuje danych w JSON', async () => {
            mockRequest.isMultipart = jest.fn().mockReturnValue(false);
            mockRequest.body = { conversationId: 100 }; // Missing content

            await controller.sendMessage(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.code).toHaveBeenCalledWith(400);
        });

        // Testowanie Multipart jest trudne w unit testach kontrolera, bo trzeba mockować async iterator.
        // Poniżej przykład, jak to zrobić dla uproszczonego przypadku pola tekstowego.
        it('powinien obsłużyć multipart form data', async () => {
            mockRequest.isMultipart = jest.fn().mockReturnValue(true);

            // Mock async iterator for request.parts()
            const parts = [
                { type: 'field', fieldname: 'conversationId', value: '100' },
                {
                    type: 'field',
                    fieldname: 'content',
                    value: 'Hello Multipart',
                },
            ];

            mockRequest.parts = jest.fn().mockReturnValue(
                (async function* () {
                    for (const part of parts) yield part;
                })()
            );

            mockService.createMessage.mockResolvedValue({ id: 1 } as any);

            await controller.sendMessage(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockService.createMessage).toHaveBeenCalledWith(
                1,
                expect.objectContaining({
                    conversationId: 100,
                    content: 'Hello Multipart',
                }),
                undefined
            );
            expect(mockReply.code).toHaveBeenCalledWith(201);
        });
    });

    describe('getMessages', () => {
        it('powinien zwrócić wiadomości (200)', async () => {
            mockRequest.query = { conversationId: 100 };
            mockService.getMessages.mockResolvedValue([]);

            await controller.getMessages(
                mockRequest as FastifyRequest<any>,
                mockReply as FastifyReply
            );

            expect(mockService.getMessages).toHaveBeenCalledWith(1, 100, 50, 0);
            expect(mockReply.code).toHaveBeenCalledWith(200);
        });
    });

    describe('addParticipant', () => {
        it('powinien dodać uczestnika (200)', async () => {
            mockRequest.params = { conversationId: '50' };
            mockRequest.body = { userId: 2 };
            mockService.addParticipantToConversation.mockResolvedValue(
                undefined
            );

            await controller.addParticipant(
                mockRequest as FastifyRequest<any>,
                mockReply as FastifyReply
            );

            expect(
                mockService.addParticipantToConversation
            ).toHaveBeenCalledWith(1, 50, 2);
            expect(mockReply.code).toHaveBeenCalledWith(200);
        });

        it('powinien zwrócić 400 dla błędnego ID konwersacji', async () => {
            mockRequest.params = { conversationId: 'abc' };

            await controller.addParticipant(
                mockRequest as FastifyRequest<any>,
                mockReply as FastifyReply
            );

            expect(mockReply.code).toHaveBeenCalledWith(400);
        });
    });

    describe('leaveConversation', () => {
        it('powinien opuścić konwersację (200)', async () => {
            mockRequest.params = { conversationId: '10' };
            mockService.leaveConversation.mockResolvedValue(undefined);

            await controller.leaveConversation(
                mockRequest as FastifyRequest<any>,
                mockReply as FastifyReply
            );

            expect(mockService.leaveConversation).toHaveBeenCalledWith(1, 10);
            expect(mockReply.code).toHaveBeenCalledWith(200);
        });
    });
});
