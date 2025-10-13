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
import { useQueryClient } from '@tanstack/react-query';

interface NotificationWebSocketContextType {
    isConnected: boolean;
    notifications: NotificationData[];
    unreadCount: number;
    unreadMessagesCount: number;
    addNotification: (notification: NotificationData) => void;
    setUnreadCount: (count: number | ((prev: number) => number)) => void;
    setUnreadMessagesCount: (
        count: number | ((prev: number) => number)
    ) => void;
    updateNotifications: (
        updater:
            | NotificationData[]
            | ((prev: NotificationData[]) => NotificationData[])
    ) => void;
    setNotifications: (notifications: NotificationData[]) => void;
    onlineUsers: number[];
    isUserOnline: (userId?: number | null) => boolean;
}

const NotificationWebSocketContext =
    createContext<NotificationWebSocketContextType | null>(null);

export const useNotificationWebSocketContext = () => {
    const context = useContext(NotificationWebSocketContext);
    if (!context) {
        throw new Error(
            'useNotificationWebSocketContext must be used within WebSocketProvider'
        );
    }
    return context;
};

interface NotificationWebSocketProviderProps {
    children: React.ReactNode;
}

export const NotificationWebSocketProvider: React.FC<
    NotificationWebSocketProviderProps
> = ({ children }) => {
    const { user, logout } = useAuth();
    const queryClient = useQueryClient();
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const [onlineUsers, setOnlineUsers] = React.useState<number[]>([]);

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

    const isUserOnline = useCallback(
        (userId?: number | null) => {
            if (!userId) return false;
            return onlineUsers.includes(userId);
        },
        [onlineUsers]
    );

    const { isConnected } = useWebSocket({
        url: websocketUrl || '',
        enabled: !!websocketUrl,
        onMessage: useCallback(
            (message: any) => {
                console.log('Notification WebSocket message:', message);

                if (message.type === 'presence_init') {
                    setOnlineUsers(
                        Array.isArray(message.data) ? message.data : []
                    );
                    return;
                }

                if (message.type === 'presence') {
                    const { userId, isOnline } = message.data || {};
                    setOnlineUsers((prev) => {
                        if (isOnline) {
                            if (prev.includes(userId)) return prev;
                            return [userId, ...prev];
                        } else {
                            return prev.filter((id) => id !== userId);
                        }
                    });
                    return;
                }

                if (message.type === 'new_message') {
                    setUnreadMessagesCount((prev) => prev + 1);

                    queryClient.invalidateQueries({
                        queryKey: ['conversations'],
                    });

                    return;
                }

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
            [logout, queryClient, dedupeAndSort]
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

    const addNotification = useCallback(
        (notification: NotificationData) => {
            setNotifications((prev) =>
                dedupeAndSort([notification, ...(prev ?? [])])
            );
            if (!notification.isRead) {
                setUnreadCount((prev) => prev + 1);
            }
        },
        [dedupeAndSort]
    );

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
        [dedupeAndSort]
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
            unreadMessagesCount,
            addNotification,
            setUnreadCount,
            setUnreadMessagesCount,
            updateNotifications,
            setNotifications: setNotificationsMethod,
            onlineUsers,
            isUserOnline,
        }),
        [
            isConnected,
            notifications,
            unreadCount,
            unreadMessagesCount,
            addNotification,
            updateNotifications,
            setNotificationsMethod,
            onlineUsers,
            isUserOnline,
        ]
    );

    return (
        <NotificationWebSocketContext.Provider value={contextValue}>
            {children}
        </NotificationWebSocketContext.Provider>
    );
};
