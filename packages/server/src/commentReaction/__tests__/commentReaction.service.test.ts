import { CommentReactionService } from '../commentReaction.service';
import { db } from '../../db';
import { NotificationService } from '../../notification/notification.service';

jest.mock('../../notification/notification.service');

jest.mock('../../db', () => ({
    db: {
        query: {
            posts: { findFirst: jest.fn() },
            users: { findFirst: jest.fn() },
            comments: { findFirst: jest.fn(), findMany: jest.fn() },
            commentReactions: { findFirst: jest.fn(), findMany: jest.fn() },
            postReactions: { findFirst: jest.fn(), findMany: jest.fn() },
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

const mockInsertReturn = (val: any) => {
    (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([val]),
        }),
    });
};

describe('CommentReactionService', () => {
    let service: CommentReactionService;
    let mockNotificationService: jest.Mocked<NotificationService>;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new CommentReactionService();
        mockNotificationService = (NotificationService as unknown as jest.Mock)
            .mock.instances[0];
    });

    describe('createComment', () => {
        const mockUser = { id: 1, name: 'John', surname: 'Doe' };
        const mockPost = {
            id: 100,
            user: { id: 2, name: 'Owner', surname: 'Post' },
        };

        it('powinien utworzyć komentarz i wysłać powiadomienie do autora posta', async () => {
            const inputData = { postId: 100, content: 'Nice post!' };

            (db.query.posts.findFirst as jest.Mock).mockResolvedValue(mockPost);
            (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);

            const createdComment = { id: 1, ...inputData, userId: 1 };
            mockInsertReturn(createdComment);

            const result = await service.createComment(1, inputData);

            expect(result).toEqual(createdComment);
            expect(db.query.posts.findFirst).toHaveBeenCalled();
            expect(
                mockNotificationService.notifyNewComment
            ).toHaveBeenCalledWith(
                mockPost.user.id,
                mockUser.id,
                'John Doe',
                100
            );
        });

        it('powinien rzucić błąd, gdy post nie istnieje', async () => {
            const consoleSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            (db.query.posts.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(
                service.createComment(1, { postId: 999, content: 'Hi' })
            ).rejects.toThrow('Post not found');

            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('togglePostLike', () => {
        const mockPost = {
            id: 100,
            user: { id: 2, name: 'Owner', surname: 'Post' },
        };
        const mockUser = { id: 1, name: 'Liker', surname: 'Man' };

        it('powinien dodać lajka, jeśli jeszcze nie istnieje', async () => {
            (db.query.posts.findFirst as jest.Mock).mockResolvedValue(mockPost);
            (db.query.postReactions.findFirst as jest.Mock).mockResolvedValue(
                null
            );

            const insertValuesMock = jest.fn();
            (db.insert as jest.Mock).mockReturnValue({
                values: insertValuesMock,
            });

            (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);

            const result = await service.togglePostLike(1, 100);

            expect(result).toEqual({ liked: true });
            expect(db.insert).toHaveBeenCalled();
            expect(
                mockNotificationService.notifyPostReaction
            ).toHaveBeenCalled();
        });

        it('powinien usunąć lajka, jeśli już istnieje', async () => {
            (db.query.posts.findFirst as jest.Mock).mockResolvedValue(mockPost);
            (db.query.postReactions.findFirst as jest.Mock).mockResolvedValue({
                id: 55,
                userId: 1,
                postId: 100,
            });

            const result = await service.togglePostLike(1, 100);

            expect(result).toEqual({ liked: false });
            expect(db.delete).toHaveBeenCalled();
            expect(
                mockNotificationService.notifyPostReaction
            ).not.toHaveBeenCalled();
        });
    });

    describe('deleteComment', () => {
        it('powinien usunąć komentarz i powiązane dane', async () => {
            const mockComment = { id: 10, userId: 1 };
            (db.query.comments.findFirst as jest.Mock).mockResolvedValue(
                mockComment
            );

            await service.deleteComment(1, 10);

            expect(db.delete).toHaveBeenCalledTimes(3);
        });

        it('powinien rzucić błąd, gdy użytkownik nie jest autorem komentarza', async () => {
            (db.query.comments.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(service.deleteComment(1, 10)).rejects.toThrow(
                'Comment not found or unauthorized'
            );
        });
    });
});
