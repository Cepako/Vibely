jest.mock('../../utils/env', () => ({
    ENV: { NODE_ENV: 'development' },
}));
jest.mock('../../db', () => ({ db: {} }));

import { CommentReactionController } from '../commentReaction.controller';
import { CommentReactionService } from '../commentReaction.service';
import { FastifyRequest, FastifyReply } from 'fastify';

jest.mock('../commentReaction.service');

describe('CommentReactionController', () => {
    let controller: CommentReactionController;
    let mockService: jest.Mocked<CommentReactionService>;
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;

    beforeEach(() => {
        mockService =
            new CommentReactionService() as jest.Mocked<CommentReactionService>;
        controller = new CommentReactionController(mockService);

        mockRequest = {
            user: { id: 1 } as any,
            body: {},
            params: {},
        };

        mockReply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    describe('createComment', () => {
        it('powinien zwrócić status 201 przy sukcesie', async () => {
            mockRequest.body = { postId: 100, content: 'Hello' };
            mockService.createComment.mockResolvedValue({
                id: 1,
                content: 'Hello',
            } as any);

            await controller.createComment(
                mockRequest as FastifyRequest<{ Body: any }>,
                mockReply as FastifyReply
            );

            expect(mockService.createComment).toHaveBeenCalledWith(1, {
                postId: 100,
                content: 'Hello',
            });
            expect(mockReply.status).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Comment created successfully',
                })
            );
        });

        it('powinien zwrócić 404, gdy serwis rzuci błąd "not found"', async () => {
            mockRequest.body = { postId: 999, content: 'Hello' };
            mockService.createComment.mockRejectedValue(
                new Error('Post not found')
            );

            await controller.createComment(
                mockRequest as FastifyRequest<{ Body: any }>,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({
                error: 'Post not found',
            });
        });
    });

    describe('togglePostLike', () => {
        it('powinien zwrócić status 200 i informację o polubieniu', async () => {
            mockRequest.params = { postId: 50 };
            mockService.togglePostLike.mockResolvedValue({ liked: true });

            await controller.togglePostLike(
                mockRequest as FastifyRequest<{ Params: any }>,
                mockReply as FastifyReply
            );

            expect(mockService.togglePostLike).toHaveBeenCalledWith(1, 50);
            expect(mockReply.status).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith(
                expect.objectContaining({ liked: true })
            );
        });
    });

    describe('getPostComments', () => {
        it('powinien zwrócić listę komentarzy', async () => {
            mockRequest.params = { postId: 10 };
            const fakeComments = [{ id: 1, content: 'test' }];
            mockService.getPostComments.mockResolvedValue(fakeComments as any);

            await controller.getPostComments(
                mockRequest as FastifyRequest<{ Params: any }>,
                mockReply as FastifyReply
            );

            expect(mockService.getPostComments).toHaveBeenCalledWith(10, 1);
            expect(mockReply.status).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith(fakeComments);
        });
    });

    describe('deleteComment', () => {
        it('powinien zwrócić 200 po usunięciu', async () => {
            mockRequest.params = { commentId: 5 };
            mockService.deleteComment.mockResolvedValue(undefined);

            await controller.deleteComment(
                mockRequest as FastifyRequest<{ Params: any }>,
                mockReply as FastifyReply
            );

            expect(mockService.deleteComment).toHaveBeenCalledWith(1, 5);
            expect(mockReply.status).toHaveBeenCalledWith(200);
        });

        it('powinien zwrócić 404 dla unauthorized', async () => {
            mockRequest.params = { commentId: 5 };
            mockService.deleteComment.mockRejectedValue(
                new Error('Comment not found or unauthorized')
            );

            await controller.deleteComment(
                mockRequest as FastifyRequest<{ Params: any }>,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(404);
        });
    });
});
