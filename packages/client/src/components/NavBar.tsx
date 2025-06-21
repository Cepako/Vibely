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
    view: 'home' | 'messages' | 'events' | 'explore';
}

export default function NavBar({ view }: NavBarProps) {
    const navigate = useNavigate();

    const defaultStyles =
        'rounded-lg px-3 py-4 cursor-pointer hover:bg-slate-200 duration-200 flex items-center gap-2';
    const activeStyles = 'text-primary-500 bg-slate-200';

    const handleNavigate = (view: string) => navigate({ to: `/${view}` });

    return (
        <div className='flex h-screen flex-col overflow-hidden border-r border-slate-300 p-5'>
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
            <div className='mt-auto mb-8 flex cursor-pointer items-center gap-2 pt-52 text-xl font-semibold'>
                <div className='bg-primary-600 h-10 w-10 rounded-full' />
                John Smith
            </div>
        </div>
    );
}
