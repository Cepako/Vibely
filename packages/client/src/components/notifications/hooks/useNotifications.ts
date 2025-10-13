import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { useNotificationWebSocketContext } from '../../providers/NotificationWebSocketProvider';
import { apiClient } from '../../../lib/apiClient';

export const useNotifications = () => {
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const {
        isConnected,
        notifications,
        unreadCount,
        setUnreadCount,
        updateNotifications,
        setNotifications,
    } = useNotificationWebSocketContext();

    const notificationsRef = useRef<typeof notifications>(notifications);
    useEffect(() => {
        notificationsRef.current = notifications;
    }, [notifications]);

    const fetchNotifications = useCallback(
        async (
            limit = 20,
            offset = 0,
            type?: string | 'all',
            unreadOnly = false,
            search?: string
        ) => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.set('limit', String(limit));
                params.set('offset', String(offset));
                if (type && type !== 'all') params.set('type', type);
                if (unreadOnly) params.set('unread', 'true');
                if (search && search.trim()) params.set('q', search.trim());

                const payload = await apiClient.get(
                    `/notification?${params.toString()}`
                );

                const data = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.notifications)
                      ? payload.notifications
                      : [];

                const current = notificationsRef.current ?? [];
                const merged = offset === 0 ? data : [...current, ...data];

                const map = new Map<number, (typeof merged)[0]>();
                for (const n of merged) {
                    const existing = map.get(n.id);
                    if (!existing) map.set(n.id, n);
                    else {
                        if (
                            new Date(n.createdAt).getTime() >
                            new Date(existing.createdAt).getTime()
                        ) {
                            map.set(n.id, n);
                        }
                    }
                }
                const dedupedSorted = Array.from(map.values()).sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );

                updateNotifications?.(dedupedSorted);
                notificationsRef.current = dedupedSorted;
            } catch (err) {
                console.error('fetchNotifications failed', err);
            } finally {
                setLoading(false);
            }
        },
        [updateNotifications, setNotifications]
    );

    const fetchUnreadCount = useCallback(async () => {
        if (!user?.id) return;

        try {
            const data = await apiClient.get('/notification/unread-count');
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, [user?.id, setUnreadCount]);

    const markAsRead = useCallback(
        async (notificationId: number) => {
            try {
                await apiClient.patch(`/notification/${notificationId}/read`);

                const current = notificationsRef.current ?? [];
                const updated = current.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                );

                setNotifications(updated);
                updateNotifications?.(updated);

                const notification = current.find(
                    (n) => n.id === notificationId
                );
                if (notification && !notification.isRead) {
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                }
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        },
        [updateNotifications, setUnreadCount, setNotifications]
    );

    const markAllAsRead = useCallback(async () => {
        try {
            await apiClient.patch('/notification/read-all');

            const current = notificationsRef.current ?? [];
            const updated = current.map((notification) => ({
                ...notification,
                isRead: true,
            }));
            setNotifications(updated);
            updateNotifications?.(updated);
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, [updateNotifications, setUnreadCount, setNotifications]);

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
