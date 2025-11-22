import { websocketManager } from '../websocketManager';
import WebSocket from 'ws';

jest.mock('ws');

describe('WebSocketManager', () => {
    const createMockSocket = () =>
        ({
            readyState: WebSocket.OPEN,
            send: jest.fn(),
            close: jest.fn(),
            on: jest.fn(),
        }) as unknown as WebSocket;

    beforeEach(() => {
        jest.clearAllMocks();
        (websocketManager as any).websocketClients.clear();
        (websocketManager as any).chatClients.clear();
    });

    describe('Notification Connections', () => {
        it('powinien dodać połączenie powiadomień i wysłać listę online', () => {
            const userId = 1;
            const socket = createMockSocket();

            websocketManager.addNotificationConnection(userId, socket);

            const connections =
                websocketManager.getNotificationConnections(userId);
            expect(connections).toHaveLength(1);
            expect(connections[0]).toBe(socket);

            expect(socket.send).toHaveBeenCalledWith(
                expect.stringContaining('presence_init')
            );
        });

        it('powinien usunąć połączenie', () => {
            const userId = 1;
            const socket = createMockSocket();

            websocketManager.addNotificationConnection(userId, socket);
            websocketManager.removeNotificationConnection(userId, socket);

            const connections =
                websocketManager.getNotificationConnections(userId);
            expect(connections).toHaveLength(0);
        });

        it('powinien emitować powiadomienie do użytkownika', () => {
            const userId = 1;
            const socket = createMockSocket();
            const notification = { type: 'test', content: 'hello' };

            websocketManager.addNotificationConnection(userId, socket);
            websocketManager.emitNotificationToUser(userId, notification);

            expect(socket.send).toHaveBeenCalledWith(
                expect.stringContaining('"type":"notification"')
            );
            expect(socket.send).toHaveBeenCalledWith(
                expect.stringContaining('"content":"hello"')
            );
        });

        it('nie powinien wysyłać do zamkniętego socketa', () => {
            const userId = 1;
            const socket = createMockSocket();
            Object.defineProperty(socket, 'readyState', {
                value: WebSocket.CLOSED,
            });

            websocketManager.addNotificationConnection(userId, socket);
            websocketManager.emitNotificationToUser(userId, { type: 'test' });

            expect(socket.send).not.toHaveBeenCalledWith(
                expect.stringContaining('"type":"notification"')
            );
        });
    });

    describe('Chat Connections', () => {
        it('powinien zarządzać połączeniami czatu', () => {
            const conversationId = 100;
            const socket = createMockSocket();
            const connectionData = { socket, userId: 1 };

            websocketManager.addChatConnection(conversationId, connectionData);

            let connections =
                websocketManager.getChatConnections(conversationId);
            expect(connections).toHaveLength(1);

            websocketManager.removeChatConnection(conversationId, socket);

            connections = websocketManager.getChatConnections(conversationId);
            expect(connections).toHaveLength(0);
        });
    });

    describe('Presence', () => {
        it('powinien broadcastować zmianę statusu (online)', () => {
            const user1 = 1;
            const user2 = 2;
            const socket1 = createMockSocket();
            const socket2 = createMockSocket();

            websocketManager.addNotificationConnection(user1, socket1);

            websocketManager.addNotificationConnection(user2, socket2);

            expect(socket1.send).toHaveBeenCalledWith(
                expect.stringContaining('"type":"presence"')
            );
            expect(socket1.send).toHaveBeenCalledWith(
                expect.stringContaining('"isOnline":true')
            );
        });
    });
});
