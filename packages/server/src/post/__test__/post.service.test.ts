import { PostService } from '../post.service';
import { db } from '../../db';
import { handleFileUpload } from '../../utils/handleFileUpload';
import { deleteFile } from '../../utils/deleteFile';

jest.mock('../../utils/handleFileUpload');
jest.mock('../../utils/deleteFile');

jest.mock('../../db', () => ({
    db: {
        query: {
            posts: { findFirst: jest.fn(), findMany: jest.fn() },
            friendships: { findFirst: jest.fn(), findMany: jest.fn() },
        },
        insert: jest.fn(() => ({
            values: jest.fn(() => ({ returning: jest.fn() })),
        })),
        update: jest.fn(() => ({
            set: jest.fn(() => ({
                where: jest.fn(() => ({ returning: jest.fn() })),
            })),
        })),
        delete: jest.fn(() => ({ where: jest.fn() })),
    },
}));

describe('PostService', () => {
    let service: PostService;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        service = new PostService();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('createPost', () => {
        it('powinien utworzyć post z plikiem', async () => {
            const mockFile = {
                buffer: Buffer.from('img'),
                mimetype: 'image/png',
                filename: 'test.png',
            };
            const data = {
                content: 'Hi',
                contentType: 'photo' as const,
                privacyLevel: 'public' as const,
                file: mockFile,
            };

            (handleFileUpload as jest.Mock).mockResolvedValue(
                '/uploads/test.png'
            );

            const createdPost = {
                id: 1,
                userId: 1,
                ...data,
                contentUrl: '/uploads/test.png',
            };
            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([createdPost]),
                }),
            });

            const result = await service.createPost(1, data);

            expect(handleFileUpload).toHaveBeenCalled();
            expect(db.insert).toHaveBeenCalled();
            expect(result).toEqual(createdPost);
        });

        it('powinien zwrócić null, jeśli upload się nie uda', async () => {
            const mockFile = {
                buffer: Buffer.from('img'),
                mimetype: 'image/png',
                filename: 'test.png',
            };
            const data = {
                content: 'Hi',
                contentType: 'photo' as const,
                privacyLevel: 'public' as const,
                file: mockFile,
            };

            (handleFileUpload as jest.Mock).mockResolvedValue(null);

            const result = await service.createPost(1, data);

            expect(result).toBeNull();
            expect(db.insert).not.toHaveBeenCalled();
        });
    });

    describe('getPostById', () => {
        const mockPost = { id: 1, userId: 10, privacyLevel: 'public' };

        it('powinien zwrócić post, jeśli jest publiczny', async () => {
            (db.query.posts.findFirst as jest.Mock).mockResolvedValue(mockPost);

            const result = await service.getPostById(1, 99);
            expect(result).toEqual(mockPost);
        });

        it('powinien zwrócić post, jeśli viewer jest właścicielem', async () => {
            const privatePost = {
                ...mockPost,
                userId: 10,
                privacyLevel: 'private',
            };
            (db.query.posts.findFirst as jest.Mock).mockResolvedValue(
                privatePost
            );

            const result = await service.getPostById(1, 10);
            expect(result).toEqual(privatePost);
        });

        it('powinien zwrócić null dla postu prywatnego (inny viewer)', async () => {
            const privatePost = {
                ...mockPost,
                userId: 10,
                privacyLevel: 'private',
            };
            (db.query.posts.findFirst as jest.Mock).mockResolvedValue(
                privatePost
            );

            const result = await service.getPostById(1, 99);
            expect(result).toBeNull();
        });

        it('powinien sprawdzić znajomość dla postu "friends"', async () => {
            const friendsPost = {
                ...mockPost,
                userId: 10,
                privacyLevel: 'friends',
            };
            (db.query.posts.findFirst as jest.Mock).mockResolvedValue(
                friendsPost
            );

            // Mock braku przyjaźni
            (db.query.friendships.findFirst as jest.Mock).mockResolvedValue(
                null
            );

            const result = await service.getPostById(1, 99);
            expect(result).toBeNull();
            expect(db.query.friendships.findFirst).toHaveBeenCalled();
        });
    });

    describe('deletePost', () => {
        it('powinien usunąć post i plik', async () => {
            const postToDelete = {
                id: 1,
                userId: 1,
                contentUrl: '/uploads/img.png',
            };
            (db.query.posts.findFirst as jest.Mock).mockResolvedValue(
                postToDelete
            );

            await service.deletePost(1, 1);

            expect(deleteFile).toHaveBeenCalledWith('/uploads/img.png');
            expect(db.delete).toHaveBeenCalled();
        });

        it('powinien rzucić błąd, gdy post nie istnieje', async () => {
            (db.query.posts.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(service.deletePost(1, 1)).rejects.toThrow(
                'Post not found or unauthorized'
            );
        });
    });

    describe('getHomeFeed', () => {
        it('powinien zwrócić posty (pusta lista na start)', async () => {
            (db.query.friendships.findMany as jest.Mock).mockResolvedValue([]);
            (db.query.posts.findMany as jest.Mock).mockResolvedValue([]);

            const result = await service.getHomeFeed(1);
            expect(result).toEqual([]);
        });
    });

    describe('editPost', () => {
        it('powinien zaktualizować post', async () => {
            const existing = { id: 1, userId: 1, contentUrl: 'url' };
            (db.query.posts.findFirst as jest.Mock).mockResolvedValue(existing);

            const updated = { ...existing, content: 'New' };
            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([updated]),
                    }),
                }),
            });

            const result = await service.editPost(1, 1, {
                content: 'New',
                privacyLevel: 'public',
            });
            expect(result.content).toBe('New');
        });
    });
});
