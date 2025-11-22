import { MessageService } from '../message.service';
import { db } from '../../db';
import { NotificationService } from '../../notification/notification.service';
import UserService from '../../user/user.service';
import { websocketManager } from '../../ws/websocketManager';
import { handleFileUpload } from '../../utils/handleFileUpload';

jest.mock('../../notification/notification.service');
jest.mock('../../user/user.service');
jest.mock('../../friendship/friendship.service');

jest.mock('../../utils/handleFileUpload');
jest.mock('../../ws/websocketManager', () => ({
    websocketManager: {
        getChatConnections: jest.fn(),
    },
}));

jest.mock('../../db', () => ({
    db: {
        query: {
            messages: { findFirst: jest.fn(), findMany: jest.fn() },
            conversations: { findFirst: jest.fn(), findMany: jest.fn() },
            conversationParticipants: {
                findFirst: jest.fn(),
                findMany: jest.fn(),
            },
            users: { findFirst: jest.fn(), findMany: jest.fn() },
        },
        insert: jest.fn(() => ({
            values: jest.fn(() => ({ returning: jest.fn() })),
        })),
        update: jest.fn(() => ({ set: jest.fn(() => ({ where: jest.fn() })) })),
        delete: jest.fn(() => ({ where: jest.fn() })),
        select: jest.fn(() => ({
            from: jest.fn(() => ({ where: jest.fn() })),
        })),
    },
}));

