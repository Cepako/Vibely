import { useNavigate } from '@tanstack/react-router';
import VibelyIcon from './ui/VibelyIcon';
import { cn } from '../utils/utils';
import {
    IconCalendarWeek,
    IconCompass,
    IconHome,
    IconMessages,
} from '@tabler/icons-react';

interface NavBarProps {
    view?: 'home' | 'messages' | 'events' | 'explore' | 'me';
}

export default function NavBar({ view }: NavBarProps) {
    const navigate = useNavigate();

    const defaultStyles =
        'rounded-lg px-3 py-4 cursor-pointer hover:bg-slate-200 duration-200 flex items-center gap-2';
    const activeStyles = 'text-primary-500 bg-slate-200';

    const handleNavigate = (view: string) => navigate({ to: `/${view}` });

    return (
        <div className='flex h-screen min-w-[250px] flex-col border-r border-slate-300 bg-white p-5'>
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
            <div
                className={cn(
                    'mt-auto mb-8 flex cursor-pointer items-center gap-2 rounded-xl p-3 text-xl font-semibold duration-200',
                    view === 'me' && activeStyles
                )}
                onClick={() => {
                    navigate({ to: '/profile/$id', params: { id: '1' } });
                }}
            >
                <div className='h-10 w-10 overflow-hidden rounded-full border border-slate-200'>
                    <img
                        src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
                        alt='profile image'
                    />
                </div>
                <div>John Smith</div>
            </div>
        </div>
    );
}
