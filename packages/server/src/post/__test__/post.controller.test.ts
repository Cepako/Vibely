jest.mock('../../utils/env', () => ({
    ENV: { NODE_ENV: 'development' },
}));
jest.mock('../../db', () => ({ db: {} }));

import PostController from '../post.controller';
import { PostService } from '../post.service';
import { FriendshipService } from '../../friendship/friendship.service';
import { FastifyRequest, FastifyReply } from 'fastify';

jest.mock('../post.service');
jest.mock('../../friendship/friendship.service');

describe('PostController', () => {
    let controller: PostController;
    let mockPostService: jest.Mocked<PostService>;
    let mockFriendshipService: jest.Mocked<FriendshipService>;
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        mockPostService = new PostService() as jest.Mocked<PostService>;
        mockFriendshipService =
            new FriendshipService() as jest.Mocked<FriendshipService>;

        controller = new PostController(mockPostService, mockFriendshipService);

        mockRequest = {
            user: { id: 1 } as any,
            body: {},
            params: {},
            query: {},
            isMultipart: jest.fn().mockReturnValue(false),
        };

        mockReply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('getPostById', () => {
        it('powinien zwrócić post (200)', async () => {
            mockRequest.params = { postId: 100 };
            mockPostService.getPostById.mockResolvedValue({ id: 100 } as any);

            await controller.getPostById(
                mockRequest as FastifyRequest<{ Params: any }>,
                mockReply as FastifyReply
            );

            expect(mockPostService.getPostById).toHaveBeenCalledWith(100, 1);
            expect(mockReply.status).toHaveBeenCalledWith(200);
        });

        it('powinien zwrócić 404, gdy post nie istnieje', async () => {
            mockRequest.params = { postId: 100 };
            mockPostService.getPostById.mockResolvedValue(null);

            await controller.getPostById(
                mockRequest as FastifyRequest<{ Params: any }>,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(404);
        });
    });

    describe('createPost', () => {
        it('powinien obsłużyć multipart i stworzyć post (201)', async () => {
            mockRequest.isMultipart = jest.fn().mockReturnValue(true);

            const parts = [
                { type: 'field', fieldname: 'content', value: 'My Post' },
                { type: 'field', fieldname: 'contentType', value: 'photo' },
                { type: 'field', fieldname: 'privacyLevel', value: 'public' },
                {
                    type: 'file',
                    fieldname: 'file',
                    filename: 'pic.jpg',
                    mimetype: 'image/jpeg',
                    toBuffer: jest
                        .fn()
                        .mockResolvedValue(Buffer.from('fake-image')),
                },
            ];

            mockRequest.parts = jest.fn().mockReturnValue(
                (async function* () {
                    for (const part of parts) yield part;
                })()
            );

            mockPostService.createPost.mockResolvedValue({ id: 1 } as any);

            await controller.createPost(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockPostService.createPost).toHaveBeenCalledWith(
                1,
                expect.objectContaining({
                    content: 'My Post',
                    file: expect.objectContaining({ filename: 'pic.jpg' }),
                })
            );
            expect(mockReply.status).toHaveBeenCalledWith(201);
        });

        it('powinien zwrócić 400, gdy brakuje pliku', async () => {
            mockRequest.isMultipart = jest.fn().mockReturnValue(true);

            const parts = [
                { type: 'field', fieldname: 'content', value: 'My Post' },
                { type: 'field', fieldname: 'contentType', value: 'photo' },
                { type: 'field', fieldname: 'privacyLevel', value: 'public' },
            ];

            mockRequest.parts = jest.fn().mockReturnValue(
                (async function* () {
                    for (const part of parts) yield part;
                })()
            );

            await controller.createPost(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith(
                expect.objectContaining({ error: 'Missing file' })
            );
        });
    });

    describe('editPost', () => {
        it('powinien zaktualizować post (200)', async () => {
            mockRequest.params = { postId: 10 };
            mockRequest.body = { content: 'Update', privacyLevel: 'private' };
            mockPostService.editPost.mockResolvedValue({ id: 10 } as any);

            await controller.editPost(
                mockRequest as FastifyRequest<{ Params: any; Body: any }>,
                mockReply as FastifyReply
            );

            expect(mockPostService.editPost).toHaveBeenCalledWith(10, 1, {
                content: 'Update',
                privacyLevel: 'private',
            });
            expect(mockReply.status).toHaveBeenCalledWith(200);
        });
    });

    describe('deletePost', () => {
        it('powinien usunąć post (200)', async () => {
            mockRequest.params = { postId: 10 };
            mockPostService.deletePost.mockResolvedValue(undefined);

            await controller.deletePost(
                mockRequest as FastifyRequest<{ Params: any }>,
                mockReply as FastifyReply
            );

            expect(mockPostService.deletePost).toHaveBeenCalledWith(10, 1);
            expect(mockReply.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getHomeFeed', () => {
        it('powinien pobrać feed (200)', async () => {
            mockPostService.getHomeFeed.mockResolvedValue([]);

            await controller.getHomeFeed(
                mockRequest as FastifyRequest<{ Querystring: any }>,
                mockReply as FastifyReply
            );

            expect(mockPostService.getHomeFeed).toHaveBeenCalledWith(1, 20, 0);
            expect(mockReply.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getPosts (Profile)', () => {
        it('powinien pobrać posty profilu (200)', async () => {
            mockRequest.params = { profileId: 5 };
            mockFriendshipService.getFriendshipStatus.mockResolvedValue(
                'accepted'
            );
            mockPostService.getPosts.mockResolvedValue([]);

            await controller.getPosts(
                mockRequest as FastifyRequest<{ Params: any }>,
                mockReply as FastifyReply
            );

            expect(
                mockFriendshipService.getFriendshipStatus
            ).toHaveBeenCalledWith(1, 5);
            expect(mockPostService.getPosts).toHaveBeenCalledWith(
                5,
                1,
                'accepted'
            );
            expect(mockReply.status).toHaveBeenCalledWith(200);
        });
    });
});
