import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useWebSocket } from '../hooks/useWebSocket';
import { type NotificationData } from '../../types/notification';

interface WebSocketContextType {
    isConnected: boolean;
    notifications: NotificationData[];
    unreadCount: number;
    addNotification: (notification: NotificationData) => void;
    setUnreadCount: (count: number | ((prev: number) => number)) => void;
    updateNotifications: (
        updater: (prev: NotificationData[]) => NotificationData[]
    ) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocketContext = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error(
            'useWebSocketContext must be used within WebSocketProvider'
        );
    }
    return context;
};

interface WebSocketProviderProps {
    children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
    children,
}) => {
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const websocketUrl = useMemo(() => {
        return user?.id
            ? `ws://localhost:3000/ws/notifications?userId=${user.id}`
            : null;
    }, [user?.id]);

    const { isConnected } = useWebSocket({
        url: websocketUrl || '',
        enabled: !!websocketUrl,
        onMessage: useCallback(
            (message: any) => {
                console.log('Notification WebSocket message:', message);

                if (message.type === 'notification') {
                    setNotifications((prev) => [message.data, ...prev]);
                    setUnreadCount((prev) => prev + 1);

                    if (Notification.permission === 'granted') {
                        new Notification(message.data.content, {
                            icon: '/notification-icon.png',
                            tag: `notification-${message.data.id}`,
                        });
                    }
                } else if (message.type === 'connected') {
                    console.log(
                        'Connected to notifications WebSocket:',
                        message.message
                    );
                } else if (
                    message.type === 'auth_error' ||
                    message.type === 'token_expired'
                ) {
                    console.log('WebSocket authentication error, logging out');
                    logout();
                }
            },
            [logout]
        ),
        onConnect: useCallback(() => {
            console.log('Connected to notifications WebSocket');
        }, []),
        onDisconnect: useCallback(() => {
            console.log('Disconnected from notifications WebSocket');
        }, []),
    });

    useEffect(() => {
        if (user?.id && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user?.id]);

    const addNotification = useCallback((notification: NotificationData) => {
        setNotifications((prev) => [notification, ...prev]);
    }, []);

    const updateNotifications = useCallback(
        (updater: (prev: NotificationData[]) => NotificationData[]) => {
            setNotifications(updater);
        },
        []
    );

    const contextValue = useMemo(
        () => ({
            isConnected,
            notifications,
            unreadCount,
            addNotification,
            setUnreadCount,
            updateNotifications,
        }),
        [
            isConnected,
            notifications,
            unreadCount,
            addNotification,
            updateNotifications,
        ]
    );

    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
};
