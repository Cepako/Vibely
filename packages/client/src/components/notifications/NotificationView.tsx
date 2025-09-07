import React, { useEffect, useState, useMemo } from 'react';
import { useNotifications } from './hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import {
    IconBell,
    IconCheck,
    IconRefresh,
    IconSearch,
} from '@tabler/icons-react';
import type { NotificationType } from '../../types/notification';
import NotificationTypeSelect from './NotificationTypeSelect';

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
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [filterType, setFilterType] = useState<'all' | NotificationType>(
        'all'
    );

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleLoadMore = async () => {
        setLoadingMore(true);
        await fetchNotifications(20, notifications.length);
        setLoadingMore(false);
    };

    const hasUnreadNotifications = notifications.some((n) => !n.isRead);

    const filteredNotifications = useMemo(() => {
        const q = query.trim().toLowerCase();
        const list = notifications || [];
        const filtered = list.filter((n) => {
            if (filter === 'unread' && n.isRead) return false;
            if (filterType !== 'all' && n.type !== filterType) return false;
            if (!q) return true;
            return (
                n.content.toLowerCase().includes(q) ||
                (n.type || '').toLowerCase().includes(q)
            );
        });
        return filtered.sort((a, b) => Number(a.isRead) - Number(b.isRead));
    }, [notifications, query, filter, filterType]);

    return (
        <div className='bg-primary-50 mx-auto min-h-screen w-full overflow-y-auto'>
            <div className='sticky top-0 z-10 border-b border-slate-200 bg-white p-4'>
                <div className='flex items-center justify-between pr-[100px]'>
                    <div className='text-primary-500 flex items-center gap-2'>
                        <IconBell size={32} />
                        <h1 className='py-2 text-3xl font-bold'>
                            Notifications
                        </h1>
                        <div
                            className={`ml-2 h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                            title={isConnected ? 'Connected' : 'Disconnected'}
                        />
                    </div>

                    <div className='flex items-center gap-3'>
                        <div className='focus:border-primary-400 focus-within:ring-primary-400 flex items-center rounded-lg border border-slate-200 px-2 py-1 focus-within:ring-1'>
                            <IconSearch size={16} className='text-slate-400' />
                            <input
                                className='ml-2 w-60 bg-transparent text-sm outline-none'
                                placeholder='Search notifications'
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() =>
                                setFilter((f) =>
                                    f === 'all' ? 'unread' : 'all'
                                )
                            }
                            aria-pressed={filter === 'unread'}
                            className='flex cursor-pointer items-center gap-2 rounded-lg text-sm'
                            title={
                                filter === 'unread'
                                    ? 'Showing unread only. Click to show all.'
                                    : 'Showing all. Click to show unread only.'
                            }
                        >
                            <span
                                className={
                                    filter === 'unread'
                                        ? 'font-medium text-rose-600'
                                        : 'text-slate-700'
                                }
                            >
                                {filter === 'unread' ? 'Unread' : 'All'}
                            </span>
                            <span
                                className={`ml-1 inline-flex h-5 w-10 items-center rounded-full p-0.5 transition-colors ${
                                    filter === 'unread'
                                        ? 'bg-primary-500'
                                        : 'bg-slate-200'
                                }`}
                            >
                                <span
                                    className={`h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                        filter === 'unread'
                                            ? 'translate-x-5'
                                            : 'translate-x-0'
                                    }`}
                                />
                            </span>
                        </button>
                        <NotificationTypeSelect
                            filterType={filterType}
                            setFilterType={setFilterType}
                        />
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
            </div>

            <div className='flex w-full flex-col items-center justify-center px-[100px] pb-4'>
                {loading && notifications.length === 0 ? (
                    <div className='flex items-center justify-center p-8'>
                        <IconRefresh
                            className='animate-spin text-slate-400'
                            size={24}
                        />
                        <span className='ml-2 text-slate-500'>
                            Loading notifications...
                        </span>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className='p-8 text-center'>
                        <IconBell
                            size={48}
                            className='mx-auto mb-4 text-slate-300'
                        />
                        <h3 className='mb-2 text-lg font-medium text-slate-900'>
                            No notifications
                        </h3>
                        <p className='text-slate-500'>
                            Try a different filter or come back later.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className='divide-y divide-slate-100 overflow-y-auto'>
                            {filteredNotifications.map((notification) => (
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
                                    className='text-primary-600 hover:text-primary-800 cursor-pointer px-4 py-2 text-sm transition-colors disabled:text-slate-400'
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
