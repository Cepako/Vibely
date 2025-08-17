import WebSocket from 'ws';

class WebSocketManager {
    private static instance: WebSocketManager;
    private websocketClients = new Map<number, WebSocket[]>();
    private chatClients = new Map<number, any[]>();

    private constructor() {}

    static getInstance(): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
        }
        return WebSocketManager.instance;
    }

    addNotificationConnection(userId: number, socket: WebSocket): void {
        console.log(` Adding notification connection for user ${userId}`);

        if (!this.websocketClients.has(userId)) {
            this.websocketClients.set(userId, []);
        }

        this.websocketClients.get(userId)!.push(socket);

        console.log(
            ` User ${userId} now has ${this.websocketClients.get(userId)!.length} notification connections`
        );
        console.log(
            ` Total users with notification connections: ${this.websocketClients.size}`
        );
    }

    removeNotificationConnection(userId: number, socket: WebSocket): void {
        console.log(` Removing notification connection for user ${userId}`);

        const userConnections = this.websocketClients.get(userId) || [];
        const index = userConnections.indexOf(socket);

        if (index > -1) {
            userConnections.splice(index, 1);
            console.log(
                `Removed connection. User ${userId} now has ${userConnections.length} connections`
            );
        }

        if (userConnections.length === 0) {
            this.websocketClients.delete(userId);
            console.log(
                ` Removed user ${userId} from notification clients (no connections left)`
            );
        }
    }

    getNotificationConnections(userId: number): WebSocket[] {
        return this.websocketClients.get(userId) || [];
    }

    emitNotificationToUser(userId: number, notification: any): void {
        console.log(
            ` WebSocketManager: Emitting notification to user ${userId}`
        );
        console.log(
            ` Available users: ${Array.from(this.websocketClients.keys())}`
        );

        const userConnections = this.getNotificationConnections(userId);
        console.log(
            ` Found ${userConnections.length} connections for user ${userId}`
        );

        if (userConnections.length === 0) {
            console.log(` No active WebSocket connections for user ${userId}`);
            return;
        }

        userConnections.forEach((socket: WebSocket, index: number) => {
            console.log(
                ` Processing connection ${index} for user ${userId}, readyState: ${socket.readyState}`
            );

            if (socket.readyState === WebSocket.OPEN) {
                try {
                    const message = JSON.stringify({
                        type: 'notification',
                        data: notification,
                    });

                    console.log(
                        `Sending notification to user ${userId}, connection ${index}`
                    );
                    socket.send(message);
                    console.log(
                        `Notification sent successfully to user ${userId}, connection ${index}`
                    );
                } catch (error) {
                    console.error(
                        `Error sending notification to user ${userId}, connection ${index}:`,
                        error
                    );
                }
            } else {
                console.log(
                    `Connection ${index} for user ${userId} is not open (readyState: ${socket.readyState})`
                );
            }
        });
    }

    addChatConnection(conversationId: number, connectionData: any): void {
        if (!this.chatClients.has(conversationId)) {
            this.chatClients.set(conversationId, []);
        }
        this.chatClients.get(conversationId)!.push(connectionData);
    }

    removeChatConnection(conversationId: number, socket: WebSocket): void {
        const conversationConnections =
            this.chatClients.get(conversationId) || [];
        const index = conversationConnections.findIndex(
            (conn) => conn.socket === socket
        );

        if (index > -1) {
            conversationConnections.splice(index, 1);
        }

        if (conversationConnections.length === 0) {
            this.chatClients.delete(conversationId);
        }
    }

    getChatConnections(conversationId: number): any[] {
        return this.chatClients.get(conversationId) || [];
    }

    getNotificationStats() {
        return {
            notificationConnections: this.websocketClients.size,
            chatConnections: this.chatClients.size,
            totalNotificationSockets: Array.from(
                this.websocketClients.values()
            ).reduce((total, connections) => total + connections.length, 0),
            totalChatSockets: Array.from(this.chatClients.values()).reduce(
                (total, connections) => total + connections.length,
                0
            ),
            connectedUsers: Array.from(this.websocketClients.keys()),
            userConnections: Array.from(this.websocketClients.entries()).map(
                ([userId, connections]) => ({
                    userId,
                    connectionCount: connections.length,
                    connectionStates: connections.map(
                        (socket) => socket.readyState
                    ),
                })
            ),
        };
    }
}

export const websocketManager = WebSocketManager.getInstance();
