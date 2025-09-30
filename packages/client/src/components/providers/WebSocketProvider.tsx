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
        updater:
            | NotificationData[]
            | ((prev: NotificationData[]) => NotificationData[])
    ) => void;
    setNotifications: (notifications: NotificationData[]) => void;
    // subscribe to chat events coming over the notification websocket
    addChatListener: (cb: (event: any) => void) => () => void;
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

    const dedupeAndSort = useCallback((arr: NotificationData[]) => {
        const map = new Map<number, NotificationData>();
        for (const n of arr) {
            const existing = map.get(n.id);
            if (!existing) {
                map.set(n.id, n);
            } else {
                const existingTs = new Date(existing.createdAt).getTime();
                const newTs = new Date(n.createdAt).getTime();
                if (newTs > existingTs) map.set(n.id, n);
            }
        }
        return Array.from(map.values()).sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );
    }, []);

    const { isConnected } = useWebSocket({
        url: websocketUrl || '',
        enabled: !!websocketUrl,
        onMessage: useCallback(
            (message: any) => {
                console.log('Notification WebSocket message:', message);

                if (message.type === 'notification') {
                    setNotifications((prev) =>
                        dedupeAndSort([message.data, ...(prev ?? [])])
                    );

                    if (!message.data.isRead) {
                        setUnreadCount((prev) => prev + 1);
                    }

                    if (Notification.permission === 'granted') {
                        new Notification(message.data.content, {
                            icon: '/notification-icon.png',
                            tag: `notification-${message.data.id}`,
                        });
                    }
                } else if (message.type === 'chat_message') {
                    const data = message.data;
                    chatListenersRef.current.forEach((cb) => {
                        try {
                            cb(data);
                        } catch (err) {
                            console.error('chat listener error', err);
                        }
                    });
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

    const chatListenersRef = React.useRef(new Set<(e: any) => void>());

    const addChatListener = useCallback((cb: (e: any) => void) => {
        chatListenersRef.current.add(cb);
        return () => {
            chatListenersRef.current.delete(cb);
        };
    }, []);

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
        setNotifications((prev) =>
            dedupeAndSort([notification, ...(prev ?? [])])
        );
        if (!notification.isRead) {
            setUnreadCount((prev) => prev + 1);
        }
    }, []);

    const updateNotifications = useCallback(
        (
            updater:
                | NotificationData[]
                | ((prev: NotificationData[]) => NotificationData[])
        ) => {
            if (typeof updater === 'function') {
                setNotifications((prev) => {
                    const result = (
                        updater as (
                            prev: NotificationData[]
                        ) => NotificationData[]
                    )(prev ?? []);
                    return dedupeAndSort(result ?? []);
                });
            } else {
                setNotifications(dedupeAndSort(updater ?? []));
            }
        },
        []
    );

    const setNotificationsMethod = useCallback(
        (newNotifications: NotificationData[]) => {
            setNotifications(newNotifications);
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
            setNotifications: setNotificationsMethod,
            addChatListener,
        }),
        [
            isConnected,
            notifications,
            unreadCount,
            addNotification,
            updateNotifications,
            setNotificationsMethod,
            addChatListener,
        ]
    );

    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
};