describe('MessageService', () => {
    let service: MessageService;
    let mockNotificationService: jest.Mocked<NotificationService>;
    let mockUserService: jest.Mocked<UserService>;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        service = new MessageService();

        mockNotificationService = (NotificationService as unknown as jest.Mock)
            .mock.instances[0];
        mockUserService = (UserService as unknown as jest.Mock).mock
            .instances[0];
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('createMessage', () => {
        const userId = 1;
        const conversationId = 100;
        const messageData = { conversationId, content: 'Hello' };

        it('powinien utworzyć wiadomość tekstową, wysłać przez WS i powiadomić uczestników', async () => {
            const createdMessage = {
                id: 1,
                ...messageData,
                senderId: userId,
                isRead: false,
                createdAt: 'now',
            };

            (db.insert as jest.Mock).mockReturnValueOnce({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([createdMessage]),
                }),
            });

            mockUserService.findUserById.mockResolvedValue({
                id: userId,
                name: 'John',
                surname: 'Doe',
            } as any);

            (websocketManager.getChatConnections as jest.Mock).mockReturnValue([
                { socket: { readyState: 1, send: jest.fn() } },
            ]);

            const recipients = [{ userId: 2 }, { userId: 3 }];
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue(recipients),
                }),
            });

            const result = await service.createMessage(userId, messageData);

            expect(db.insert).toHaveBeenCalled();
            expect(websocketManager.getChatConnections).toHaveBeenCalledWith(
                conversationId
            );
            expect(
                mockNotificationService.createNewMessageNotification
            ).toHaveBeenCalledTimes(2);
            expect(result.content).toBe('Hello');
        });

        it('powinien obsłużyć upload pliku', async () => {
            const fileData = {
                buffer: Buffer.from('test'),
                mimetype: 'image/png',
                filename: 'test.png',
            };
            const createdMessage = {
                id: 1,
                conversationId,
                senderId: userId,
                contentType: 'image',
            };
            const createdAttachment = {
                id: 99,
                fileUrl: '/uploads/test.png',
                fileType: 'image',
            };

            (db.insert as jest.Mock).mockReturnValueOnce({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([createdMessage]),
                }),
            });

            (handleFileUpload as jest.Mock).mockResolvedValue(
                '/uploads/test.png'
            );

            (db.insert as jest.Mock).mockReturnValueOnce({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([createdAttachment]),
                }),
            });

            mockUserService.findUserById.mockResolvedValue({} as any);
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            });

            const result = await service.createMessage(
                userId,
                { conversationId },
                fileData as any
            );

            expect(handleFileUpload).toHaveBeenCalled();
            expect(db.insert).toHaveBeenCalledTimes(2);
            expect(result.attachments).toBeDefined();
            expect(result.attachments![0]!.fileUrl).toBe('/uploads/test.png');
        });
    });

    describe('getMessages', () => {
        it('powinien zwrócić wiadomości jeśli użytkownik jest uczestnikiem', async () => {
            const userId = 1;
            const conversationId = 100;

            (
                db.query.conversationParticipants.findFirst as jest.Mock
            ).mockResolvedValue({ userId });

            (db.query.messages.findMany as jest.Mock).mockResolvedValue([
                {
                    id: 1,
                    content: 'Hi',
                    user: { id: 2, name: 'Alice' },
                    messageAttachments: [],
                },
            ]);

            const result = await service.getMessages(userId, conversationId);

            expect(result).toHaveLength(1);
            expect(result[0]!.content).toBe('Hi');
        });

        it('powinien rzucić błąd jeśli użytkownik nie należy do konwersacji', async () => {
            (
                db.query.conversationParticipants.findFirst as jest.Mock
            ).mockResolvedValue(null);

            await expect(service.getMessages(1, 100)).rejects.toThrow(
                'User is not a participant'
            );
        });
    });

    describe('createConversation', () => {
        it('powinien stworzyć nową konwersację grupową', async () => {
            const userId = 1;
            const data = {
                participantIds: [2, 3],
                type: 'group' as const,
                name: 'Team',
            };

            (db.query.users.findMany as jest.Mock).mockResolvedValue([
                {},
                {},
                {},
            ]);

            (db.insert as jest.Mock).mockReturnValueOnce({
                values: jest.fn().mockReturnValue({
                    returning: jest
                        .fn()
                        .mockResolvedValue([
                            { id: 50, type: 'group', name: 'Team' },
                        ]),
                }),
            });

            (db.insert as jest.Mock).mockReturnValueOnce({ values: jest.fn() });

            (
                db.query.conversationParticipants.findFirst as jest.Mock
            ).mockResolvedValue({});
            (db.query.conversations.findFirst as jest.Mock).mockResolvedValue({
                id: 50,
                type: 'group',
                name: 'Team',
                conversationParticipants: [],
            });

            const result = await service.createConversation(userId, data);

            expect(result.name).toBe('Team');
            expect(db.insert).toHaveBeenCalledTimes(2);
        });
    });

    describe('getUserConversations', () => {
        it('powinien zwrócić listę konwersacji z ostatnią wiadomością', async () => {
            const userId = 1;

            (
                db.query.conversationParticipants.findMany as jest.Mock
            ).mockResolvedValue([
                {
                    conversation: {
                        id: 10,
                        type: 'group',
                        conversationParticipants: [],
                    },
                },
            ]);

            (db.query.messages.findFirst as jest.Mock).mockResolvedValue({
                id: 55,
                content: 'Last msg',
                user: { id: 2 },
            });

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([{ count: 2 }]),
                }),
            });

            const result = await service.getUserConversations(userId);

            expect(result).toHaveLength(1);
            expect(result[0]!.lastMessage?.content).toBe('Last msg');
            expect(result[0]!.unreadCount).toBe(2);
        });
    });

    describe('addParticipantToConversation', () => {
        it('powinien dodać uczestnika, jeśli requester jest adminem', async () => {
            const userId = 1;
            const conversationId = 100;
            const newUserId = 2;

            (db.query.conversations.findFirst as jest.Mock).mockResolvedValue({
                id: conversationId,
                type: 'group',
            });

            (db.query.conversationParticipants.findFirst as jest.Mock)
                .mockResolvedValueOnce({ userId, role: 'admin' })
                .mockResolvedValueOnce(null);

            const insertMock = jest.fn();
            (db.insert as jest.Mock).mockReturnValue({ values: insertMock });

            await service.addParticipantToConversation(
                userId,
                conversationId,
                newUserId
            );

            expect(insertMock).toHaveBeenCalledWith({
                conversationId,
                userId: newUserId,
                role: 'member',
            });
        });

        it('powinien rzucić błąd, jeśli requester nie jest adminem', async () => {
            (db.query.conversations.findFirst as jest.Mock).mockResolvedValue({
                id: 100,
                type: 'group',
            });
            (
                db.query.conversationParticipants.findFirst as jest.Mock
            ).mockResolvedValue({ userId: 1, role: 'member' });

            await expect(
                service.addParticipantToConversation(1, 100, 2)
            ).rejects.toThrow('Only admins can add participants');
        });
    });
});
