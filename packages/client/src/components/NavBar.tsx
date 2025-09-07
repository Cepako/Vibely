import { useNavigate } from '@tanstack/react-router';
import VibelyIcon from './ui/VibelyIcon';
import { cn } from '../utils/utils';
import {
    IconBell,
    IconCalendarWeek,
    IconCompass,
    IconHome,
    IconLogout,
    IconMessages,
} from '@tabler/icons-react';
import { useAuth } from './auth/AuthProvider';
import { useCurrentUser } from './hooks/useCurrentUser';
import { useNotifications } from './notificaitons/hooks/useNotifications';
import { useEffect } from 'react';
import UserAvatar from './ui/UserAvatar';

interface NavBarProps {
    view?: 'home' | 'messages' | 'events' | 'explore' | 'me' | 'notifications';
}

export default function NavBar({ view }: NavBarProps) {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { data, isLoading } = useCurrentUser();
    const { fetchUnreadCount, unreadCount } = useNotifications();

    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    const defaultStyles =
        'relative rounded-lg px-3 py-4 cursor-pointer hover:bg-slate-200 duration-200 flex items-center gap-2';
    const activeStyles = 'text-primary-500 bg-slate-200';

    const handleNavigate = (view: string) => navigate({ to: `/${view}` });
    const userId = user?.id ? user.id.toString() : '1';

    return (
        <div className='flex h-screen max-w-[290px] min-w-[290px] flex-col border-r border-slate-300 bg-white p-5'>
            <h1
                className='text-primary-500 flex cursor-pointer items-center text-5xl font-bold'
                onClick={() => handleNavigate('home')}
            >
                <VibelyIcon className='h-14 w-14' /> Vibely
            </h1>
            <div className='flex flex-col gap-5 pt-10 text-xl font-bold text-slate-400'>
                <div
                    className={cn(
                        defaultStyles,
                        view === 'home' && activeStyles
                    )}
                    onClick={() => handleNavigate('home')}
                >
                    <IconHome />
                    Home
                </div>
                <div
                    className={cn(
                        defaultStyles,
                        view === 'messages' && activeStyles
                    )}
                    onClick={() => handleNavigate('messages')}
                >
                    <IconMessages />
                    Messages
                </div>
                <div
                    className={cn(
                        defaultStyles,
                        view === 'notifications' && activeStyles
                    )}
                    onClick={() => handleNavigate('notifications')}
                >
                    <IconBell />
                    Notifications
                    {unreadCount > 0 && (
                        <span className='bg-primary-500 absolute top-[50%] right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-xs text-white'>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
                <div
                    className={cn(
                        defaultStyles,
                        view === 'events' && activeStyles
                    )}
                    onClick={() => handleNavigate('events')}
                >
                    <IconCalendarWeek />
                    Events
                </div>
                <div
                    className={cn(
                        defaultStyles,
                        view === 'explore' && activeStyles
                    )}
                    onClick={() => handleNavigate('explore')}
                >
                    <IconCompass /> Explore
                </div>
            </div>
            <div className='mt-auto mb-8 flex flex-col items-center gap-2'>
                {!isLoading && data && (
                    <div
                        className={cn(
                            'flex cursor-pointer items-center gap-2 rounded-xl p-3 text-xl font-semibold duration-200',
                            view === 'me' && activeStyles
                        )}
                        onClick={() => {
                            navigate({
                                to: '/profile/$profileId',
                                params: { profileId: userId },
                            });
                        }}
                    >
                        <UserAvatar user={data} />
                        <div>
                            {data.name} {data.surname}
                        </div>
                    </div>
                )}

                <div
                    className='justify-centergap-1 hover:text-primary-500 flex cursor-pointer items-center rounded-md px-3 py-2 text-xl duration-200'
                    onClick={() => {
                        logout();
                        setTimeout(() => navigate({ to: '/' }), 100);
                    }}
                >
                    <IconLogout size={20} /> Logout
                </div>
            </div>
        </div>
    );
}
