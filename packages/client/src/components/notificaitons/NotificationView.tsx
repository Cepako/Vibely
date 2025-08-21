import React, { useEffect, useState } from 'react';
import { useNotifications } from './hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { IconBell, IconCheck, IconRefresh } from '@tabler/icons-react';

export const NotificationView: React.FC = () => {
    const {
        notifications,
        loading,
        isConnected,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleLoadMore = async () => {
        setLoadingMore(true);
        await fetchNotifications(20, notifications.length);
        setLoadingMore(false);
    };

    const hasUnreadNotifications = notifications.some((n) => !n.isRead);

    return (
        <div className='mx-auto min-h-screen w-[800px] overflow-y-auto bg-white'>
            <div className='sticky top-0 z-10 border-b border-gray-200 bg-white p-4'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                        <IconBell size={24} className='text-gray-700' />
                        <h1 className='text-xl font-semibold text-gray-900'>
                            Notifications
                        </h1>
                        <div
                            className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                            title={isConnected ? 'Connected' : 'Disconnected'}
                        />
                    </div>

                    {hasUnreadNotifications && (
                        <button
                            onClick={markAllAsRead}
                            className='text-primary-600 hover:text-primary-800 flex cursor-pointer items-center space-x-1 text-sm transition-colors'
                        >
                            <IconCheck size={16} />
                            <span>Mark all as read</span>
                        </button>
                    )}
                </div>
            </div>

            <div className='pb-4'>
                {loading && notifications.length === 0 ? (
                    <div className='flex items-center justify-center p-8'>
                        <IconRefresh
                            className='animate-spin text-gray-400'
                            size={24}
                        />
                        <span className='ml-2 text-gray-500'>
                            Loading notifications...
                        </span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className='p-8 text-center'>
                        <IconBell
                            size={48}
                            className='mx-auto mb-4 text-gray-300'
                        />
                        <h3 className='mb-2 text-lg font-medium text-gray-900'>
                            No notifications yet
                        </h3>
                        <p className='text-gray-500'>
                            When you have notifications, they'll show up here.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className='divide-y divide-gray-100 overflow-y-auto'>
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={markAsRead}
                                />
                            ))}
                        </div>

                        {notifications.length >= 20 && (
                            <div className='p-4 text-center'>
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className='text-primary-600 hover:text-primary-800 cursor-pointer px-4 py-2 text-sm transition-colors disabled:text-gray-400'
                                >
                                    {loadingMore
                                        ? 'Loading...'
                                        : 'Load more notifications'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
