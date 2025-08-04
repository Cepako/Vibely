import { useState, useCallback } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { useWebSocketContext } from '../../providers/WebSocketProvider';

const API_BASE = '/api';

export const useNotifications = () => {
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const {
        isConnected,
        notifications,
        unreadCount,
        setUnreadCount,
        updateNotifications,
    } = useWebSocketContext();

    const fetchNotifications = useCallback(
        async (limit = 20, offset = 0) => {
            if (!user?.id) return;

            setLoading(true);
            try {
                const response = await fetch(
                    `${API_BASE}/notification?limit=${limit}&offset=${offset}`,
                    {
                        credentials: 'include',
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (offset === 0) {
                    updateNotifications(() => data.notifications || []);
                } else {
                    updateNotifications((prev) => [
                        ...prev,
                        ...(data.notifications || []),
                    ]);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        },
        [user?.id, updateNotifications]
    );

    const fetchUnreadCount = useCallback(async () => {
        if (!user?.id) return;

        try {
            const response = await fetch(
                `${API_BASE}/notification/unread-count`,
                {
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, [user?.id, setUnreadCount]);

    const markAsRead = useCallback(
        async (notificationId: number) => {
            try {
                const response = await fetch(
                    `${API_BASE}/notification/${notificationId}/read`,
                    {
                        method: 'PATCH',
                        credentials: 'include',
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                updateNotifications((prev) =>
                    prev.map((notification) =>
                        notification.id === notificationId
                            ? { ...notification, isRead: true }
                            : notification
                    )
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        },
        [updateNotifications, setUnreadCount]
    );

    const markAllAsRead = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/notification/read-all`, {
                method: 'PATCH',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            updateNotifications((prev) =>
                prev.map((notification) => ({ ...notification, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, [updateNotifications, setUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        isConnected,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
    };
};
