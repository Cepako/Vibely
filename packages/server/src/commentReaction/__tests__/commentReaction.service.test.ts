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
        })), // Chainowanie inserta
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
        // NotificationService jest mockowany automatycznie przez jest.mock na górze
        service = new CommentReactionService();
        // Pobieramy instancję mocka, aby sprawdzać czy metody były wołane
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
            // Arrange
            const inputData = { postId: 100, content: 'Nice post!' };

            // Mockowanie po kolei zapytań
            (db.query.posts.findFirst as jest.Mock).mockResolvedValue(mockPost); // Znajdź post
            (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser); // Znajdź autora komentarza

            const createdComment = { id: 1, ...inputData, userId: 1 };
            mockInsertReturn(createdComment);

            // Act
            const result = await service.createComment(1, inputData);

            // Assert
            expect(result).toEqual(createdComment);
            expect(db.query.posts.findFirst).toHaveBeenCalled();
            // Sprawdź powiadomienie (autor posta != autor komentarza)
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
            // Arrange
            (db.query.posts.findFirst as jest.Mock).mockResolvedValue(mockPost);
            (db.query.postReactions.findFirst as jest.Mock).mockResolvedValue(
                null
            ); // Brak lajka

            // Mock dla inserta (chaining: insert().values())
            const insertValuesMock = jest.fn();
            (db.insert as jest.Mock).mockReturnValue({
                values: insertValuesMock,
            });

            (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser); // Pobranie danych likera do powiadomienia

            // Act
            const result = await service.togglePostLike(1, 100);

            // Assert
            expect(result).toEqual({ liked: true });
            expect(db.insert).toHaveBeenCalled();
            expect(
                mockNotificationService.notifyPostReaction
            ).toHaveBeenCalled();
        });

        it('powinien usunąć lajka, jeśli już istnieje', async () => {
            // Arrange
            (db.query.posts.findFirst as jest.Mock).mockResolvedValue(mockPost);
            (db.query.postReactions.findFirst as jest.Mock).mockResolvedValue({
                id: 55,
                userId: 1,
                postId: 100,
            }); // Lajk jest

            // Act
            const result = await service.togglePostLike(1, 100);

            // Assert
            expect(result).toEqual({ liked: false });
            expect(db.delete).toHaveBeenCalled(); // Powinien usunąć
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

            // Sprawdź czy wywołano delete 3 razy (odpowiedzi, reakcje, sam komentarz)
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
